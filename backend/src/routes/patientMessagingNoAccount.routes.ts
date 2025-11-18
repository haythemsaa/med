import { Router } from 'express';
import patientMessagingNoAccountController from '../controllers/patientMessagingNoAccount.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public route - get message by token (no auth required)
router.get(
  '/message/:token',
  patientMessagingNoAccountController.getByAccessToken
);

// Public route - mark as read by token (no auth required)
router.post(
  '/message/:token/read',
  patientMessagingNoAccountController.markAsRead
);

// Authenticated routes
router.use(authenticate);

// Send message to patient without account
router.post(
  '/send',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY'),
  patientMessagingNoAccountController.sendToPatientNoAccount
);

// Get statistics
router.get(
  '/cabinet/:cabinetId/statistics',
  authorize('ADMIN_CABINET'),
  patientMessagingNoAccountController.getStatistics
);

export default router;
