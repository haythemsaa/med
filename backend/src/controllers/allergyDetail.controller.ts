import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import allergyDetailService from '../services/allergyDetail.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { AllergenType, AllergySeverity, AllergyStatus } from '@prisma/client';

const createAllergySchema = z.object({
  cabinetId: z.string().uuid(),
  patientId: z.string().uuid(),
  allergenName: z.string(),
  allergenCode: z.string().optional(),
  allergenType: z.nativeEnum(AllergenType),
  status: z.nativeEnum(AllergyStatus).optional(),
  severity: z.nativeEnum(AllergySeverity),
  reactions: z.array(z.string()).optional(),
  firstOccurrence: z.string().transform(val => new Date(val)).optional(),
  lastOccurrence: z.string().transform(val => new Date(val)).optional(),
  testPerformed: z.boolean().optional(),
  testType: z.string().optional(),
  testDate: z.string().transform(val => new Date(val)).optional(),
  testResult: z.string().optional(),
  testFacility: z.string().optional(),
  notes: z.string().optional(),
  treatment: z.string().optional(),
});

const recordTestSchema = z.object({
  testType: z.string(),
  testDate: z.string().transform(val => new Date(val)),
  testResult: z.string(),
  testFacility: z.string().optional(),
});

export class AllergyDetailController {
  /**
   * Create allergy
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createAllergySchema.parse(req.body);
      const allergy = await allergyDetailService.create(data as any);
      sendSuccess(res, allergy, 'Allergy created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get patient allergies
   */
  async getPatientAllergies(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const { activeOnly } = req.query;
      const allergies = await allergyDetailService.getPatientAllergies(
        patientId,
        activeOnly === 'true'
      );
      sendSuccess(res, allergies);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get by type
   */
  async getByType(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const { type } = req.query;

      if (!type) {
        return res.status(400).json({
          success: false,
          message: 'type query parameter is required',
        });
      }

      const allergies = await allergyDetailService.getByType(patientId, type as AllergenType);
      sendSuccess(res, allergies);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get allergy summary
   */
  async getAllergySummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const summary = await allergyDetailService.getAllergySummary(patientId);
      sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update allergy
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = createAllergySchema.partial().parse(req.body);
      const allergy = await allergyDetailService.update(id, data);
      sendSuccess(res, allergy, 'Allergy updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update status
   */
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'status is required',
        });
      }

      const allergy = await allergyDetailService.updateStatus(id, status);
      sendSuccess(res, allergy, 'Allergy status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Record test
   */
  async recordTest(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const testData = recordTestSchema.parse(req.body);
      const allergy = await allergyDetailService.recordTest(id, testData as any);
      sendSuccess(res, allergy, 'Test recorded successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete allergy
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await allergyDetailService.delete(id);
      sendSuccess(res, null, 'Allergy deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AllergyDetailController();
