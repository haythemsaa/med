import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import reviewService from '../services/review.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const createReviewSchema = z.object({
  cabinetId: z.string().uuid(),
  patientId: z.string().uuid(),
  practitionerId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
  overallRating: z.number().min(1).max(5),
  waitTimeRating: z.number().min(1).max(5).optional(),
  staffRating: z.number().min(1).max(5).optional(),
  facilityRating: z.number().min(1).max(5).optional(),
  title: z.string().optional(),
  comment: z.string().optional(),
});

const moderateReviewSchema = z.object({
  isApproved: z.boolean(),
  moderatedBy: z.string().uuid(),
});

const respondToReviewSchema = z.object({
  response: z.string().min(1),
});

export class ReviewController {
  /**
   * Create review
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createReviewSchema.parse(req.body);

      // Check if patient can review
      if (data.appointmentId) {
        const canReview = await reviewService.canReviewAppointment(
          data.appointmentId,
          data.patientId
        );

        if (!canReview) {
          return res.status(400).json({
            success: false,
            message: 'Cannot review this appointment',
          });
        }
      }

      const review = await reviewService.create(data);
      sendSuccess(res, review, 'Review submitted successfully. It will be published after moderation.', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cabinet reviews
   */
  async getCabinetReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { cabinetId } = req.params;
      const { publicOnly } = req.query;

      const reviews = await reviewService.getCabinetReviews(
        cabinetId,
        publicOnly !== 'false'
      );

      sendSuccess(res, reviews);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get practitioner reviews
   */
  async getPractitionerReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { practitionerId } = req.params;
      const { publicOnly } = req.query;

      const reviews = await reviewService.getPractitionerReviews(
        practitionerId,
        publicOnly !== 'false'
      );

      sendSuccess(res, reviews);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cabinet average ratings
   */
  async getCabinetAverageRatings(req: Request, res: Response, next: NextFunction) {
    try {
      const { cabinetId } = req.params;
      const ratings = await reviewService.getCabinetAverageRatings(cabinetId);
      sendSuccess(res, ratings);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get practitioner average rating
   */
  async getPractitionerAverageRating(req: Request, res: Response, next: NextFunction) {
    try {
      const { practitionerId } = req.params;
      const rating = await reviewService.getPractitionerAverageRating(practitionerId);
      sendSuccess(res, rating);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Moderate review
   */
  async moderate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isApproved, moderatedBy } = moderateReviewSchema.parse(req.body);

      const review = await reviewService.moderate(id, isApproved, moderatedBy);
      sendSuccess(res, review, 'Review moderated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Respond to review
   */
  async respond(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { response } = respondToReviewSchema.parse(req.body);

      const review = await reviewService.respond(id, response);
      sendSuccess(res, review, 'Response posted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pending reviews
   */
  async getPendingReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { cabinetId } = req.params;
      const reviews = await reviewService.getPendingReviews(cabinetId);
      sendSuccess(res, reviews);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete review
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await reviewService.delete(id);
      sendSuccess(res, null, 'Review deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new ReviewController();
