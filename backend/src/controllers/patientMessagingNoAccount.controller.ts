import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import patientMessagingNoAccountService from '../services/patientMessagingNoAccount.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const sendMessageSchema = z.object({
  cabinetId: z.string().uuid(),
  senderId: z.string().uuid(),
  patientPhone: z.string().optional(),
  patientEmail: z.string().email().optional(),
  subject: z.string(),
  content: z.string(),
  expiresInDays: z.number().optional(),
});

export class PatientMessagingNoAccountController {
  /**
   * Send message to patient without account
   */
  async sendToPatientNoAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = sendMessageSchema.parse(req.body);

      if (!data.patientPhone && !data.patientEmail) {
        return res.status(400).json({
          success: false,
          message: 'Either patientPhone or patientEmail is required',
        });
      }

      const result = await patientMessagingNoAccountService.sendToPatientNoAccount(data);
      sendSuccess(res, result, 'Message sent successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get message by access token
   */
  async getByAccessToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const message = await patientMessagingNoAccountService.getByAccessToken(token);
      sendSuccess(res, message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      await patientMessagingNoAccountService.markAsRead(token);
      sendSuccess(res, null, 'Message marked as read');
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

      const statistics = await patientMessagingNoAccountService.getStatistics(
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

export default new PatientMessagingNoAccountController();
