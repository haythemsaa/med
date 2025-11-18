import { PrismaClient, PrescriptionStatus } from '@prisma/client';
import crypto from 'crypto';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

/**
 * E-Prescription Service
 * OBLIGATOIRE en France depuis le 1er janvier 2025
 * Conforme à la réglementation française
 */
export class PrescriptionService {
  /**
   * Generate unique prescription number
   */
  private generatePrescriptionNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `RX-${timestamp}-${random}`;
  }

  /**
   * Generate QR Code for prescription
   */
  private async generateQRCode(prescriptionNumber: string, patientId: string): Promise<string> {
    const qrData = JSON.stringify({
      prescriptionNumber,
      patientId,
      timestamp: new Date().toISOString(),
      system: 'MediCare',
    });

    return await QRCode.toDataURL(qrData);
  }

  /**
   * Create new prescription
   */
  async create(data: {
    cabinetId: string;
    consultationId?: string;
    patientId: string;
    practitionerId: string;
    diagnosis?: string;
    notes?: string;
    validUntil: Date;
    items: Array<{
      medicationName: string;
      medicationCode?: string;
      dosage: string;
      quantity: string;
      duration?: string;
      instructions: string;
      substitutionAllowed?: boolean;
    }>;
  }) {
    const prescriptionNumber = this.generatePrescriptionNumber();
    const qrCode = await this.generateQRCode(prescriptionNumber, data.patientId);

    const prescription = await prisma.prescription.create({
      data: {
        cabinetId: data.cabinetId,
        consultationId: data.consultationId,
        patientId: data.patientId,
        practitionerId: data.practitionerId,
        prescriptionNumber,
        qrCode,
        diagnosis: data.diagnosis,
        notes: data.notes,
        validUntil: data.validUntil,
        status: 'DRAFT',
        items: {
          create: data.items,
        },
      },
      include: {
        items: true,
      },
    });

    return prescription;
  }

  /**
   * Sign and issue prescription (with CPS - Carte Professionnelle de Santé)
   */
  async signAndIssue(prescriptionId: string, signature: string) {
    const prescription = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        status: 'ISSUED',
        signedAt: new Date(),
        signature,
      },
      include: {
        items: true,
      },
    });

    // TODO: Send to Mon Espace Santé / DMP
    // This would integrate with French national health data system

    return prescription;
  }

  /**
   * Get prescription by QR code (for pharmacy)
   */
  async getByQRCode(qrCode: string) {
    return await prisma.prescription.findUnique({
      where: { qrCode },
      include: {
        items: true,
      },
    });
  }

  /**
   * Get prescription by number
   */
  async getByNumber(prescriptionNumber: string) {
    return await prisma.prescription.findUnique({
      where: { prescriptionNumber },
      include: {
        items: true,
      },
    });
  }

  /**
   * Dispense prescription (pharmacy action)
   */
  async dispense(prescriptionId: string, pharmacyInfo: string) {
    const prescription = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        status: 'DISPENSED',
        dispensedAt: new Date(),
        dispensedBy: pharmacyInfo,
      },
      include: {
        items: true,
      },
    });

    // Mark all items as dispensed
    await prisma.prescriptionItem.updateMany({
      where: { prescriptionId },
      data: {
        dispensed: true,
        dispensedAt: new Date(),
      },
    });

    return prescription;
  }

  /**
   * Partial dispensing (some items)
   */
  async partialDispense(
    prescriptionId: string,
    itemIds: string[],
    pharmacyInfo: string
  ) {
    // Update specific items
    await prisma.prescriptionItem.updateMany({
      where: {
        id: { in: itemIds },
        prescriptionId,
      },
      data: {
        dispensed: true,
        dispensedAt: new Date(),
      },
    });

    // Check if all items are dispensed
    const allItems = await prisma.prescriptionItem.findMany({
      where: { prescriptionId },
    });

    const allDispensed = allItems.every((item) => item.dispensed);

    const prescription = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        status: allDispensed ? 'DISPENSED' : 'PARTIALLY_DISPENSED',
        dispensedAt: allDispensed ? new Date() : null,
        dispensedBy: pharmacyInfo,
      },
      include: {
        items: true,
      },
    });

    return prescription;
  }

  /**
   * Cancel prescription
   */
  async cancel(prescriptionId: string) {
    return await prisma.prescription.update({
      where: { id: prescriptionId },
      data: { status: 'CANCELLED' },
      include: {
        items: true,
      },
    });
  }

  /**
   * Get patient prescriptions
   */
  async getPatientPrescriptions(patientId: string) {
    return await prisma.prescription.findMany({
      where: { patientId },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get practitioner prescriptions
   */
  async getPractitionerPrescriptions(
    practitionerId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    return await prisma.prescription.findMany({
      where: {
        practitionerId,
        ...(startDate && endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Check prescription validity
   */
  async checkValidity(prescriptionId: string): Promise<boolean> {
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
    });

    if (!prescription) return false;

    const now = new Date();
    return (
      prescription.status === 'ISSUED' &&
      prescription.validUntil > now
    );
  }

  /**
   * Send to DMP (Dossier Médical Partagé)
   */
  async sendToDMP(prescriptionId: string) {
    // TODO: Integration with French national DMP system
    // This would use the official DMP API

    const prescription = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        sentToDMP: true,
        dmpReference: `DMP-${Date.now()}`, // Would be actual DMP reference
      },
    });

    return prescription;
  }

  /**
   * Get prescription statistics
   */
  async getStatistics(cabinetId: string, startDate: Date, endDate: Date) {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        cabinetId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const total = prescriptions.length;
    const issued = prescriptions.filter((p) => p.status === 'ISSUED').length;
    const dispensed = prescriptions.filter((p) => p.status === 'DISPENSED').length;
    const cancelled = prescriptions.filter((p) => p.status === 'CANCELLED').length;
    const expired = prescriptions.filter(
      (p) => p.validUntil < new Date() && p.status === 'ISSUED'
    ).length;

    const dispensingRate = total > 0 ? ((dispensed / total) * 100).toFixed(2) : '0';

    return {
      total,
      issued,
      dispensed,
      cancelled,
      expired,
      dispensingRate: parseFloat(dispensingRate),
    };
  }
}

export default new PrescriptionService();
