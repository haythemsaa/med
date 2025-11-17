import { Request, Response } from 'express';
import { z } from 'zod';
import PublicBookingService from '../services/publicBooking.service';

const createPageSchema = z.object({
  cabinetId: z.string().uuid(),
  slug: z.string().optional(),
  customDomain: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  logo: z.string().optional(),
  headerImage: z.string().optional(),
  welcomeMessage: z.string().optional(),
  description: z.string().optional(),
  showPractitioners: z.boolean().optional(),
  showReviews: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const bookAppointmentSchema = z.object({
  slug: z.string(),
  practitionerId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  type: z.enum(['CONSULTATION', 'TELECONSULTATION']),
  patient: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    dateOfBirth: z.string().datetime(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  }),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export class PublicBookingController {
  async createOrUpdatePage(req: Request, res: Response) {
    try {
      const data = createPageSchema.parse(req.body);

      const page = await PublicBookingService.createOrUpdatePage(
        data.cabinetId,
        data
      );

      res.json({
        success: true,
        data: page,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getPageData(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      const data = await PublicBookingService.getPublicPageData(slug);

      res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAvailableSlots(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const { practitionerId, date } = req.query;

      const slots = await PublicBookingService.getAvailableSlots({
        slug,
        practitionerId: practitionerId as string,
        date: new Date(date as string),
      });

      res.json({
        success: true,
        data: slots,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async bookAppointment(req: Request, res: Response) {
    try {
      const data = bookAppointmentSchema.parse(req.body);

      const appointment = await PublicBookingService.bookAppointment({
        ...data,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        patient: {
          ...data.patient,
          dateOfBirth: new Date(data.patient.dateOfBirth),
        },
      });

      res.status(201).json({
        success: true,
        data: appointment,
        message: 'Rendez-vous confirmé! Vous recevrez un email de confirmation.',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async checkSlugAvailability(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const { cabinetId } = req.query;

      const available = await PublicBookingService.isSlugAvailable(
        slug,
        cabinetId as string | undefined
      );

      res.json({
        success: true,
        data: { available },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getStatistics(req: Request, res: Response) {
    try {
      const { cabinetId } = req.params;
      const { startDate, endDate } = req.query;

      const stats = await PublicBookingService.getStatistics(
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

export default new PublicBookingController();
