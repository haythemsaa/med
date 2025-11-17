import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MediCare API is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
router.use('/auth', authRoutes);

// TODO: Add other routes
// router.use('/cabinets', cabinetRoutes);
// router.use('/practitioners', practitionerRoutes);
// router.use('/patients', patientRoutes);
// router.use('/appointments', appointmentRoutes);
// router.use('/consultations', consultationRoutes);
// router.use('/documents', documentRoutes);
// router.use('/notifications', notificationRoutes);

export default router;
