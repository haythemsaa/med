import { Router } from 'express';
import reviewController from '../controllers/review.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public routes (for viewing reviews)
router.get(
  '/cabinet/:cabinetId',
  reviewController.getCabinetReviews
);

router.get(
  '/cabinet/:cabinetId/ratings',
  reviewController.getCabinetAverageRatings
);

router.get(
  '/practitioner/:practitionerId',
  reviewController.getPractitionerReviews
);

router.get(
  '/practitioner/:practitionerId/rating',
  reviewController.getPractitionerAverageRating
);

// Authenticated routes
router.use(authenticate);

router.post(
  '/',
  authorize('PATIENT'),
  reviewController.create
);

router.get(
  '/cabinet/:cabinetId/pending',
  authorize('ADMIN_CABINET'),
  reviewController.getPendingReviews
);

router.put(
  '/:id/moderate',
  authorize('ADMIN_CABINET'),
  reviewController.moderate
);

router.put(
  '/:id/respond',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  reviewController.respond
);

router.delete(
  '/:id',
  authorize('ADMIN_CABINET'),
  reviewController.delete
);

export default router;
