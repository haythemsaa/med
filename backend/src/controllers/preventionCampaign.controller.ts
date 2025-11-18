import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import preventionCampaignService from '../services/preventionCampaign.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { CampaignType } from '@prisma/client';

const createCampaignSchema = z.object({
  cabinetId: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  campaignType: z.nativeEnum(CampaignType),
  targetCondition: z.string().optional(),
  targetAgeMin: z.number().optional(),
  targetAgeMax: z.number().optional(),
  targetGender: z.string().optional(),
  messageSubject: z.string(),
  messageBody: z.string(),
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().transform(val => new Date(val)).optional(),
  deliveryMethod: z.array(z.string()),
  createdBy: z.string().uuid(),
});

export class PreventionCampaignController {
  /**
   * Create campaign
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createCampaignSchema.parse(req.body);
      const campaign = await preventionCampaignService.create(data as any);
      sendSuccess(res, campaign, 'Campaign created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get target patients
   */
  async getTargetPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const { campaignId } = req.params;
      const patients = await preventionCampaignService.getTargetPatients(campaignId);
      sendSuccess(res, patients);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Schedule campaign
   */
  async schedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const campaign = await preventionCampaignService.schedule(id);
      sendSuccess(res, campaign, 'Campaign scheduled successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send campaign
   */
  async send(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const campaign = await preventionCampaignService.send(id);
      sendSuccess(res, campaign, 'Campaign sent successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get campaign statistics
   */
  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const statistics = await preventionCampaignService.getStatistics(id);
      sendSuccess(res, statistics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cabinet campaigns
   */
  async getCabinetCampaigns(req: Request, res: Response, next: NextFunction) {
    try {
      const { cabinetId } = req.params;
      const campaigns = await preventionCampaignService.getCabinetCampaigns(cabinetId);
      sendSuccess(res, campaigns);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete campaign
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await preventionCampaignService.delete(id);
      sendSuccess(res, null, 'Campaign deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new PreventionCampaignController();
