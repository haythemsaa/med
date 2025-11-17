import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Consent Service
 * Manages RGPD/GDPR consent records
 */
export class ConsentService {
  /**
   * Record a consent
   */
  async recordConsent(data: {
    patientId: string;
    consentType: string;
    consentGiven: boolean;
    consentText?: string;
    signatureData?: string;
    ipAddress?: string;
    userAgent?: string;
    expiryDate?: Date;
  }) {
    return await prisma.consentRecord.create({
      data: {
        patientId: data.patientId,
        consentType: data.consentType,
        consentGiven: data.consentGiven,
        consentText: data.consentText,
        signatureData: data.signatureData,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        expiryDate: data.expiryDate,
      },
    });
  }

  /**
   * Get all consents for a patient
   */
  async getPatientConsents(patientId: string) {
    return await prisma.consentRecord.findMany({
      where: { patientId },
      orderBy: {
        consentDate: 'desc',
      },
    });
  }

  /**
   * Get active consents for a patient
   */
  async getActiveConsents(patientId: string) {
    const now = new Date();

    return await prisma.consentRecord.findMany({
      where: {
        patientId,
        consentGiven: true,
        withdrawnAt: null,
        OR: [
          { expiryDate: null },
          { expiryDate: { gte: now } },
        ],
      },
      orderBy: {
        consentDate: 'desc',
      },
    });
  }

  /**
   * Check if patient has given specific consent
   */
  async hasConsent(patientId: string, consentType: string): Promise<boolean> {
    const now = new Date();

    const consent = await prisma.consentRecord.findFirst({
      where: {
        patientId,
        consentType,
        consentGiven: true,
        withdrawnAt: null,
        OR: [
          { expiryDate: null },
          { expiryDate: { gte: now } },
        ],
      },
      orderBy: {
        consentDate: 'desc',
      },
    });

    return !!consent;
  }

  /**
   * Withdraw consent
   */
  async withdrawConsent(consentId: string) {
    return await prisma.consentRecord.update({
      where: { id: consentId },
      data: {
        withdrawnAt: new Date(),
      },
    });
  }

  /**
   * Withdraw all consents of a specific type for a patient
   */
  async withdrawConsentByType(patientId: string, consentType: string) {
    return await prisma.consentRecord.updateMany({
      where: {
        patientId,
        consentType,
        withdrawnAt: null,
      },
      data: {
        withdrawnAt: new Date(),
      },
    });
  }

  /**
   * Get consent statistics for a cabinet
   */
  async getStatistics(cabinetId: string) {
    // Get all patients for this cabinet
    const patients = await prisma.patient.findMany({
      where: { cabinetId },
      select: { id: true },
    });

    const patientIds = patients.map((p) => p.id);

    const now = new Date();

    // Count consents by type
    const consentsByType = await prisma.consentRecord.groupBy({
      by: ['consentType'],
      where: {
        patientId: { in: patientIds },
        consentGiven: true,
        withdrawnAt: null,
        OR: [
          { expiryDate: null },
          { expiryDate: { gte: now } },
        ],
      },
      _count: true,
    });

    const totalConsents = await prisma.consentRecord.count({
      where: {
        patientId: { in: patientIds },
      },
    });

    const activeConsents = await prisma.consentRecord.count({
      where: {
        patientId: { in: patientIds },
        consentGiven: true,
        withdrawnAt: null,
        OR: [
          { expiryDate: null },
          { expiryDate: { gte: now } },
        ],
      },
    });

    const withdrawnConsents = await prisma.consentRecord.count({
      where: {
        patientId: { in: patientIds },
        withdrawnAt: { not: null },
      },
    });

    return {
      totalConsents,
      activeConsents,
      withdrawnConsents,
      byType: consentsByType.map((c) => ({
        type: c.consentType,
        count: c._count,
      })),
    };
  }

  /**
   * Get patients without specific consent
   */
  async getPatientsWithoutConsent(cabinetId: string, consentType: string) {
    const now = new Date();

    // Get all patients
    const allPatients = await prisma.patient.findMany({
      where: { cabinetId },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    // Get patients with active consent
    const patientsWithConsent = await prisma.consentRecord.findMany({
      where: {
        patientId: { in: allPatients.map((p) => p.id) },
        consentType,
        consentGiven: true,
        withdrawnAt: null,
        OR: [
          { expiryDate: null },
          { expiryDate: { gte: now } },
        ],
      },
      select: { patientId: true },
    });

    const patientIdsWithConsent = new Set(patientsWithConsent.map((c) => c.patientId));

    return allPatients.filter((p) => !patientIdsWithConsent.has(p.id));
  }

  /**
   * Get expiring consents (within next X days)
   */
  async getExpiringConsents(cabinetId: string, daysAhead: number = 30) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const patients = await prisma.patient.findMany({
      where: { cabinetId },
      select: { id: true },
    });

    return await prisma.consentRecord.findMany({
      where: {
        patientId: { in: patients.map((p) => p.id) },
        consentGiven: true,
        withdrawnAt: null,
        expiryDate: {
          gte: now,
          lte: futureDate,
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });
  }

  /**
   * Renew consent (create new record based on existing)
   */
  async renewConsent(consentId: string, expiryDate?: Date) {
    const existingConsent = await prisma.consentRecord.findUnique({
      where: { id: consentId },
    });

    if (!existingConsent) {
      throw new Error('Consent not found');
    }

    // Create new consent record
    return await this.recordConsent({
      patientId: existingConsent.patientId,
      consentType: existingConsent.consentType,
      consentGiven: true,
      consentText: existingConsent.consentText,
      expiryDate,
    });
  }
}

export default new ConsentService();
