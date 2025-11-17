import { Router } from 'express';
import PublicBookingController from '../controllers/publicBooking.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes (no authentication required)
router.get('/pages/:slug', PublicBookingController.getPageData);
router.get('/pages/:slug/slots', PublicBookingController.getAvailableSlots);
router.post('/book', PublicBookingController.bookAppointment);
router.get('/slug/:slug/availability', PublicBookingController.checkSlugAvailability);

// Protected routes (require authentication)
router.post('/pages', authenticate, PublicBookingController.createOrUpdatePage);
router.get('/cabinets/:cabinetId/stats', authenticate, PublicBookingController.getStatistics);

export default router;
