import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import messagingService from '../services/messaging.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const sendMessageSchema = z.object({
  cabinetId: z.string().uuid(),
  senderId: z.string().uuid(),
  recipientId: z.string().uuid(),
  subject: z.string().optional(),
  content: z.string().min(1),
  attachments: z.array(z.any()).optional(),
  threadId: z.string().uuid().optional(),
  replyToId: z.string().uuid().optional(),
  isUrgent: z.boolean().optional(),
});

export class MessagingController {
  /**
   * Send message
   */
  async send(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = sendMessageSchema.parse(req.body);
      const message = await messagingService.send(data);
      sendSuccess(res, message, 'Message sent successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get inbox
   */
  async getInbox(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { cabinetId } = req.query;

      if (!cabinetId) {
        return res.status(400).json({
          success: false,
          message: 'cabinetId is required',
        });
      }

      const messages = await messagingService.getInbox(userId, cabinetId as string);
      sendSuccess(res, messages);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get sent messages
   */
  async getSent(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { cabinetId } = req.query;

      if (!cabinetId) {
        return res.status(400).json({
          success: false,
          message: 'cabinetId is required',
        });
      }

      const messages = await messagingService.getSent(userId, cabinetId as string);
      sendSuccess(res, messages);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get conversation thread
   */
  async getThread(req: Request, res: Response, next: NextFunction) {
    try {
      const { threadId } = req.params;
      const messages = await messagingService.getThread(threadId);
      sendSuccess(res, messages);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark as read
   */
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const message = await messagingService.markAsRead(id);
      sendSuccess(res, message, 'Message marked as read');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Archive message
   */
  async archive(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const message = await messagingService.archive(id);
      sendSuccess(res, message, 'Message archived');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { cabinetId } = req.query;

      if (!cabinetId) {
        return res.status(400).json({
          success: false,
          message: 'cabinetId is required',
        });
      }

      const count = await messagingService.getUnreadCount(userId, cabinetId as string);
      sendSuccess(res, { count });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get urgent messages
   */
  async getUrgentMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { cabinetId } = req.query;

      if (!cabinetId) {
        return res.status(400).json({
          success: false,
          message: 'cabinetId is required',
        });
      }

      const messages = await messagingService.getUrgentMessages(userId, cabinetId as string);
      sendSuccess(res, messages);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search messages
   */
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { cabinetId, query } = req.query;

      if (!cabinetId || !query) {
        return res.status(400).json({
          success: false,
          message: 'cabinetId and query are required',
        });
      }

      const messages = await messagingService.search(
        userId,
        cabinetId as string,
        query as string
      );
      sendSuccess(res, messages);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete message
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await messagingService.delete(id);
      sendSuccess(res, null, 'Message deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new MessagingController();
