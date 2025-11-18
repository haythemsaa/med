import { Router } from 'express';
import familyHistoryController from '../controllers/familyHistory.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create family history entry
router.post(
  '/',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  familyHistoryController.create
);

// Get patient history
router.get(
  '/patient/:patientId',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'PATIENT'),
  familyHistoryController.getPatientHistory
);

// Get by condition
router.get(
  '/patient/:patientId/condition',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  familyHistoryController.getByCondition
);

// Get family tree summary
router.get(
  '/patient/:patientId/summary',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'PATIENT'),
  familyHistoryController.getFamilyTreeSummary
);

// Update entry
router.put(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  familyHistoryController.update
);

// Delete entry
router.delete(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  familyHistoryController.delete
);

export default router;
