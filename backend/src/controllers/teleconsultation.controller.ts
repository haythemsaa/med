import { Request, Response } from 'express';
import { z } from 'zod';
import TeleconsultationService from '../services/teleconsultation.service';

const createSessionSchema = z.object({
  appointmentId: z.string().uuid(),
});

const joinSessionSchema = z.object({
  sessionId: z.string(),
  userType: z.enum(['patient', 'practitioner']),
});

const endSessionSchema = z.object({
  sessionId: z.string(),
});

export class TeleconsultationController {
  async createSession(req: Request, res: Response) {
    try {
      const { appointmentId } = createSessionSchema.parse(req.body);

      const session = await TeleconsultationService.createSession(appointmentId);

      res.status(201).json({
        success: true,
        data: session,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async joinSession(req: Request, res: Response) {
    try {
      const { sessionId, userType } = joinSessionSchema.parse(req.body);

      const session = await TeleconsultationService.joinSession(sessionId, userType);

      res.json({
        success: true,
        data: session,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async endSession(req: Request, res: Response) {
    try {
      const { sessionId } = endSessionSchema.parse(req.body);

      const session = await TeleconsultationService.endSession(sessionId);

      res.json({
        success: true,
        data: session,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getByAppointment(req: Request, res: Response) {
    try {
      const { appointmentId } = req.params;

      const session = await TeleconsultationService.getByAppointmentId(appointmentId);

      res.json({
        success: true,
        data: session,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getStatistics(req: Request, res: Response) {
    try {
      const { cabinetId } = req.params;
      const { startDate, endDate } = req.query;

      const stats = await TeleconsultationService.getStatistics(
        cabinetId,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new TeleconsultationController();
