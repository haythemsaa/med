import { PrismaClient, ProtocolStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Care Protocol Service
 * Shared care protocols (Doctolib-like)
 * - Link to RCP meetings
 * - Validation workflow
 * - Follow-up schedules
 */
export class CareProtocolService {
  /**
   * Create protocol
   */
  async create(data: {
    cabinetId: string;
    patientId?: string;
    meetingId?: string;
    title: string;
    description: string;
    pathology?: string;
    objectives: string;
    steps: any;
    medications?: any;
    followUpSchedule?: any;
    startDate: Date;
    endDate?: Date;
    createdBy: string;
  }) {
    return await prisma.careProtocol.create({
      data: {
        ...data,
        status: 'DRAFT',
      },
    });
  }

  /**
   * Validate protocol
   */
  async validate(protocolId: string, validatorId: string) {
    return await prisma.careProtocol.update({
      where: { id: protocolId },
      data: {
        status: 'ACTIVE',
        validatedBy: validatorId,
        validatedAt: new Date(),
      },
    });
  }

  /**
   * Update protocol
   */
  async update(protocolId: string, data: any) {
    return await prisma.careProtocol.update({
      where: { id: protocolId },
      data,
    });
  }

  /**
   * Complete protocol
   */
  async complete(protocolId: string) {
    return await prisma.careProtocol.update({
      where: { id: protocolId },
      data: {
        status: 'COMPLETED',
        endDate: new Date(),
      },
    });
  }

  /**
   * Suspend protocol
   */
  async suspend(protocolId: string) {
    return await prisma.careProtocol.update({
      where: { id: protocolId },
      data: { status: 'SUSPENDED' },
    });
  }

  /**
   * Get patient protocols
   */
  async getPatientProtocols(patientId: string, activeOnly: boolean = false) {
    return await prisma.careProtocol.findMany({
      where: {
        patientId,
        ...(activeOnly && { status: 'ACTIVE' }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get cabinet protocols
   */
  async getCabinetProtocols(cabinetId: string, filters?: { status?: ProtocolStatus }) {
    return await prisma.careProtocol.findMany({
      where: {
        cabinetId,
        ...(filters?.status && { status: filters.status }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get protocols from meeting
   */
  async getMeetingProtocols(meetingId: string) {
    return await prisma.careProtocol.findMany({
      where: { meetingId },
    });
  }

  /**
   * Delete protocol
   */
  async delete(protocolId: string) {
    return await prisma.careProtocol.delete({
      where: { id: protocolId },
    });
  }

  /**
   * Get protocol statistics
   */
  async getStatistics(cabinetId: string) {
    const protocols = await prisma.careProtocol.findMany({
      where: { cabinetId },
    });

    const byStatus: any = {};
    protocols.forEach((protocol) => {
      if (!byStatus[protocol.status]) byStatus[protocol.status] = 0;
      byStatus[protocol.status]++;
    });

    return {
      total: protocols.length,
      active: protocols.filter((p) => p.status === 'ACTIVE').length,
      completed: protocols.filter((p) => p.status === 'COMPLETED').length,
      draft: protocols.filter((p) => p.status === 'DRAFT').length,
      validated: protocols.filter((p) => p.validatedAt !== null).length,
      byStatus,
    };
  }
}

export default new CareProtocolService();
