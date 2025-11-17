import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import consultationService from '../services/consultation.service';
import { sendSuccess, sendPaginatedResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { paginationSchema } from '../utils/validators';

const createConsultationSchema = z.object({
  cabinetId: z.string().uuid(),
  appointmentId: z.string().uuid(),
  practitionerId: z.string().uuid(),
  patientId: z.string().uuid(),
  chiefComplaint: z.string().optional(),
  presentIllness: z.string().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  bloodPressureSystolic: z.number().optional(),
  bloodPressureDiastolic: z.number().optional(),
  heartRate: z.number().optional(),
  temperature: z.number().optional(),
  oxygenSaturation: z.number().optional(),
  clinicalFindings: z.string().optional(),
  diagnosisPrimary: z.string().optional(),
  diagnosisSecondary: z.string().optional(),
  icdCodes: z.string().optional(),
  prescription: z.string().optional(),
  recommendations: z.string().optional(),
  followUpDate: z.string().transform(val => new Date(val)).optional(),
  followUpNotes: z.string().optional(),
});

const updateConsultationSchema = createConsultationSchema.partial();

export class ConsultationController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createConsultationSchema.parse(req.body);
      const consultation = await consultationService.create(data as any);
      sendSuccess(res, consultation, 'Consultation created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const consultation = await consultationService.findById(id);
      sendSuccess(res, consultation);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { cabinetId, practitionerId, patientId, startDate, endDate } = req.query;
      const { page, limit } = paginationSchema.parse(req.query);

      const result = await consultationService.findAll({
        cabinetId: cabinetId as string,
        practitionerId: practitionerId as string,
        patientId: patientId as string,
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
      const data = updateConsultationSchema.parse(req.body);
      const consultation = await consultationService.update(id, data as any);
      sendSuccess(res, consultation, 'Consultation updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await consultationService.delete(id);
      sendSuccess(res, null, 'Consultation deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getByAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { appointmentId } = req.params;
      const consultation = await consultationService.getByAppointment(appointmentId);
      sendSuccess(res, consultation);
    } catch (error) {
      next(error);
    }
  }

  async getPatientHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const history = await consultationService.getPatientHistory(patientId);
      sendSuccess(res, history);
    } catch (error) {
      next(error);
    }
  }
}

export default new ConsultationController();
