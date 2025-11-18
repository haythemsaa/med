import { Router } from 'express';
import careProtocolController from '../controllers/careProtocol.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create protocol
router.post(
  '/',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  careProtocolController.create
);

// Validate protocol
router.post(
  '/:id/validate',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  careProtocolController.validate
);

// Complete protocol
router.post(
  '/:id/complete',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  careProtocolController.complete
);

// Suspend protocol
router.post(
  '/:id/suspend',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  careProtocolController.suspend
);

// Get patient protocols
router.get(
  '/patient/:patientId',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'PATIENT'),
  careProtocolController.getPatientProtocols
);

// Get cabinet protocols
router.get(
  '/cabinet/:cabinetId',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  careProtocolController.getCabinetProtocols
);

// Get meeting protocols
router.get(
  '/meeting/:meetingId',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  careProtocolController.getMeetingProtocols
);

// Get statistics
router.get(
  '/cabinet/:cabinetId/statistics',
  authorize('ADMIN_CABINET'),
  careProtocolController.getStatistics
);

// Update protocol
router.put(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  careProtocolController.update
);

// Delete protocol
router.delete(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  careProtocolController.delete
);

export default router;
