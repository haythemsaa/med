import { Router } from 'express';
import authRoutes from './auth.routes';
import cabinetRoutes from './cabinet.routes';
import patientRoutes from './patient.routes';
import practitionerRoutes from './practitioner.routes';
import appointmentRoutes from './appointment.routes';
import consultationRoutes from './consultation.routes';
import documentRoutes from './document.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MediCare API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/cabinets', cabinetRoutes);
router.use('/patients', patientRoutes);
router.use('/practitioners', practitionerRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/consultations', consultationRoutes);
router.use('/documents', documentRoutes);

export default router;
