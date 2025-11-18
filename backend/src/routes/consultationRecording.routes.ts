import { Router } from 'express';
import consultationRecordingController from '../controllers/consultationRecording.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create recording
router.post(
  '/',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  consultationRecordingController.create
);

// Start recording
router.post(
  '/:consultationId/start',
  authorize('PRACTITIONER'),
  consultationRecordingController.startRecording
);

// Process recording with AI
router.post(
  '/:id/process',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  consultationRecordingController.processRecording
);

// Get by consultation ID
router.get(
  '/consultation/:consultationId',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  consultationRecordingController.getByConsultationId
);

// Get by ID
router.get(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  consultationRecordingController.getById
);

// Get cabinet recordings
router.get(
  '/cabinet/:cabinetId',
  authorize('ADMIN_CABINET'),
  consultationRecordingController.getCabinetRecordings
);

// Get statistics
router.get(
  '/cabinet/:cabinetId/statistics',
  authorize('ADMIN_CABINET'),
  consultationRecordingController.getStatistics
);

// Delete recording
router.delete(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  consultationRecordingController.delete
);

export default router;
