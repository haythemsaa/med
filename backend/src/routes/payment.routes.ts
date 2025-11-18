import { Router } from 'express';
import paymentController from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create payment intent (Stripe)
router.post(
  '/intent',
  authorize('ADMIN_CABINET', 'SECRETARY', 'PATIENT'),
  paymentController.createPaymentIntent
);

// Confirm payment
router.put(
  '/:id/confirm',
  authorize('ADMIN_CABINET', 'SECRETARY'),
  paymentController.confirmPayment
);

// Process cash payment
router.post(
  '/cash',
  authorize('ADMIN_CABINET', 'SECRETARY'),
  paymentController.processCashPayment
);

// Refund payment
router.post(
  '/:id/refund',
  authorize('ADMIN_CABINET'),
  paymentController.refund
);

// Get patient payments
router.get(
  '/patient/:patientId',
  authorize('ADMIN_CABINET', 'SECRETARY', 'PATIENT'),
  paymentController.getPatientPayments
);

// Get cabinet payments
router.get(
  '/cabinet/:cabinetId',
  authorize('ADMIN_CABINET'),
  paymentController.getCabinetPayments
);

// Get payment statistics
router.get(
  '/cabinet/:cabinetId/statistics',
  authorize('ADMIN_CABINET'),
  paymentController.getStatistics
);

// Generate receipt
router.post(
  '/:id/receipt',
  authorize('ADMIN_CABINET', 'SECRETARY'),
  paymentController.generateReceipt
);

export default router;
