import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import advancedAgendaSettingsService from '../services/advancedAgendaSettings.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const createOrUpdateSettingsSchema = z.object({
  practitionerId: z.string().uuid(),
  cabinetId: z.string().uuid(),
  allowMultipleLocations: z.boolean().optional(),
  locations: z.any().optional(),
  allowParallelConsultations: z.boolean().optional(),
  maxParallelSlots: z.number().optional(),
  slotTypesByAct: z.any().optional(),
  enableDelayNotifications: z.boolean().optional(),
  delayThresholdMinutes: z.number().optional(),
  trackOnlineBookingRate: z.boolean().optional(),
  trackNewPatientRate: z.boolean().optional(),
  trackNoShowRate: z.boolean().optional(),
});

const enableMultipleLocationsSchema = z.object({
  locations: z.array(
    z.object({
      name: z.string(),
      address: z.string(),
      slots: z.array(z.any()),
    })
  ),
});

const enableParallelConsultationsSchema = z.object({
  maxParallelSlots: z.number().min(1).max(10),
});

const setSlotTypesByActSchema = z.object({
  slotTypesByAct: z.record(z.number()),
});

export class AdvancedAgendaSettingsController {
  /**
   * Create or update settings
   */
  async createOrUpdate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createOrUpdateSettingsSchema.parse(req.body);
      const settings = await advancedAgendaSettingsService.createOrUpdate(data);
      sendSuccess(res, settings, 'Settings updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get settings
   */
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { practitionerId } = req.params;
      const settings = await advancedAgendaSettingsService.get(practitionerId);
      sendSuccess(res, settings);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Enable multiple locations
   */
  async enableMultipleLocations(req: Request, res: Response, next: NextFunction) {
    try {
      const { practitionerId } = req.params;
      const { locations } = enableMultipleLocationsSchema.parse(req.body);
      const settings = await advancedAgendaSettingsService.enableMultipleLocations(
        practitionerId,
        locations
      );
      sendSuccess(res, settings, 'Multiple locations enabled successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Enable parallel consultations
   */
  async enableParallelConsultations(req: Request, res: Response, next: NextFunction) {
    try {
      const { practitionerId } = req.params;
      const { maxParallelSlots } = enableParallelConsultationsSchema.parse(req.body);
      const settings = await advancedAgendaSettingsService.enableParallelConsultations(
        practitionerId,
        maxParallelSlots
      );
      sendSuccess(res, settings, 'Parallel consultations enabled successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Set slot types by act
   */
  async setSlotTypesByAct(req: Request, res: Response, next: NextFunction) {
    try {
      const { practitionerId } = req.params;
      const { slotTypesByAct } = setSlotTypesByActSchema.parse(req.body);
      const settings = await advancedAgendaSettingsService.setSlotTypesByAct(
        practitionerId,
        slotTypesByAct
      );
      sendSuccess(res, settings, 'Slot types updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Enable delay notifications
   */
  async enableDelayNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { practitionerId } = req.params;
      const { thresholdMinutes } = req.body;
      const settings = await advancedAgendaSettingsService.enableDelayNotifications(
        practitionerId,
        thresholdMinutes || 15
      );
      sendSuccess(res, settings, 'Delay notifications enabled successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cabinet settings
   */
  async getCabinetSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { cabinetId } = req.params;
      const settings = await advancedAgendaSettingsService.getCabinetSettings(cabinetId);
      sendSuccess(res, settings);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete settings
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { practitionerId } = req.params;
      await advancedAgendaSettingsService.delete(practitionerId);
      sendSuccess(res, null, 'Settings deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AdvancedAgendaSettingsController();
