import { PrismaClient, AppointmentStatus } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Teleconsultation Service
 * Handles video consultation sessions with WebRTC integration
 */
export class TeleconsultationService {
  /**
   * Create a teleconsultation session for an appointment
   */
  async createSession(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        practitioner: true,
        cabinet: true,
      },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.type !== 'TELECONSULTATION') {
      throw new Error('Appointment type must be TELECONSULTATION');
    }

    // Generate unique session ID and room URL
    const sessionId = `tc_${crypto.randomBytes(16).toString('hex')}`;
    const roomToken = crypto.randomBytes(32).toString('hex');

    // In production, integrate with services like Twilio Video, Agora, Jitsi, etc.
    const roomUrl = `${process.env.FRONTEND_URL}/teleconsultation/room/${sessionId}`;

    const teleconsultation = await prisma.teleconsultation.create({
      data: {
        appointmentId,
        sessionId,
        roomUrl,
        roomToken,
        scheduledAt: appointment.startTime,
        status: 'SCHEDULED',
      },
      include: {
        appointment: {
          include: {
            patient: true,
            practitioner: true,
          },
        },
      },
    });

    return teleconsultation;
  }

  /**
   * Join a teleconsultation session
   */
  async joinSession(sessionId: string, userType: 'patient' | 'practitioner') {
    const teleconsultation = await prisma.teleconsultation.findUnique({
      where: { sessionId },
      include: {
        appointment: {
          include: {
            patient: true,
            practitioner: true,
          },
        },
      },
    });

    if (!teleconsultation) {
      throw new Error('Teleconsultation session not found');
    }

    const now = new Date();
    const updateData: any = {
      status: 'IN_PROGRESS',
    };

    if (userType === 'patient') {
      updateData.patientJoinedAt = now;
      updateData.patientJoined = true;
    } else {
      updateData.practitionerJoinedAt = now;
      updateData.practitionerJoined = true;

      // Start the session when practitioner joins
      if (!teleconsultation.startedAt) {
        updateData.startedAt = now;
      }
    }

    // Check if both joined - update appointment status
    if (teleconsultation.patientJoinedAt && teleconsultation.practitionerJoinedAt) {
      await prisma.appointment.update({
        where: { id: teleconsultation.appointmentId },
        data: { status: 'IN_CONSULTATION' },
      });
    }

    const updated = await prisma.teleconsultation.update({
      where: { sessionId },
      data: updateData,
      include: {
        appointment: {
          include: {
            patient: true,
            practitioner: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * End teleconsultation session
   */
  async endSession(sessionId: string) {
    const teleconsultation = await prisma.teleconsultation.findUnique({
      where: { sessionId },
    });

    if (!teleconsultation) {
      throw new Error('Teleconsultation session not found');
    }

    const now = new Date();
    const duration = teleconsultation.startedAt
      ? Math.floor((now.getTime() - teleconsultation.startedAt.getTime()) / 60000)
      : 0;

    const updated = await prisma.teleconsultation.update({
      where: { sessionId },
      data: {
        endedAt: now,
        duration,
        status: 'COMPLETED',
      },
    });

    // Update appointment status
    await prisma.appointment.update({
      where: { id: teleconsultation.appointmentId },
      data: {
        status: 'COMPLETED',
        completedAt: now,
      },
    });

    return updated;
  }

  /**
   * Update connection quality
   */
  async updateConnectionQuality(sessionId: string, quality: string) {
    return await prisma.teleconsultation.update({
      where: { sessionId },
      data: { connectionQuality: quality },
    });
  }

  /**
   * Log technical issue
   */
  async logTechnicalIssue(sessionId: string, issue: any) {
    const teleconsultation = await prisma.teleconsultation.findUnique({
      where: { sessionId },
    });

    if (!teleconsultation) {
      throw new Error('Teleconsultation session not found');
    }

    const existingIssues = teleconsultation.techIssues
      ? JSON.parse(teleconsultation.techIssues)
      : [];

    const updatedIssues = [
      ...existingIssues,
      {
        ...issue,
        timestamp: new Date(),
      },
    ];

    return await prisma.teleconsultation.update({
      where: { sessionId },
      data: {
        techIssues: JSON.stringify(updatedIssues),
      },
    });
  }

  /**
   * Get teleconsultation by appointment ID
   */
  async getByAppointmentId(appointmentId: string) {
    return await prisma.teleconsultation.findUnique({
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
  }

  /**
   * Get teleconsultation statistics for a cabinet
   */
  async getStatistics(cabinetId: string, startDate: Date, endDate: Date) {
    const appointments = await prisma.appointment.findMany({
      where: {
        cabinetId,
        type: 'TELECONSULTATION',
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        teleconsultation: true,
      },
    });

    const total = appointments.length;
    const completed = appointments.filter((a) => a.status === 'COMPLETED').length;
    const cancelled = appointments.filter((a) => a.status === 'CANCELLED').length;
    const noShow = appointments.filter((a) => a.status === 'NO_SHOW').length;

    const totalDuration = appointments.reduce((sum, a) => {
      return sum + (a.teleconsultation?.duration || 0);
    }, 0);

    const averageDuration = total > 0 ? Math.round(totalDuration / total) : 0;

    return {
      total,
      completed,
      cancelled,
      noShow,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : '0',
      averageDuration,
    };
  }
}

export default new TeleconsultationService();
