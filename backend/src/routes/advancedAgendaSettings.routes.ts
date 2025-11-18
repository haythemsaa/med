import { Router } from 'express';
import advancedAgendaSettingsController from '../controllers/advancedAgendaSettings.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create or update settings
router.post(
  '/',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  advancedAgendaSettingsController.createOrUpdate
);

// Get settings
router.get(
  '/practitioner/:practitionerId',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  advancedAgendaSettingsController.get
);

// Enable multiple locations
router.post(
  '/:practitionerId/multiple-locations',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  advancedAgendaSettingsController.enableMultipleLocations
);

// Enable parallel consultations
router.post(
  '/:practitionerId/parallel-consultations',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  advancedAgendaSettingsController.enableParallelConsultations
);

// Set slot types by act
router.post(
  '/:practitionerId/slot-types',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  advancedAgendaSettingsController.setSlotTypesByAct
);

// Enable delay notifications
router.post(
  '/:practitionerId/delay-notifications',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  advancedAgendaSettingsController.enableDelayNotifications
);

// Get cabinet settings
router.get(
  '/cabinet/:cabinetId',
  authorize('ADMIN_CABINET'),
  advancedAgendaSettingsController.getCabinetSettings
);

// Delete settings
router.delete(
  '/:practitionerId',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  advancedAgendaSettingsController.delete
);

export default router;
