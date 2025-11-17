import { Request, Response } from 'express';
import AnalyticsService from '../services/analytics.service';

export class AnalyticsController {
  async getDashboardStats(req: Request, res: Response) {
    try {
      const { cabinetId } = req.params;

      const stats = await AnalyticsService.getDashboardStats(cabinetId);

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

  async predictNoShow(req: Request, res: Response) {
    try {
      const appointmentData = req.body;

      const probability = await AnalyticsService.predictNoShow(appointmentData);

      res.json({
        success: true,
        data: {
          probability,
          risk: probability > 0.5 ? 'high' : probability > 0.3 ? 'medium' : 'low',
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getForecastRevenue(req: Request, res: Response) {
    try {
      const { cabinetId } = req.params;

      const forecast = await AnalyticsService.getForecastRevenue(cabinetId);

      res.json({
        success: true,
        data: forecast,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getPopularTimes(req: Request, res: Response) {
    try {
      const { cabinetId } = req.params;
      const { practitionerId } = req.query;

      const times = await AnalyticsService.getPopularTimes(
        cabinetId,
        practitionerId as string | undefined
      );

      res.json({
        success: true,
        data: times,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getPractitionerPerformance(req: Request, res: Response) {
    try {
      const { practitionerId } = req.params;
      const { startDate, endDate } = req.query;

      const performance = await AnalyticsService.getPractitionerPerformance(
        practitionerId,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json({
        success: true,
        data: performance,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getPatientEngagement(req: Request, res: Response) {
    try {
      const { cabinetId } = req.params;

      const engagement = await AnalyticsService.getPatientEngagement(cabinetId);

      res.json({
        success: true,
        data: engagement,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getChurnRiskPatients(req: Request, res: Response) {
    try {
      const { cabinetId } = req.params;

      const patients = await AnalyticsService.getChurnRiskPatients(cabinetId);

      res.json({
        success: true,
        data: patients,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new AnalyticsController();
