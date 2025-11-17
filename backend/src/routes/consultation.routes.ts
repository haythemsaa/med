import { Router } from 'express';
import consultationController from '../controllers/consultation.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Consultation CRUD
router.post(
  '/',
  authorize('PRACTITIONER'),
  consultationController.create
);

router.get(
  '/',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  consultationController.findAll
);

router.get(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'PATIENT'),
  consultationController.findById
);

router.put(
  '/:id',
  authorize('PRACTITIONER'),
  consultationController.update
);

router.delete(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  consultationController.delete
);

// Get consultation by appointment
router.get(
  '/appointment/:appointmentId',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'PATIENT'),
  consultationController.getByAppointment
);

// Get patient history
router.get(
  '/patient/:patientId/history',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'PATIENT'),
  consultationController.getPatientHistory
);

export default router;
