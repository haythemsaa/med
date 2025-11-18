import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import careProtocolService from '../services/careProtocol.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const createProtocolSchema = z.object({
  cabinetId: z.string().uuid(),
  patientId: z.string().uuid().optional(),
  meetingId: z.string().uuid().optional(),
  title: z.string(),
  description: z.string(),
  pathology: z.string().optional(),
  objectives: z.string(),
  steps: z.any(),
  medications: z.any().optional(),
  followUpSchedule: z.any().optional(),
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().transform(val => new Date(val)).optional(),
  createdBy: z.string().uuid(),
});

export class CareProtocolController {
  /**
   * Create protocol
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createProtocolSchema.parse(req.body);
      const protocol = await careProtocolService.create(data as any);
      sendSuccess(res, protocol, 'Protocol created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate protocol
   */
  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { validatorId } = req.body;

      if (!validatorId) {
        return res.status(400).json({
          success: false,
          message: 'validatorId is required',
        });
      }

      const protocol = await careProtocolService.validate(id, validatorId);
      sendSuccess(res, protocol, 'Protocol validated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update protocol
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = createProtocolSchema.partial().parse(req.body);
      const protocol = await careProtocolService.update(id, data);
      sendSuccess(res, protocol, 'Protocol updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete protocol
   */
  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const protocol = await careProtocolService.complete(id);
      sendSuccess(res, protocol, 'Protocol completed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Suspend protocol
   */
  async suspend(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const protocol = await careProtocolService.suspend(id);
      sendSuccess(res, protocol, 'Protocol suspended successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get patient protocols
   */
  async getPatientProtocols(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const { activeOnly } = req.query;
      const protocols = await careProtocolService.getPatientProtocols(
        patientId,
        activeOnly === 'true'
      );
      sendSuccess(res, protocols);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cabinet protocols
   */
  async getCabinetProtocols(req: Request, res: Response, next: NextFunction) {
    try {
      const { cabinetId } = req.params;
      const { status } = req.query;
      const protocols = await careProtocolService.getCabinetProtocols(cabinetId, {
        status: status as any,
      });
      sendSuccess(res, protocols);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get meeting protocols
   */
  async getMeetingProtocols(req: Request, res: Response, next: NextFunction) {
    try {
      const { meetingId } = req.params;
      const protocols = await careProtocolService.getMeetingProtocols(meetingId);
      sendSuccess(res, protocols);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete protocol
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await careProtocolService.delete(id);
      sendSuccess(res, null, 'Protocol deleted successfully');
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
      const statistics = await careProtocolService.getStatistics(cabinetId);
      sendSuccess(res, statistics);
    } catch (error) {
      next(error);
    }
  }
}

export default new CareProtocolController();
