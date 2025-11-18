import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import professionalContactService from '../services/professionalContact.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { ContactType } from '@prisma/client';

const createContactSchema = z.object({
  cabinetId: z.string().uuid(),
  contactType: z.nativeEnum(ContactType),
  title: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  specialty: z.string().optional(),
  organization: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  fax: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  rppsNumber: z.string().optional(),
  adeliNumber: z.string().optional(),
  finessNumber: z.string().optional(),
  isShared: z.boolean().optional(),
  sharedWith: z.array(z.string().uuid()).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  createdBy: z.string().uuid(),
});

const shareContactSchema = z.object({
  userIds: z.array(z.string().uuid()),
});

export class ProfessionalContactController {
  /**
   * Create contact
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createContactSchema.parse(req.body);
      const contact = await professionalContactService.create(data);
      sendSuccess(res, contact, 'Contact created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cabinet contacts
   */
  async getCabinetContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const { cabinetId } = req.params;
      const { userId, contactType, specialty, tags, search } = req.query;

      const contacts = await professionalContactService.getCabinetContacts(
        cabinetId,
        userId as string,
        {
          contactType: contactType as ContactType,
          specialty: specialty as string,
          tags: tags ? (tags as string).split(',') : undefined,
          search: search as string,
        }
      );

      sendSuccess(res, contacts);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get by type
   */
  async getByType(req: Request, res: Response, next: NextFunction) {
    try {
      const { cabinetId } = req.params;
      const { type } = req.query;

      if (!type) {
        return res.status(400).json({
          success: false,
          message: 'type query parameter is required',
        });
      }

      const contacts = await professionalContactService.getByType(cabinetId, type as ContactType);
      sendSuccess(res, contacts);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update contact
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = createContactSchema.partial().parse(req.body);
      const contact = await professionalContactService.update(id, data);
      sendSuccess(res, contact, 'Contact updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Share contact
   */
  async share(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { userIds } = shareContactSchema.parse(req.body);
      const contact = await professionalContactService.share(id, userIds);
      sendSuccess(res, contact, 'Contact shared successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete contact
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await professionalContactService.delete(id);
      sendSuccess(res, null, 'Contact deleted successfully');
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
      const statistics = await professionalContactService.getStatistics(cabinetId);
      sendSuccess(res, statistics);
    } catch (error) {
      next(error);
    }
  }
}

export default new ProfessionalContactController();
