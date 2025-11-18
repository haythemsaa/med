import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import consultationRecordingService from '../services/consultationRecording.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const createRecordingSchema = z.object({
  consultationId: z.string().uuid(),
  cabinetId: z.string().uuid(),
  practitionerId: z.string().uuid(),
  patientId: z.string().uuid(),
  audioUrl: z.string().optional(),
});

const startRecordingSchema = z.object({
  audioUrl: z.string(),
});

export class ConsultationRecordingController {
  /**
   * Create recording
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createRecordingSchema.parse(req.body);
      const recording = await consultationRecordingService.create(data);
      sendSuccess(res, recording, 'Recording created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Start recording
   */
  async startRecording(req: Request, res: Response, next: NextFunction) {
    try {
      const { consultationId } = req.params;
      const { audioUrl } = startRecordingSchema.parse(req.body);
      const recording = await consultationRecordingService.startRecording(consultationId, audioUrl);
      sendSuccess(res, recording, 'Recording started successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process recording with AI
   */
  async processRecording(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const recording = await consultationRecordingService.processRecording(id);
      sendSuccess(res, recording, 'Recording processed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get by consultation ID
   */
  async getByConsultationId(req: Request, res: Response, next: NextFunction) {
    try {
      const { consultationId } = req.params;
      const recording = await consultationRecordingService.getByConsultationId(consultationId);
      sendSuccess(res, recording);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get by ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const recording = await consultationRecordingService.getById(id);
      sendSuccess(res, recording);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cabinet recordings
   */
  async getCabinetRecordings(req: Request, res: Response, next: NextFunction) {
    try {
      const { cabinetId } = req.params;
      const { status, practitionerId, startDate, endDate } = req.query;

      const recordings = await consultationRecordingService.getCabinetRecordings(
        cabinetId,
        {
          status: status as any,
          practitionerId: practitionerId as string,
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
        }
      );

      sendSuccess(res, recordings);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete recording
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await consultationRecordingService.delete(id);
      sendSuccess(res, null, 'Recording deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get statistics
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

      const statistics = await consultationRecordingService.getStatistics(
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

export default new ConsultationRecordingController();
