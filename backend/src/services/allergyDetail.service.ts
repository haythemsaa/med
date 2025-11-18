import { PrismaClient, AllergyStatus, AllergySeverity, AllergenType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Allergy Detail Service
 * Advanced allergy module (Doctolib-like)
 * - Detailed allergen information
 * - Allergy status (active, inactive, suspected, resolved)
 * - Test details (type, date, results, facility)
 * - Reaction tracking
 */
export class AllergyDetailService {
  /**
   * Create allergy detail
   */
  async create(data: {
    cabinetId: string;
    patientId: string;
    allergenName: string;
    allergenCode?: string;
    allergenType: AllergenType;
    status?: AllergyStatus;
    severity: AllergySeverity;
    reactions?: string[];
    firstOccurrence?: Date;
    lastOccurrence?: Date;
    testPerformed?: boolean;
    testType?: string;
    testDate?: Date;
    testResult?: string;
    testFacility?: string;
    notes?: string;
    treatment?: string;
  }) {
    return await prisma.allergyDetail.create({
      data: {
        ...data,
        status: data.status || 'ACTIVE',
      },
    });
  }

  /**
   * Get patient allergies
   */
  async getPatientAllergies(patientId: string, activeOnly: boolean = false) {
    return await prisma.allergyDetail.findMany({
      where: {
        patientId,
        ...(activeOnly && { status: 'ACTIVE' }),
      },
      orderBy: {
        severity: 'desc',
      },
    });
  }

  /**
   * Get by allergen type
   */
  async getByType(patientId: string, allergenType: AllergenType) {
    return await prisma.allergyDetail.findMany({
      where: {
        patientId,
        allergenType,
      },
    });
  }

  /**
   * Update allergy
   */
  async update(id: string, data: any) {
    return await prisma.allergyDetail.update({
      where: { id },
      data,
    });
  }

  /**
   * Update status
   */
  async updateStatus(id: string, status: AllergyStatus) {
    return await prisma.allergyDetail.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Record test
   */
  async recordTest(
    id: string,
    testData: {
      testType: string;
      testDate: Date;
      testResult: string;
      testFacility?: string;
    }
  ) {
    return await prisma.allergyDetail.update({
      where: { id },
      data: {
        testPerformed: true,
        ...testData,
      },
    });
  }

  /**
   * Delete allergy
   */
  async delete(id: string) {
    return await prisma.allergyDetail.delete({
      where: { id },
    });
  }

  /**
   * Get allergy summary
   */
  async getAllergySummary(patientId: string) {
    const allergies = await this.getPatientAllergies(patientId);

    const byType: any = {};
    const bySeverity: any = {};
    const byStatus: any = {};

    allergies.forEach((allergy) => {
      // By type
      if (!byType[allergy.allergenType]) byType[allergy.allergenType] = 0;
      byType[allergy.allergenType]++;

      // By severity
      if (!bySeverity[allergy.severity]) bySeverity[allergy.severity] = 0;
      bySeverity[allergy.severity]++;

      // By status
      if (!byStatus[allergy.status]) byStatus[allergy.status] = 0;
      byStatus[allergy.status]++;
    });

    return {
      total: allergies.length,
      active: allergies.filter((a) => a.status === 'ACTIVE').length,
      lifeThreatening: allergies.filter((a) => a.severity === 'LIFE_THREATENING').length,
      byType,
      bySeverity,
      byStatus,
      testedCount: allergies.filter((a) => a.testPerformed).length,
    };
  }
}

export default new AllergyDetailService();
