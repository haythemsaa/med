import { Router } from 'express';
import authRoutes from './auth.routes';
import cabinetRoutes from './cabinet.routes';
import patientRoutes from './patient.routes';
import practitionerRoutes from './practitioner.routes';
import appointmentRoutes from './appointment.routes';
import consultationRoutes from './consultation.routes';
import documentRoutes from './document.routes';
import teleconsultationRoutes from './teleconsultation.routes';
import questionnaireRoutes from './questionnaire.routes';
import analyticsRoutes from './analytics.routes';
import publicBookingRoutes from './publicBooking.routes';
import prescriptionRoutes from './prescription.routes';
import reviewRoutes from './review.routes';
import automatedReminderRoutes from './automatedReminder.routes';
import paymentRoutes from './payment.routes';
import messagingRoutes from './messaging.routes';
import vaccinationRoutes from './vaccination.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MediCare API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    features: [
      'Core Management',
      'Teleconsultation',
      'AI Analytics',
      'Public Booking',
      'Questionnaires',
      'GDPR Compliance',
      'E-Prescription (France)',
      'Patient Reviews',
      'Automated Reminders',
      'Online Payments',
      'Secure Messaging',
      'Digital Vaccination Card'
    ]
  });
});

// Core API Routes
router.use('/auth', authRoutes);
router.use('/cabinets', cabinetRoutes);
router.use('/patients', patientRoutes);
router.use('/practitioners', practitionerRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/consultations', consultationRoutes);
router.use('/documents', documentRoutes);

// Advanced Features Routes
router.use('/teleconsultations', teleconsultationRoutes);
router.use('/questionnaires', questionnaireRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/public-booking', publicBookingRoutes);

// Competitive Features Routes (2025)
router.use('/prescriptions', prescriptionRoutes);
router.use('/reviews', reviewRoutes);
router.use('/reminders', automatedReminderRoutes);
router.use('/payments', paymentRoutes);
router.use('/messages', messagingRoutes);
router.use('/vaccinations', vaccinationRoutes);

export default router;
