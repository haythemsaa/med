import { Router } from 'express';
import automatedReminderController from '../controllers/automatedReminder.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create reminder
router.post(
  '/',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY'),
  automatedReminderController.create
);

// Create appointment reminders
router.post(
  '/appointment/:appointmentId',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY'),
  automatedReminderController.createAppointmentReminders
);

// Process pending reminders (cron job endpoint)
router.post(
  '/process',
  // This should be protected by API key or internal IP check
  automatedReminderController.processPendingReminders
);

// Cancel appointment reminders
router.delete(
  '/appointment/:appointmentId',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY'),
  automatedReminderController.cancelAppointmentReminders
);

// Get patient reminders
router.get(
  '/patient/:patientId',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY', 'PATIENT'),
  automatedReminderController.getPatientReminders
);

// Get statistics
router.get(
  '/cabinet/:cabinetId/statistics',
  authorize('ADMIN_CABINET'),
  automatedReminderController.getStatistics
);

export default router;
