import { Router } from 'express';
import TeleconsultationController from '../controllers/teleconsultation.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create teleconsultation session
router.post('/sessions', TeleconsultationController.createSession);

// Join session
router.post('/sessions/join', TeleconsultationController.joinSession);

// End session
router.post('/sessions/end', TeleconsultationController.endSession);

// Get session by appointment
router.get('/appointments/:appointmentId', TeleconsultationController.getByAppointment);

// Get statistics
router.get('/cabinets/:cabinetId/stats', TeleconsultationController.getStatistics);

export default router;
