import { Router } from 'express';
import vaccinationController from '../controllers/vaccination.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Record vaccination
router.post(
  '/',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  vaccinationController.create
);

// Get patient vaccination history
router.get(
  '/patient/:patientId',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'PATIENT'),
  vaccinationController.getPatientHistory
);

// Get upcoming vaccinations (next doses due)
router.get(
  '/cabinet/:cabinetId/upcoming',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  vaccinationController.getUpcomingVaccinations
);

// Update vaccination record
router.put(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  vaccinationController.update
);

// Record next dose
router.post(
  '/:id/next-dose',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  vaccinationController.recordNextDose
);

// Get vaccination statistics
router.get(
  '/cabinet/:cabinetId/statistics',
  authorize('ADMIN_CABINET'),
  vaccinationController.getStatistics
);

// Send to DMP
router.post(
  '/:id/dmp',
  authorize('PRACTITIONER'),
  vaccinationController.sendToDMP
);

// Check vaccination coverage
router.get(
  '/patient/:patientId/coverage',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'PATIENT'),
  vaccinationController.checkCoverage
);

// Delete vaccination record
router.delete(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  vaccinationController.delete
);

export default router;
