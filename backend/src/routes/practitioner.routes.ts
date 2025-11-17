import { Router } from 'express';
import practitionerController from '../controllers/practitioner.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Practitioner CRUD
router.post(
  '/',
  authorize('ADMIN_CABINET'),
  practitionerController.create
);

router.get(
  '/',
  authorize('ADMIN_CABINET', 'SECRETARY'),
  practitionerController.findAll
);

router.get(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY'),
  practitionerController.findById
);

router.put(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  practitionerController.update
);

router.delete(
  '/:id',
  authorize('ADMIN_CABINET'),
  practitionerController.delete
);

// Schedule management
router.get(
  '/:id/schedule',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY'),
  practitionerController.getSchedule
);

router.put(
  '/:id/schedule',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  practitionerController.setSchedule
);

// Absence management
router.post(
  '/:id/absences',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  practitionerController.addAbsence
);

// Stats
router.get(
  '/:id/stats',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  practitionerController.getStats
);

export default router;
