import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Vaccination Service
 * Digital vaccination card management
 */
export class VaccinationService {
  /**
   * Record vaccination
   */
  async create(data: {
    cabinetId: string;
    patientId: string;
    practitionerId?: string;
    vaccineName: string;
    vaccineCode?: string;
    diseaseName: string;
    manufacturer?: string;
    batchNumber?: string;
    expiryDate?: Date;
    administeredAt: Date;
    administeredBy?: string;
    site?: string;
    route?: string;
    dose?: string;
    doseNumber?: number;
    totalDoses?: number;
    nextDoseDate?: Date;
    notes?: string;
    reactions?: string;
  }) {
    return await prisma.vaccinationRecord.create({
      data: {
        ...data,
        nextDoseReminder: data.nextDoseDate ? true : false,
      },
    });
  }

  /**
   * Get patient vaccination history
   */
  async getPatientHistory(patientId: string) {
    return await prisma.vaccinationRecord.findMany({
      where: { patientId },
      orderBy: {
        administeredAt: 'desc',
      },
    });
  }

  /**
   * Get upcoming vaccinations (next doses due)
   */
  async getUpcomingVaccinations(cabinetId: string) {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return await prisma.vaccinationRecord.findMany({
      where: {
        cabinetId,
        nextDoseDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
        nextDoseReminder: true,
      },
      orderBy: {
        nextDoseDate: 'asc',
      },
    });
  }

  /**
   * Update vaccination record
   */
  async update(id: string, data: any) {
    return await prisma.vaccinationRecord.update({
      where: { id },
      data,
    });
  }

  /**
   * Record next dose
   */
  async recordNextDose(previousRecordId: string, data: any) {
    const previousRecord = await prisma.vaccinationRecord.findUnique({
      where: { id: previousRecordId },
    });

    if (!previousRecord) {
      throw new Error('Previous vaccination record not found');
    }

    return await this.create({
      ...data,
      vaccineName: previousRecord.vaccineName,
      vaccineCode: previousRecord.vaccineCode,
      diseaseName: previousRecord.diseaseName,
      doseNumber: (previousRecord.doseNumber || 0) + 1,
      totalDoses: previousRecord.totalDoses,
    });
  }

  /**
   * Get vaccination statistics
   */
  async getStatistics(cabinetId: string, startDate: Date, endDate: Date) {
    const records = await prisma.vaccinationRecord.findMany({
      where: {
        cabinetId,
        administeredAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Count by vaccine type
    const byVaccine: any = {};
    records.forEach((r) => {
      byVaccine[r.vaccineName] = (byVaccine[r.vaccineName] || 0) + 1;
    });

    // Count by disease
    const byDisease: any = {};
    records.forEach((r) => {
      byDisease[r.diseaseName] = (byDisease[r.diseaseName] || 0) + 1;
    });

    return {
      total: records.length,
      byVaccine,
      byDisease,
    };
  }

  /**
   * Send to DMP (Dossier Médical Partagé)
   */
  async sendToDMP(recordId: string) {
    // TODO: Integration with French national DMP system

    return await prisma.vaccinationRecord.update({
      where: { id: recordId },
      data: {
        sentToDMP: true,
        dmpReference: `DMP-VAC-${Date.now()}`,
      },
    });
  }

  /**
   * Check vaccination coverage
   */
  async checkCoverage(patientId: string) {
    const records = await this.getPatientHistory(patientId);

    // Common required vaccines (France)
    const requiredVaccines = [
      'Diphtérie',
      'Tétanos',
      'Poliomyélite',
      'Coqueluche',
      'Haemophilus influenzae b',
      'Hépatite B',
      'Pneumocoque',
      'Méningocoque C',
      'Rougeole',
      'Oreillons',
      'Rubéole',
    ];

    const coverage: any = {};

    requiredVaccines.forEach((vaccine) => {
      const vaccinationRecords = records.filter((r) =>
        r.diseaseName.toLowerCase().includes(vaccine.toLowerCase())
      );
      coverage[vaccine] = {
        vaccinated: vaccinationRecords.length > 0,
        lastDate: vaccinationRecords[0]?.administeredAt,
        doses: vaccinationRecords.length,
      };
    });

    return coverage;
  }

  /**
   * Delete vaccination record
   */
  async delete(id: string) {
    return await prisma.vaccinationRecord.delete({
      where: { id },
    });
  }
}

export default new VaccinationService();
