import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notification.service';

const prisma = new PrismaClient();

/**
 * Waiting Room Service
 * Manages virtual waiting room for teleconsultations
 */
export class WaitingRoomService {
  /**
   * Create a waiting room entry
   */
  async create(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        practitioner: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Estimate wait time based on current schedule
    const estimatedWaitTime = await this.calculateWaitTime(
      appointment.practitionerId,
      appointment.startTime
    );

    const waitingRoom = await prisma.waitingRoom.create({
      data: {
        appointmentId,
        estimatedWaitTime,
      },
    });

    return waitingRoom;
  }

  /**
   * Patient joins waiting room
   */
  async patientJoin(appointmentId: string) {
    const now = new Date();

    const waitingRoom = await prisma.waitingRoom.upsert({
      where: { appointmentId },
      create: {
        appointmentId,
        patientJoinedAt: now,
        patientReadyAt: now,
      },
      update: {
        patientJoinedAt: now,
        patientReadyAt: now,
      },
    });

    // Notify practitioner that patient is waiting
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        practitioner: {
          include: {
            user: true,
          },
        },
      },
    });

    if (appointment) {
      await NotificationService.sendNotification({
        type: 'EMAIL',
        recipientEmail: appointment.practitioner.user.email,
        recipientPhone: appointment.practitioner.user.phone || undefined,
        subject: 'Patient dans la salle d\'attente',
        message: `${appointment.patient.firstName} ${appointment.patient.lastName} est en salle d'attente virtuelle pour sa téléconsultation prévue à ${appointment.startTime.toLocaleTimeString()}.`,
      });

      await prisma.waitingRoom.update({
        where: { appointmentId },
        data: { practitionerNotifiedAt: now },
      });
    }

    return waitingRoom;
  }

  /**
   * Get waiting room status
   */
  async getStatus(appointmentId: string) {
    const waitingRoom = await prisma.waitingRoom.findUnique({
      where: { appointmentId },
      include: {
        appointment: {
          include: {
            patient: true,
            practitioner: true,
          },
        },
      },
    });

    if (!waitingRoom) {
      throw new Error('Waiting room not found');
    }

    // Calculate actual wait time
    const actualWaitTime = waitingRoom.patientJoinedAt
      ? Math.floor((new Date().getTime() - waitingRoom.patientJoinedAt.getTime()) / 60000)
      : 0;

    return {
      ...waitingRoom,
      actualWaitTime,
    };
  }

  /**
   * Get all patients in waiting room for a practitioner
   */
  async getPractitionerWaitingRoom(practitionerId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const waitingRooms = await prisma.waitingRoom.findMany({
      where: {
        appointment: {
          practitionerId,
          startTime: {
            gte: today,
          },
          status: {
            in: ['SCHEDULED', 'CONFIRMED'],
          },
        },
        patientJoinedAt: {
          not: null,
        },
      },
      include: {
        appointment: {
          include: {
            patient: true,
          },
        },
      },
      orderBy: {
        patientJoinedAt: 'asc',
      },
    });

    return waitingRooms.map((wr) => ({
      ...wr,
      waitTime: wr.patientJoinedAt
        ? Math.floor((now.getTime() - wr.patientJoinedAt.getTime()) / 60000)
        : 0,
    }));
  }

  /**
   * Calculate estimated wait time
   */
  private async calculateWaitTime(practitionerId: string, appointmentTime: Date): Promise<number> {
    const now = new Date();

    // Get current and upcoming appointments for this practitioner
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        practitionerId,
        startTime: {
          gte: now,
          lt: appointmentTime,
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED', 'IN_CONSULTATION'],
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Calculate total expected time
    let totalMinutes = 0;
    upcomingAppointments.forEach((apt) => {
      totalMinutes += apt.duration;
    });

    // Add buffer of 5 minutes per appointment for transitions
    totalMinutes += upcomingAppointments.length * 5;

    return totalMinutes;
  }

  /**
   * Update estimated wait time
   */
  async updateWaitTime(appointmentId: string, estimatedWaitTime: number) {
    return await prisma.waitingRoom.update({
      where: { appointmentId },
      data: { estimatedWaitTime },
    });
  }

  /**
   * Clear waiting room (when consultation starts)
   */
  async clear(appointmentId: string) {
    return await prisma.waitingRoom.delete({
      where: { appointmentId },
    });
  }
}

export default new WaitingRoomService();
