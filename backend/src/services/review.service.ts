import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Review Service
 * Patient reviews and ratings system
 * 81% of patients consult reviews before choosing a provider
 */
export class ReviewService {
  /**
   * Create a review
   */
  async create(data: {
    cabinetId: string;
    patientId: string;
    practitionerId?: string;
    appointmentId?: string;
    overallRating: number;
    waitTimeRating?: number;
    staffRating?: number;
    facilityRating?: number;
    title?: string;
    comment?: string;
  }) {
    // Validate ratings (1-5)
    if (data.overallRating < 1 || data.overallRating > 5) {
      throw new Error('Overall rating must be between 1 and 5');
    }

    return await prisma.review.create({
      data: {
        ...data,
        isApproved: false, // Requires moderation
        isPublic: false,
      },
    });
  }

  /**
   * Get cabinet reviews
   */
  async getCabinetReviews(cabinetId: string, publicOnly: boolean = true) {
    return await prisma.review.findMany({
      where: {
        cabinetId,
        ...(publicOnly && { isPublic: true, isApproved: true }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get practitioner reviews
   */
  async getPractitionerReviews(practitionerId: string, publicOnly: boolean = true) {
    return await prisma.review.findMany({
      where: {
        practitionerId,
        ...(publicOnly && { isPublic: true, isApproved: true }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Moderate review (approve/reject)
   */
  async moderate(reviewId: string, isApproved: boolean, moderatedBy: string) {
    return await prisma.review.update({
      where: { id: reviewId },
      data: {
        isApproved,
        isPublic: isApproved,
        moderatedAt: new Date(),
        moderatedBy,
      },
    });
  }

  /**
   * Respond to review
   */
  async respond(reviewId: string, response: string) {
    return await prisma.review.update({
      where: { id: reviewId },
      data: {
        response,
        respondedAt: new Date(),
      },
    });
  }

  /**
   * Get cabinet average ratings
   */
  async getCabinetAverageRatings(cabinetId: string) {
    const reviews = await prisma.review.findMany({
      where: {
        cabinetId,
        isApproved: true,
        isPublic: true,
      },
    });

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageOverall: 0,
        averageWaitTime: 0,
        averageStaff: 0,
        averageFacility: 0,
        distribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      };
    }

    const averageOverall =
      reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length;

    const waitTimeRatings = reviews.filter((r) => r.waitTimeRating !== null);
    const averageWaitTime =
      waitTimeRatings.length > 0
        ? waitTimeRatings.reduce((sum, r) => sum + (r.waitTimeRating || 0), 0) /
          waitTimeRatings.length
        : 0;

    const staffRatings = reviews.filter((r) => r.staffRating !== null);
    const averageStaff =
      staffRatings.length > 0
        ? staffRatings.reduce((sum, r) => sum + (r.staffRating || 0), 0) / staffRatings.length
        : 0;

    const facilityRatings = reviews.filter((r) => r.facilityRating !== null);
    const averageFacility =
      facilityRatings.length > 0
        ? facilityRatings.reduce((sum, r) => sum + (r.facilityRating || 0), 0) /
          facilityRatings.length
        : 0;

    // Rating distribution
    const distribution: any = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews.forEach((r) => {
      distribution[r.overallRating]++;
    });

    return {
      totalReviews: reviews.length,
      averageOverall: Math.round(averageOverall * 10) / 10,
      averageWaitTime: Math.round(averageWaitTime * 10) / 10,
      averageStaff: Math.round(averageStaff * 10) / 10,
      averageFacility: Math.round(averageFacility * 10) / 10,
      distribution,
    };
  }

  /**
   * Get practitioner average rating
   */
  async getPractitionerAverageRating(practitionerId: string) {
    const reviews = await prisma.review.findMany({
      where: {
        practitionerId,
        isApproved: true,
        isPublic: true,
      },
    });

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
      };
    }

    const averageRating =
      reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length;

    return {
      totalReviews: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  }

  /**
   * Check if patient can review appointment
   */
  async canReviewAppointment(appointmentId: string, patientId: string): Promise<boolean> {
    // Check if appointment is completed
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment || appointment.status !== 'COMPLETED') {
      return false;
    }

    if (appointment.patientId !== patientId) {
      return false;
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findUnique({
      where: { appointmentId },
    });

    return !existingReview;
  }

  /**
   * Get reviews pending moderation
   */
  async getPendingReviews(cabinetId: string) {
    return await prisma.review.findMany({
      where: {
        cabinetId,
        isApproved: false,
        moderatedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Delete review
   */
  async delete(reviewId: string) {
    return await prisma.review.delete({
      where: { id: reviewId },
    });
  }
}

export default new ReviewService();
