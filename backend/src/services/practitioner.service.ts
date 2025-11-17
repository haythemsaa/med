import { PractitionerType } from '@prisma/client';
import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

export interface CreatePractitionerDTO {
  userId: string;
  cabinetId: string;
  firstName: string;
  lastName: string;
  title?: string;
  speciality: PractitionerType;
  specialityDetails?: string;
  licenseNumber?: string;
  orderNumber?: string;
  bio?: string;
  consultationFee?: number;
  teleconsultationFee?: number;
  allowTeleconsultation?: boolean;
  color?: string;
}

export interface UpdatePractitionerDTO extends Partial<CreatePractitionerDTO> {}

export class PractitionerService {
  async create(data: CreatePractitionerDTO) {
    const practitioner = await prisma.practitioner.create({
      data: {
        ...data,
        consultationFee: data.consultationFee || 0,
      },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    });

    logger.info(`Practitioner created: ${practitioner.id}`);
    return practitioner;
  }

  async findById(id: string) {
    const practitioner = await prisma.practitioner.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            isActive: true,
          },
        },
        schedules: {
          where: { isActive: true },
          orderBy: { dayOfWeek: 'asc' },
        },
        absences: {
          where: {
            endDate: { gte: new Date() },
          },
          orderBy: { startDate: 'asc' },
        },
        _count: {
          select: {
            appointments: true,
            consultations: true,
          },
        },
      },
    });

    if (!practitioner) {
      throw new NotFoundError('Practitioner not found');
    }

    return practitioner;
  }

  async findAll(filters: {
    cabinetId: string;
    speciality?: PractitionerType;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { cabinetId, page = 1, limit = 20, ...where } = filters;
    const skip = (page - 1) * limit;

    const [practitioners, total] = await Promise.all([
      prisma.practitioner.findMany({
        where: {
          cabinetId,
          ...where,
        },
        include: {
          user: {
            select: {
              email: true,
              isActive: true,
            },
          },
          _count: {
            select: {
              appointments: true,
              consultations: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.practitioner.count({
        where: {
          cabinetId,
          ...where,
        },
      }),
    ]);

    return {
      data: practitioners,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: UpdatePractitionerDTO) {
    const practitioner = await prisma.practitioner.update({
      where: { id },
      data,
    });

    logger.info(`Practitioner updated: ${practitioner.id}`);
    return practitioner;
  }

  async delete(id: string) {
    await prisma.practitioner.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info(`Practitioner deactivated: ${id}`);
  }

  async getSchedule(practitionerId: string) {
    return await prisma.schedule.findMany({
      where: {
        practitionerId,
        isActive: true,
      },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async setSchedule(practitionerId: string, schedules: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>) {
    // Delete existing schedules
    await prisma.schedule.deleteMany({
      where: { practitionerId },
    });

    // Create new schedules
    const created = await prisma.schedule.createMany({
      data: schedules.map(schedule => ({
        ...schedule,
        practitionerId,
        cabinetId: '', // Will be filled by trigger or app logic
      })),
    });

    logger.info(`Schedule updated for practitioner: ${practitionerId}`);
    return created;
  }

  async addAbsence(practitionerId: string, data: {
    startDate: Date;
    endDate: Date;
    reason?: string;
    isAllDay?: boolean;
  }) {
    const absence = await prisma.absence.create({
      data: {
        ...data,
        practitionerId,
        cabinetId: '', // Will be filled
      },
    });

    logger.info(`Absence added for practitioner: ${practitionerId}`);
    return absence;
  }

  async getStats(practitionerId: string) {
    const [totalPatients, totalConsultations, upcomingAppointments, todayAppointments] = await Promise.all([
      prisma.consultation.count({
        where: { practitionerId },
      }),
      prisma.consultation.count({
        where: { practitionerId },
      }),
      prisma.appointment.count({
        where: {
          practitionerId,
          status: 'SCHEDULED',
          startTime: { gte: new Date() },
        },
      }),
      prisma.appointment.count({
        where: {
          practitionerId,
          startTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
    ]);

    return {
      totalPatients,
      totalConsultations,
      upcomingAppointments,
      todayAppointments,
    };
  }
}

export default new PractitionerService();
