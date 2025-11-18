import { Router } from 'express';
import allergyDetailController from '../controllers/allergyDetail.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create allergy
router.post(
  '/',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  allergyDetailController.create
);

// Get patient allergies
router.get(
  '/patient/:patientId',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'PATIENT'),
  allergyDetailController.getPatientAllergies
);

// Get by type
router.get(
  '/patient/:patientId/type',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  allergyDetailController.getByType
);

// Get allergy summary
router.get(
  '/patient/:patientId/summary',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'PATIENT'),
  allergyDetailController.getAllergySummary
);

// Update allergy
router.put(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  allergyDetailController.update
);

// Update status
router.put(
  '/:id/status',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  allergyDetailController.updateStatus
);

// Record test
router.post(
  '/:id/test',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  allergyDetailController.recordTest
);

// Delete allergy
router.delete(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  allergyDetailController.delete
);

export default router;
