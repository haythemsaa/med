import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import practitionerService from '../services/practitioner.service';
import { sendSuccess, sendPaginatedResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { paginationSchema } from '../utils/validators';

const createPractitionerSchema = z.object({
  userId: z.string().uuid(),
  cabinetId: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  title: z.string().optional(),
  speciality: z.string(),
  specialityDetails: z.string().optional(),
  licenseNumber: z.string().optional(),
  orderNumber: z.string().optional(),
  bio: z.string().optional(),
  consultationFee: z.number().optional(),
  teleconsultationFee: z.number().optional(),
  allowTeleconsultation: z.boolean().optional(),
  color: z.string().optional(),
});

const updatePractitionerSchema = createPractitionerSchema.partial();

const scheduleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

const absenceSchema = z.object({
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().transform(val => new Date(val)),
  reason: z.string().optional(),
  isAllDay: z.boolean().optional(),
});

export class PractitionerController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createPractitionerSchema.parse(req.body);
      const practitioner = await practitionerService.create(data as any);
      sendSuccess(res, practitioner, 'Practitioner created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const practitioner = await practitionerService.findById(id);
      sendSuccess(res, practitioner);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { cabinetId, speciality, isActive } = req.query;
      const { page, limit } = paginationSchema.parse(req.query);

      const result = await practitionerService.findAll({
        cabinetId: cabinetId as string,
        speciality: speciality as any,
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
      const data = updatePractitionerSchema.parse(req.body);
      const practitioner = await practitionerService.update(id, data as any);
      sendSuccess(res, practitioner, 'Practitioner updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await practitionerService.delete(id);
      sendSuccess(res, null, 'Practitioner deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schedule = await practitionerService.getSchedule(id);
      sendSuccess(res, schedule);
    } catch (error) {
      next(error);
    }
  }

  async setSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schedules = z.array(scheduleSchema).parse(req.body);
      await practitionerService.setSchedule(id, schedules as any);
      sendSuccess(res, null, 'Schedule updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async addAbsence(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = absenceSchema.parse(req.body);
      const absence = await practitionerService.addAbsence(id, data as any);
      sendSuccess(res, absence, 'Absence added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stats = await practitionerService.getStats(id);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

export default new PractitionerController();
