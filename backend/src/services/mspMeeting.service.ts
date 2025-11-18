import { PrismaClient, MeetingType, MeetingStatus, AttendanceStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * MSP Meeting Service
 * Multidisciplinary team meetings (Doctolib-like)
 * - RCP (Réunions de Concertation Pluridisciplinaire)
 * - Auto-suggest participants based on case
 * - Link to care protocols
 */
export class MSPMeetingService {
  /**
   * Create meeting
   */
  async create(data: {
    cabinetId: string;
    title: string;
    meetingType: MeetingType;
    description?: string;
    scheduledDate: Date;
    duration: number;
    location?: string;
    onlineLink?: string;
    organizerId: string;
    agenda?: string;
  }) {
    return await prisma.mSPMeeting.create({
      data: {
        ...data,
        status: 'SCHEDULED',
      },
    });
  }

  /**
   * Add participants
   */
  async addParticipants(
    meetingId: string,
    participants: Array<{
      userId: string;
      role?: string;
    }>
  ) {
    const data = participants.map((p) => ({
      meetingId,
      userId: p.userId,
      role: p.role,
      attendance: 'PENDING' as AttendanceStatus,
    }));

    return await prisma.meetingParticipant.createMany({
      data,
      skipDuplicates: true,
    });
  }

  /**
   * Suggest participants based on meeting type and case
   */
  async suggestParticipants(cabinetId: string, meetingType: MeetingType, caseDetails?: any) {
    // Get all practitioners in cabinet
    const practitioners = await prisma.practitioner.findMany({
      where: {
        cabinetId,
        isActive: true,
      },
      include: {
        user: true,
      },
    });

    // TODO: Implement smart suggestions based on:
    // - Meeting type (RCP needs specialists)
    // - Patient case (pathology-specific specialists)
    // - Historical attendance patterns
    // - Specialist availability

    return practitioners;
  }

  /**
   * Update attendance
   */
  async updateAttendance(participantId: string, attendance: AttendanceStatus) {
    return await prisma.meetingParticipant.update({
      where: { id: participantId },
      data: { attendance },
    });
  }

  /**
   * Start meeting
   */
  async startMeeting(meetingId: string) {
    return await prisma.mSPMeeting.update({
      where: { id: meetingId },
      data: { status: 'IN_PROGRESS' },
    });
  }

  /**
   * Complete meeting
   */
  async completeMeeting(
    meetingId: string,
    data: {
      minutes?: string;
      decisions?: string;
    }
  ) {
    return await prisma.mSPMeeting.update({
      where: { id: meetingId },
      data: {
        status: 'COMPLETED',
        ...data,
      },
    });
  }

  /**
   * Get meeting details
   */
  async getById(meetingId: string) {
    return await prisma.mSPMeeting.findUnique({
      where: { id: meetingId },
      include: {
        participants: {
          include: {
            user: {
              include: {
                practitioner: true,
              },
            },
          },
        },
        careProtocols: true,
      },
    });
  }

  /**
   * Get cabinet meetings
   */
  async getCabinetMeetings(
    cabinetId: string,
    filters?: {
      meetingType?: MeetingType;
      status?: MeetingStatus;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    return await prisma.mSPMeeting.findMany({
      where: {
        cabinetId,
        ...(filters?.meetingType && { meetingType: filters.meetingType }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.startDate &&
          filters?.endDate && {
            scheduledDate: {
              gte: filters.startDate,
              lte: filters.endDate,
            },
          }),
      },
      include: {
        participants: true,
      },
      orderBy: {
        scheduledDate: 'desc',
      },
    });
  }

  /**
   * Get user meetings
   */
  async getUserMeetings(userId: string) {
    const participants = await prisma.meetingParticipant.findMany({
      where: { userId },
      include: {
        meeting: true,
      },
      orderBy: {
        meeting: {
          scheduledDate: 'desc',
        },
      },
    });

    return participants.map((p) => p.meeting);
  }

  /**
   * Delete meeting
   */
  async delete(meetingId: string) {
    return await prisma.mSPMeeting.delete({
      where: { id: meetingId },
    });
  }
}

export default new MSPMeetingService();
