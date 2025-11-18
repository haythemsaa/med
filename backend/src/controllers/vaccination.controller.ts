import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import vaccinationService from '../services/vaccination.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const createVaccinationSchema = z.object({
  cabinetId: z.string().uuid(),
  patientId: z.string().uuid(),
  practitionerId: z.string().uuid().optional(),
  vaccineName: z.string(),
  vaccineCode: z.string().optional(),
  diseaseName: z.string(),
  manufacturer: z.string().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().transform(val => new Date(val)).optional(),
  administeredAt: z.string().transform(val => new Date(val)),
  administeredBy: z.string().optional(),
  site: z.string().optional(),
  route: z.string().optional(),
  dose: z.string().optional(),
  doseNumber: z.number().optional(),
  totalDoses: z.number().optional(),
  nextDoseDate: z.string().transform(val => new Date(val)).optional(),
  notes: z.string().optional(),
  reactions: z.string().optional(),
});

const updateVaccinationSchema = z.object({
  vaccineName: z.string().optional(),
  vaccineCode: z.string().optional(),
  diseaseName: z.string().optional(),
  manufacturer: z.string().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().transform(val => new Date(val)).optional(),
  administeredAt: z.string().transform(val => new Date(val)).optional(),
  administeredBy: z.string().optional(),
  site: z.string().optional(),
  route: z.string().optional(),
  dose: z.string().optional(),
  doseNumber: z.number().optional(),
  totalDoses: z.number().optional(),
  nextDoseDate: z.string().transform(val => new Date(val)).optional(),
  notes: z.string().optional(),
  reactions: z.string().optional(),
});

export class VaccinationController {
  /**
   * Record vaccination
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createVaccinationSchema.parse(req.body);
      const vaccination = await vaccinationService.create(data as any);
      sendSuccess(res, vaccination, 'Vaccination recorded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get patient vaccination history
   */
  async getPatientHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const vaccinations = await vaccinationService.getPatientHistory(patientId);
      sendSuccess(res, vaccinations);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get upcoming vaccinations (next doses due)
   */
  async getUpcomingVaccinations(req: Request, res: Response, next: NextFunction) {
    try {
      const { cabinetId } = req.params;
      const vaccinations = await vaccinationService.getUpcomingVaccinations(cabinetId);
      sendSuccess(res, vaccinations);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update vaccination record
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateVaccinationSchema.parse(req.body);
      const vaccination = await vaccinationService.update(id, data);
      sendSuccess(res, vaccination, 'Vaccination updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Record next dose
   */
  async recordNextDose(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = createVaccinationSchema.parse(req.body);
      const vaccination = await vaccinationService.recordNextDose(id, data);
      sendSuccess(res, vaccination, 'Next dose recorded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vaccination statistics
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

      const statistics = await vaccinationService.getStatistics(
        cabinetId,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      sendSuccess(res, statistics);
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
      const vaccination = await vaccinationService.sendToDMP(id);
      sendSuccess(res, vaccination, 'Vaccination sent to DMP successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check vaccination coverage
   */
  async checkCoverage(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const coverage = await vaccinationService.checkCoverage(patientId);
      sendSuccess(res, coverage);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete vaccination record
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await vaccinationService.delete(id);
      sendSuccess(res, null, 'Vaccination deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new VaccinationController();
