import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import familyHistoryService from '../services/familyHistory.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const createFamilyHistorySchema = z.object({
  cabinetId: z.string().uuid(),
  patientId: z.string().uuid(),
  conditionName: z.string(),
  conditionCode: z.string().optional(),
  relationship: z.string(),
  ageOfOnset: z.number().optional(),
  isDeceased: z.boolean().optional(),
  ageAtDeath: z.number().optional(),
  causeOfDeath: z.string().optional(),
  notes: z.string().optional(),
  severity: z.string().optional(),
});

const updateFamilyHistorySchema = createFamilyHistorySchema.partial();

export class FamilyHistoryController {
  /**
   * Create family history entry
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createFamilyHistorySchema.parse(req.body);
      const entry = await familyHistoryService.create(data);
      sendSuccess(res, entry, 'Family history entry created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get patient history
   */
  async getPatientHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const history = await familyHistoryService.getPatientHistory(patientId);
      sendSuccess(res, history);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get by condition
   */
  async getByCondition(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const { condition } = req.query;

      if (!condition) {
        return res.status(400).json({
          success: false,
          message: 'condition query parameter is required',
        });
      }

      const history = await familyHistoryService.getByCondition(patientId, condition as string);
      sendSuccess(res, history);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get family tree summary
   */
  async getFamilyTreeSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const summary = await familyHistoryService.getFamilyTreeSummary(patientId);
      sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update entry
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateFamilyHistorySchema.parse(req.body);
      const entry = await familyHistoryService.update(id, data);
      sendSuccess(res, entry, 'Family history updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete entry
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await familyHistoryService.delete(id);
      sendSuccess(res, null, 'Family history deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new FamilyHistoryController();
