import { Router } from 'express';
import appointmentController from '../controllers/appointment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Appointment CRUD
router.post(
  '/',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY', 'PATIENT'),
  appointmentController.create
);

router.get(
  '/',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY'),
  appointmentController.findAll
);

router.get(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY', 'PATIENT'),
  appointmentController.findById
);

router.put(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY'),
  appointmentController.update
);

router.delete(
  '/:id',
  authorize('ADMIN_CABINET', 'SECRETARY'),
  appointmentController.delete
);

// Appointment actions
router.put(
  '/:id/cancel',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY', 'PATIENT'),
  appointmentController.cancel
);

router.put(
  '/:id/no-show',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY'),
  appointmentController.markAsNoShow
);

// Available slots
router.get(
  '/available-slots',
  appointmentController.getAvailableSlots
);

export default router;
