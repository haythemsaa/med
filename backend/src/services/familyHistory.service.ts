import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Family History Service
 * Advanced module for family medical history (Doctolib-like)
 * - Link multiple family members to one condition
 * - Track relationship and age of onset
 * - Deceased status and cause of death
 */
export class FamilyHistoryService {
  /**
   * Create family history entry
   */
  async create(data: {
    cabinetId: string;
    patientId: string;
    conditionName: string;
    conditionCode?: string;
    relationship: string;
    ageOfOnset?: number;
    isDeceased?: boolean;
    ageAtDeath?: number;
    causeOfDeath?: string;
    notes?: string;
    severity?: string;
  }) {
    return await prisma.familyHistory.create({
      data,
    });
  }

  /**
   * Get patient family history
   */
  async getPatientHistory(patientId: string) {
    return await prisma.familyHistory.findMany({
      where: { patientId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get by condition
   */
  async getByCondition(patientId: string, conditionName: string) {
    return await prisma.familyHistory.findMany({
      where: {
        patientId,
        conditionName: {
          contains: conditionName,
          mode: 'insensitive',
        },
      },
    });
  }

  /**
   * Update entry
   */
  async update(id: string, data: any) {
    return await prisma.familyHistory.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete entry
   */
  async delete(id: string) {
    return await prisma.familyHistory.delete({
      where: { id },
    });
  }

  /**
   * Get family tree summary
   */
  async getFamilyTreeSummary(patientId: string) {
    const history = await this.getPatientHistory(patientId);

    const byRelationship: any = {};
    history.forEach((entry) => {
      if (!byRelationship[entry.relationship]) {
        byRelationship[entry.relationship] = [];
      }
      byRelationship[entry.relationship].push(entry);
    });

    return {
      total: history.length,
      byRelationship,
      deceasedCount: history.filter((h) => h.isDeceased).length,
    };
  }
}

export default new FamilyHistoryService();
