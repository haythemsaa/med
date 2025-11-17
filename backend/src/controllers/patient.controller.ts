import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import patientService from '../services/patient.service';
import { sendSuccess, sendPaginatedResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { paginationSchema } from '../utils/validators';

const createPatientSchema = z.object({
  cabinetId: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().transform(val => new Date(val)),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  email: z.string().email().optional(),
  phone: z.string(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  bloodGroup: z.enum([
    'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE',
    'O_POSITIVE', 'O_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE'
  ]).optional(),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
  currentMedications: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  insuranceCompany: z.string().optional(),
  insuranceNumber: z.string().optional(),
});

const updatePatientSchema = createPatientSchema.partial();

export class PatientController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createPatientSchema.parse(req.body);
      const patient = await patientService.create(data);
      sendSuccess(res, patient, 'Patient created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const patient = await patientService.findById(id);
      sendSuccess(res, patient);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { cabinetId, search, isActive } = req.query;
      const { page, limit } = paginationSchema.parse(req.query);

      const result = await patientService.findAll({
        cabinetId: cabinetId as string,
        search: search as string,
        isActive: isActive === 'true',
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
      const data = updatePatientSchema.parse(req.body);
      const patient = await patientService.update(id, data);
      sendSuccess(res, patient, 'Patient updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await patientService.delete(id);
      sendSuccess(res, null, 'Patient deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const history = await patientService.getHistory(id);
      sendSuccess(res, history);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stats = await patientService.getStats(id);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

export default new PatientController();
