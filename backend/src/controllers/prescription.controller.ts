import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prescriptionService from '../services/prescription.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const prescriptionItemSchema = z.object({
  medicationName: z.string(),
  medicationCode: z.string().optional(),
  dosage: z.string(),
  quantity: z.string(),
  duration: z.string().optional(),
  instructions: z.string(),
  substitutionAllowed: z.boolean().optional(),
});

const createPrescriptionSchema = z.object({
  cabinetId: z.string().uuid(),
  consultationId: z.string().uuid().optional(),
  patientId: z.string().uuid(),
  practitionerId: z.string().uuid(),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  validUntil: z.string().transform(val => new Date(val)),
  items: z.array(prescriptionItemSchema).min(1),
});

const signPrescriptionSchema = z.object({
  signature: z.string(),
});

const dispensePrescriptionSchema = z.object({
  pharmacyInfo: z.string(),
  itemIds: z.array(z.string().uuid()).optional(),
});

export class PrescriptionController {
  /**
   * Create new prescription
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createPrescriptionSchema.parse(req.body);
      const prescription = await prescriptionService.create(data as any);
      sendSuccess(res, prescription, 'E-prescription created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sign and issue prescription
   */
  async signAndIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { signature } = signPrescriptionSchema.parse(req.body);
      const prescription = await prescriptionService.signAndIssue(id, signature);
      sendSuccess(res, prescription, 'Prescription signed and issued successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get prescription by QR code (for pharmacy)
   */
  async getByQRCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { qrCode } = req.params;
      const prescription = await prescriptionService.getByQRCode(qrCode);

      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: 'Prescription not found',
        });
      }

      sendSuccess(res, prescription);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get prescription by number
   */
  async getByNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const { prescriptionNumber } = req.params;
      const prescription = await prescriptionService.getByNumber(prescriptionNumber);

      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: 'Prescription not found',
        });
      }

      sendSuccess(res, prescription);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Dispense prescription
   */
  async dispense(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { pharmacyInfo, itemIds } = dispensePrescriptionSchema.parse(req.body);

      let prescription;
      if (itemIds && itemIds.length > 0) {
        prescription = await prescriptionService.partialDispense(id, itemIds, pharmacyInfo);
      } else {
        prescription = await prescriptionService.dispense(id, pharmacyInfo);
      }

      sendSuccess(res, prescription, 'Prescription dispensed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel prescription
   */
  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const prescription = await prescriptionService.cancel(id);
      sendSuccess(res, prescription, 'Prescription cancelled successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get patient prescriptions
   */
  async getPatientPrescriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const prescriptions = await prescriptionService.getPatientPrescriptions(patientId);
      sendSuccess(res, prescriptions);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get practitioner prescriptions
   */
  async getPractitionerPrescriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const { practitionerId } = req.params;
      const { startDate, endDate } = req.query;

      const prescriptions = await prescriptionService.getPractitionerPrescriptions(
        practitionerId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      sendSuccess(res, prescriptions);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check prescription validity
   */
  async checkValidity(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const isValid = await prescriptionService.checkValidity(id);
      sendSuccess(res, { isValid });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send to DMP
   */
  async sendToDMP(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const prescription = await prescriptionService.sendToDMP(id);
      sendSuccess(res, prescription, 'Prescription sent to DMP successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get prescription statistics
   */
  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const { cabinetId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate and endDate are required',
        });
      }

      const statistics = await prescriptionService.getStatistics(
        cabinetId,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      sendSuccess(res, statistics);
    } catch (error) {
      next(error);
    }
  }
}

export default new PrescriptionController();
