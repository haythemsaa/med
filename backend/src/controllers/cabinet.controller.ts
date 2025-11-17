import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import cabinetService from '../services/cabinet.service';
import { sendSuccess, sendPaginatedResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { paginationSchema, emailSchema } from '../utils/validators';

const createCabinetSchema = z.object({
  name: z.string().min(1),
  email: emailSchema,
  phone: z.string(),
  address: z.string().optional(),
  city: z.string().optional(),
  adminEmail: emailSchema,
  adminPassword: z.string().min(8),
  subscriptionPlan: z.enum(['FREE', 'STARTER', 'STANDARD', 'PREMIUM', 'ENTERPRISE']).optional(),
});

const updateCabinetSchema = z.object({
  name: z.string().optional(),
  email: emailSchema.optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  logo: z.string().optional(),
  allowOnlineBooking: z.boolean().optional(),
  minBookingDelay: z.number().optional(),
  maxBookingDelay: z.number().optional(),
  defaultAppointmentDuration: z.number().optional(),
});

export class CabinetController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createCabinetSchema.parse(req.body);
      const cabinet = await cabinetService.create(data);
      sendSuccess(res, cabinet, 'Cabinet created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const cabinet = await cabinetService.findById(id);
      sendSuccess(res, cabinet);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { search, subscriptionStatus, isActive } = req.query;
      const { page, limit } = paginationSchema.parse(req.query);

      const result = await cabinetService.findAll({
        search: search as string,
        subscriptionStatus: subscriptionStatus as any,
        isActive: isActive === 'true',
        page,
        limit,
      });

      sendPaginatedResponse(res, result.data, page, limit, result.meta.total);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateCabinetSchema.parse(req.body);
      const cabinet = await cabinetService.update(id, data);
      sendSuccess(res, cabinet, 'Cabinet updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { plan, status } = req.body;
      const cabinet = await cabinetService.updateSubscription(id, plan, status);
      sendSuccess(res, cabinet, 'Subscription updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async suspend(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const cabinet = await cabinetService.suspend(id);
      sendSuccess(res, cabinet, 'Cabinet suspended successfully');
    } catch (error) {
      next(error);
    }
  }

  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const cabinet = await cabinetService.activate(id);
      sendSuccess(res, cabinet, 'Cabinet activated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await cabinetService.delete(id);
      sendSuccess(res, null, 'Cabinet deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stats = await cabinetService.getStats(id);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

export default new CabinetController();
