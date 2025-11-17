import { Request, Response } from 'express';
import { z } from 'zod';
import QuestionnaireService from '../services/questionnaire.service';

const createQuestionnaireSchema = z.object({
  cabinetId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  showBeforeBooking: z.boolean().optional(),
  questions: z.array(z.any()),
});

const updateQuestionnaireSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  showBeforeBooking: z.boolean().optional(),
  questions: z.array(z.any()).optional(),
});

const submitResponseSchema = z.object({
  questionnaireId: z.string().uuid(),
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  answers: z.array(z.any()),
});

export class QuestionnaireController {
  async create(req: Request, res: Response) {
    try {
      const data = createQuestionnaireSchema.parse(req.body);

      const questionnaire = await QuestionnaireService.create(data);

      res.status(201).json({
        success: true,
        data: questionnaire,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { cabinetId } = req.params;
      const { activeOnly } = req.query;

      const questionnaires = await QuestionnaireService.getAll(
        cabinetId,
        activeOnly === 'true'
      );

      res.json({
        success: true,
        data: questionnaires,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const questionnaire = await QuestionnaireService.getById(id);

      if (!questionnaire) {
        return res.status(404).json({
          success: false,
          message: 'Questionnaire not found',
        });
      }

      res.json({
        success: true,
        data: questionnaire,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getForBooking(req: Request, res: Response) {
    try {
      const { cabinetId } = req.params;

      const questionnaires = await QuestionnaireService.getForBooking(cabinetId);

      res.json({
        success: true,
        data: questionnaires,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = updateQuestionnaireSchema.parse(req.body);

      const questionnaire = await QuestionnaireService.update(id, data);

      res.json({
        success: true,
        data: questionnaire,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await QuestionnaireService.delete(id);

      res.json({
        success: true,
        message: 'Questionnaire deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async submitResponse(req: Request, res: Response) {
    try {
      const data = submitResponseSchema.parse(req.body);

      const response = await QuestionnaireService.submitResponse(data);

      res.status(201).json({
        success: true,
        data: response,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getPatientResponses(req: Request, res: Response) {
    try {
      const { patientId } = req.params;

      const responses = await QuestionnaireService.getPatientResponses(patientId);

      res.json({
        success: true,
        data: responses,
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
      const { id } = req.params;

      const stats = await QuestionnaireService.getStatistics(id);

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

export default new QuestionnaireController();
