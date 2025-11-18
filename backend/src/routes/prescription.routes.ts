import { Router } from 'express';
import prescriptionController from '../controllers/prescription.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// E-Prescription CRUD
router.post(
  '/',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  prescriptionController.create
);

router.post(
  '/:id/sign',
  authorize('PRACTITIONER'),
  prescriptionController.signAndIssue
);

router.get(
  '/qr/:qrCode',
  // Pharmacies can access via QR code (may need different auth)
  prescriptionController.getByQRCode
);

router.get(
  '/number/:prescriptionNumber',
  prescriptionController.getByNumber
);

router.post(
  '/:id/dispense',
  // Pharmacy endpoint (may need different auth)
  prescriptionController.dispense
);

router.put(
  '/:id/cancel',
  authorize('PRACTITIONER'),
  prescriptionController.cancel
);

router.get(
  '/patient/:patientId',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'PATIENT'),
  prescriptionController.getPatientPrescriptions
);

router.get(
  '/practitioner/:practitionerId',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  prescriptionController.getPractitionerPrescriptions
);

router.get(
  '/:id/validity',
  prescriptionController.checkValidity
);

router.post(
  '/:id/dmp',
  authorize('PRACTITIONER'),
  prescriptionController.sendToDMP
);

router.get(
  '/cabinet/:cabinetId/statistics',
  authorize('ADMIN_CABINET'),
  prescriptionController.getStatistics
);

export default router;
