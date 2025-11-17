import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import appointmentService from '../services/appointment.service';
import { sendSuccess, sendPaginatedResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { paginationSchema } from '../utils/validators';

const createAppointmentSchema = z.object({
  cabinetId: z.string().uuid(),
  practitionerId: z.string().uuid(),
  patientId: z.string().uuid(),
  roomId: z.string().uuid().optional(),
  type: z.enum([
    'CONSULTATION',
    'TELECONSULTATION',
    'FIRST_VISIT',
    'FOLLOW_UP',
    'EMERGENCY',
    'CHECK_UP',
    'VACCINATION',
    'IMAGING',
    'LABORATORY',
    'OTHER',
  ]),
  startTime: z.string().transform(val => new Date(val)),
  duration: z.number().min(5).max(480),
  reason: z.string().optional(),
  notes: z.string().optional(),
  isOnlineBooking: z.boolean().optional(),
});

const updateAppointmentSchema = z.object({
  status: z.enum([
    'SCHEDULED',
    'CONFIRMED',
    'ARRIVED',
    'IN_CONSULTATION',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
  ]).optional(),
  startTime: z.string().transform(val => new Date(val)).optional(),
  duration: z.number().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  cancelReason: z.string().optional(),
});

export class AppointmentController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createAppointmentSchema.parse(req.body);
      const appointment = await appointmentService.create(data as any);
      sendSuccess(res, appointment, 'Appointment created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const appointment = await appointmentService.findById(id);
      sendSuccess(res, appointment);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { cabinetId, practitionerId, patientId, status, startDate, endDate } = req.query;
      const { page, limit } = paginationSchema.parse(req.query);

      const result = await appointmentService.findAll({
        cabinetId: cabinetId as string,
        practitionerId: practitionerId as string,
        patientId: patientId as string,
        status: status as any,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
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
      const data = updateAppointmentSchema.parse(req.body);
      const appointment = await appointmentService.update(id, data as any);
      sendSuccess(res, appointment, 'Appointment updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const appointment = await appointmentService.cancel(id, reason);
      sendSuccess(res, appointment, 'Appointment cancelled successfully');
    } catch (error) {
      next(error);
    }
  }

  async markAsNoShow(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const appointment = await appointmentService.markAsNoShow(id);
      sendSuccess(res, appointment, 'Appointment marked as no-show');
    } catch (error) {
      next(error);
    }
  }

  async getAvailableSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const { practitionerId, date, duration } = req.query;

      if (!practitionerId || !date) {
        return res.status(400).json({
          success: false,
          message: 'practitionerId and date are required',
        });
      }

      const slots = await appointmentService.getAvailableSlots(
        practitionerId as string,
        new Date(date as string),
        duration ? parseInt(duration as string) : 30
      );

      sendSuccess(res, slots);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await appointmentService.delete(id);
      sendSuccess(res, null, 'Appointment deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AppointmentController();
