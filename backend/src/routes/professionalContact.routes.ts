import { Router } from 'express';
import professionalContactController from '../controllers/professionalContact.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create contact
router.post(
  '/',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY'),
  professionalContactController.create
);

// Get cabinet contacts
router.get(
  '/cabinet/:cabinetId',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY'),
  professionalContactController.getCabinetContacts
);

// Get by type
router.get(
  '/cabinet/:cabinetId/type',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY'),
  professionalContactController.getByType
);

// Get statistics
router.get(
  '/cabinet/:cabinetId/statistics',
  authorize('ADMIN_CABINET'),
  professionalContactController.getStatistics
);

// Update contact
router.put(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY'),
  professionalContactController.update
);

// Share contact
router.post(
  '/:id/share',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY'),
  professionalContactController.share
);

// Delete contact
router.delete(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY'),
  professionalContactController.delete
);

export default router;
