import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import automatedReminderService from '../services/automatedReminder.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { ReminderType } from '@prisma/client';

const createReminderSchema = z.object({
  cabinetId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  patientId: z.string().uuid(),
  type: z.enum([
    'APPOINTMENT_CONFIRMATION',
    'APPOINTMENT_REMINDER_24H',
    'APPOINTMENT_REMINDER_1H',
    'FOLLOW_UP',
    'MEDICATION_REMINDER',
    'VACCINATION_DUE',
    'CUSTOM',
  ]),
  scheduledFor: z.string().transform(val => new Date(val)),
  message: z.string(),
  subject: z.string().optional(),
  sendSMS: z.boolean().optional(),
  sendEmail: z.boolean().optional(),
  sendPush: z.boolean().optional(),
});

export class AutomatedReminderController {
  /**
   * Create reminder
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createReminderSchema.parse(req.body);
      const reminder = await automatedReminderService.create(data as any);
      sendSuccess(res, reminder, 'Reminder created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create appointment reminders (24h and 1h)
   */
  async createAppointmentReminders(req: Request, res: Response, next: NextFunction) {
    try {
      const { appointmentId } = req.params;
      const reminders = await automatedReminderService.createAppointmentReminders(appointmentId);
      sendSuccess(res, reminders, 'Appointment reminders created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process pending reminders (cron job endpoint)
   */
  async processPendingReminders(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await automatedReminderService.processPendingReminders();
      sendSuccess(res, results, 'Pending reminders processed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel appointment reminders
   */
  async cancelAppointmentReminders(req: Request, res: Response, next: NextFunction) {
    try {
      const { appointmentId } = req.params;
      await automatedReminderService.cancelAppointmentReminders(appointmentId);
      sendSuccess(res, null, 'Appointment reminders cancelled successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get patient reminders
   */
  async getPatientReminders(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const reminders = await automatedReminderService.getPatientReminders(patientId);
      sendSuccess(res, reminders);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get reminder statistics
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

      const statistics = await automatedReminderService.getStatistics(
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

export default new AutomatedReminderController();
