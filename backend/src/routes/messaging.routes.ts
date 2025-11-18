import { Router } from 'express';
import messagingController from '../controllers/messaging.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Send message
router.post(
  '/',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY', 'PATIENT'),
  messagingController.send
);

// Get inbox
router.get(
  '/inbox/:userId',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY', 'PATIENT'),
  messagingController.getInbox
);

// Get sent messages
router.get(
  '/sent/:userId',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY', 'PATIENT'),
  messagingController.getSent
);

// Get conversation thread
router.get(
  '/thread/:threadId',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY', 'PATIENT'),
  messagingController.getThread
);

// Mark as read
router.put(
  '/:id/read',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY', 'PATIENT'),
  messagingController.markAsRead
);

// Archive message
router.put(
  '/:id/archive',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY', 'PATIENT'),
  messagingController.archive
);

// Get unread count
router.get(
  '/unread/:userId/count',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY', 'PATIENT'),
  messagingController.getUnreadCount
);

// Get urgent messages
router.get(
  '/urgent/:userId',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY', 'PATIENT'),
  messagingController.getUrgentMessages
);

// Search messages
router.get(
  '/search/:userId',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY', 'PATIENT'),
  messagingController.search
);

// Delete message
router.delete(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY', 'PATIENT'),
  messagingController.delete
);

export default router;
