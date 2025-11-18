import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Advanced Agenda Settings Service
 * Advanced scheduling features (Doctolib-like)
 * - Multiple locations
 * - Parallel consultations (doublement)
 * - Slot types by act type
 * - Delay notifications
 */
export class AdvancedAgendaSettingsService {
  /**
   * Create or update settings
   */
  async createOrUpdate(data: {
    practitionerId: string;
    cabinetId: string;
    allowMultipleLocations?: boolean;
    locations?: any;
    allowParallelConsultations?: boolean;
    maxParallelSlots?: number;
    slotTypesByAct?: any;
    enableDelayNotifications?: boolean;
    delayThresholdMinutes?: number;
    trackOnlineBookingRate?: boolean;
    trackNewPatientRate?: boolean;
    trackNoShowRate?: boolean;
  }) {
    const existing = await prisma.advancedAgendaSettings.findUnique({
      where: { practitionerId: data.practitionerId },
    });

    if (existing) {
      return await prisma.advancedAgendaSettings.update({
        where: { practitionerId: data.practitionerId },
        data,
      });
    }

    return await prisma.advancedAgendaSettings.create({
      data,
    });
  }

  /**
   * Get settings
   */
  async get(practitionerId: string) {
    return await prisma.advancedAgendaSettings.findUnique({
      where: { practitionerId },
    });
  }

  /**
   * Enable multiple locations
   */
  async enableMultipleLocations(
    practitionerId: string,
    locations: Array<{
      name: string;
      address: string;
      slots: any[];
    }>
  ) {
    return await prisma.advancedAgendaSettings.update({
      where: { practitionerId },
      data: {
        allowMultipleLocations: true,
        locations,
      },
    });
  }

  /**
   * Enable parallel consultations
   */
  async enableParallelConsultations(practitionerId: string, maxParallelSlots: number) {
    return await prisma.advancedAgendaSettings.update({
      where: { practitionerId },
      data: {
        allowParallelConsultations: true,
        maxParallelSlots,
      },
    });
  }

  /**
   * Set slot types by act
   */
  async setSlotTypesByAct(
    practitionerId: string,
    slotTypesByAct: {
      [actType: string]: number; // duration in minutes
    }
  ) {
    return await prisma.advancedAgendaSettings.update({
      where: { practitionerId },
      data: { slotTypesByAct },
    });
  }

  /**
   * Enable delay notifications
   */
  async enableDelayNotifications(practitionerId: string, thresholdMinutes: number = 15) {
    return await prisma.advancedAgendaSettings.update({
      where: { practitionerId },
      data: {
        enableDelayNotifications: true,
        delayThresholdMinutes: thresholdMinutes,
      },
    });
  }

  /**
   * Get cabinet settings
   */
  async getCabinetSettings(cabinetId: string) {
    return await prisma.advancedAgendaSettings.findMany({
      where: { cabinetId },
      include: {
        practitioner: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  /**
   * Delete settings
   */
  async delete(practitionerId: string) {
    return await prisma.advancedAgendaSettings.delete({
      where: { practitionerId },
    });
  }
}

export default new AdvancedAgendaSettingsService();
