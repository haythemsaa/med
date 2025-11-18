import { Router } from 'express';
import mspMeetingController from '../controllers/mspMeeting.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create meeting
router.post(
  '/',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  mspMeetingController.create
);

// Add participants
router.post(
  '/:id/participants',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  mspMeetingController.addParticipants
);

// Suggest participants
router.get(
  '/cabinet/:cabinetId/suggest-participants',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  mspMeetingController.suggestParticipants
);

// Update attendance
router.put(
  '/participant/:participantId/attendance',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY'),
  mspMeetingController.updateAttendance
);

// Start meeting
router.post(
  '/:id/start',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  mspMeetingController.startMeeting
);

// Complete meeting
router.post(
  '/:id/complete',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  mspMeetingController.completeMeeting
);

// Get by ID
router.get(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY'),
  mspMeetingController.getById
);

// Get cabinet meetings
router.get(
  '/cabinet/:cabinetId',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY'),
  mspMeetingController.getCabinetMeetings
);

// Get user meetings
router.get(
  '/user/:userId',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY'),
  mspMeetingController.getUserMeetings
);

// Delete meeting
router.delete(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  mspMeetingController.delete
);

export default router;
