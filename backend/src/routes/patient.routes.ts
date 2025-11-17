import { Router } from 'express';
import patientController from '../controllers/patient.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Patient CRUD
router.post(
  '/',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY'),
  patientController.create
);

router.get(
  '/',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY'),
  patientController.findAll
);

router.get(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY', 'PATIENT'),
  patientController.findById
);

router.put(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY'),
  patientController.update
);

router.delete(
  '/:id',
  authorize('ADMIN_CABINET'),
  patientController.delete
);

// Patient history and stats
router.get(
  '/:id/history',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'PATIENT'),
  patientController.getHistory
);

router.get(
  '/:id/stats',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  patientController.getStats
);

export default router;
