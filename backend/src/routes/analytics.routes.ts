import { Router } from 'express';
import AnalyticsController from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Dashboard statistics
router.get('/cabinets/:cabinetId/dashboard', AnalyticsController.getDashboardStats);

// AI Predictions
router.post('/predict-noshow', AnalyticsController.predictNoShow);

// Revenue forecast
router.get('/cabinets/:cabinetId/forecast-revenue', AnalyticsController.getForecastRevenue);

// Popular times
router.get('/cabinets/:cabinetId/popular-times', AnalyticsController.getPopularTimes);

// Practitioner performance
router.get('/practitioners/:practitionerId/performance', AnalyticsController.getPractitionerPerformance);

// Patient engagement
router.get('/cabinets/:cabinetId/engagement', AnalyticsController.getPatientEngagement);

// Churn risk
router.get('/cabinets/:cabinetId/churn-risk', AnalyticsController.getChurnRiskPatients);

export default router;
