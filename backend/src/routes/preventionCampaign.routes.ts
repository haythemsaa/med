import { Router } from 'express';
import preventionCampaignController from '../controllers/preventionCampaign.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create campaign
router.post(
  '/',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  preventionCampaignController.create
);

// Get cabinet campaigns
router.get(
  '/cabinet/:cabinetId',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  preventionCampaignController.getCabinetCampaigns
);

// Get target patients
router.get(
  '/:campaignId/target-patients',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  preventionCampaignController.getTargetPatients
);

// Schedule campaign
router.post(
  '/:id/schedule',
  authorize('ADMIN_CABINET'),
  preventionCampaignController.schedule
);

// Send campaign
router.post(
  '/:id/send',
  authorize('ADMIN_CABINET'),
  preventionCampaignController.send
);

// Get campaign statistics
router.get(
  '/:id/statistics',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  preventionCampaignController.getStatistics
);

// Delete campaign
router.delete(
  '/:id',
  authorize('ADMIN_CABINET'),
  preventionCampaignController.delete
);

export default router;
