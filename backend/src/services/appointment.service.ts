import { AppointmentType, AppointmentStatus } from '@prisma/client';
import prisma from '../config/database';
import { NotFoundError, AppError } from '../utils/errors';
import logger from '../utils/logger';

export interface CreateAppointmentDTO {
  cabinetId: string;
  practitionerId: string;
  patientId: string;
  roomId?: string;
  type: AppointmentType;
  startTime: Date;
  duration: number;
  reason?: string;
  notes?: string;
  isOnlineBooking?: boolean;
}

export interface UpdateAppointmentDTO {
  status?: AppointmentStatus;
  startTime?: Date;
  duration?: number;
  reason?: string;
  notes?: string;
  cancelReason?: string;
}

export class AppointmentService {
  async create(data: CreateAppointmentDTO) {
    // Check if practitioner is available
    const isAvailable = await this.checkAvailability(
      data.practitionerId,
      data.startTime,
      data.duration
    );

    if (!isAvailable) {
      throw new AppError('Practitioner not available at this time', 409);
    }

    // Calculate end time
    const endTime = new Date(data.startTime);
    endTime.setMinutes(endTime.getMinutes() + data.duration);

    const appointment = await prisma.appointment.create({
      data: {
        ...data,
        endTime,
        status: 'SCHEDULED',
      },
      include: {
        practitioner: {
          select: {
            firstName: true,
            lastName: true,
            speciality: true,
          },
        },
        patient: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    logger.info(`Appointment created: ${appointment.id}`);

    // TODO: Send confirmation notification
    return appointment;
  }

  async findById(id: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        practitioner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            speciality: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        room: true,
        consultation: true,
      },
    });

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    return appointment;
  }

  async findAll(filters: {
    cabinetId: string;
    practitionerId?: string;
    patientId?: string;
    status?: AppointmentStatus;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { cabinetId, page = 1, limit = 20, ...where } = filters;

    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          cabinetId,
          ...where,
          ...(filters.startDate && {
            startTime: {
              gte: filters.startDate,
              ...(filters.endDate && { lte: filters.endDate }),
            },
          }),
        },
        include: {
          practitioner: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          patient: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { startTime: 'asc' },
        skip,
        take: limit,
      }),
      prisma.appointment.count({
        where: {
          cabinetId,
          ...where,
        },
      }),
    ]);

    return {
      data: appointments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: UpdateAppointmentDTO) {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...data,
        ...(data.status === 'ARRIVED' && { arrivedAt: new Date() }),
        ...(data.status === 'IN_CONSULTATION' && {
          consultationStartedAt: new Date(),
        }),
        ...(data.status === 'COMPLETED' && { completedAt: new Date() }),
        ...(data.status === 'CANCELLED' && { cancelledAt: new Date() }),
      },
      include: {
        practitioner: true,
        patient: true,
      },
    });

    logger.info(`Appointment updated: ${appointment.id}`);

    return appointment;
  }

  async cancel(id: string, reason?: string) {
    return this.update(id, {
      status: 'CANCELLED',
      cancelReason: reason,
    });
  }

  async markAsNoShow(id: string) {
    const appointment = await this.update(id, {
      status: 'NO_SHOW',
    });

    // Increment patient no-show count
    await prisma.patient.update({
      where: { id: appointment.patientId },
      data: {
        noShowCount: { increment: 1 },
        lastNoShowAt: new Date(),
      },
    });

    return appointment;
  }

  async getAvailableSlots(
    practitionerId: string,
    date: Date,
    duration: number = 30
  ) {
    // Get practitioner's schedule for the day
    const dayOfWeek = date.getDay();

    const schedule = await prisma.schedule.findUnique({
      where: {
        practitionerId_dayOfWeek: {
          practitionerId,
          dayOfWeek,
        },
      },
    });

    if (!schedule || !schedule.isActive) {
      return [];
    }

    // Get existing appointments for the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        practitionerId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'],
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Generate available slots
    const slots = this.generateTimeSlots(
      schedule.startTime,
      schedule.endTime,
      duration,
      appointments
    );

    return slots;
  }

  private async checkAvailability(
    practitionerId: string,
    startTime: Date,
    duration: number
  ): Promise<boolean> {
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    // Check for overlapping appointments
    const overlapping = await prisma.appointment.findFirst({
      where: {
        practitionerId,
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'],
        },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    return !overlapping;
  }

  private generateTimeSlots(
    startTimeStr: string,
    endTimeStr: string,
    duration: number,
    bookedSlots: { startTime: Date; endTime: Date }[]
  ): string[] {
    const slots: string[] = [];
    const [startHour, startMinute] = startTimeStr.split(':').map(Number);
    const [endHour, endMinute] = endTimeStr.split(':').map(Number);

    let current = new Date();
    current.setHours(startHour, startMinute, 0, 0);

    const end = new Date();
    end.setHours(endHour, endMinute, 0, 0);

    while (current < end) {
      const slotEnd = new Date(current);
      slotEnd.setMinutes(slotEnd.getMinutes() + duration);

      // Check if slot is not booked
      const isBooked = bookedSlots.some(
        (booked) => current >= booked.startTime && current < booked.endTime
      );

      if (!isBooked) {
        const timeStr = `${String(current.getHours()).padStart(2, '0')}:${String(
          current.getMinutes()
        ).padStart(2, '0')}`;
        slots.push(timeStr);
      }

      current.setMinutes(current.getMinutes() + duration);
    }

    return slots;
  }

  async delete(id: string) {
    await prisma.appointment.delete({
      where: { id },
    });

    logger.info(`Appointment deleted: ${id}`);
  }
}

export default new AppointmentService();
