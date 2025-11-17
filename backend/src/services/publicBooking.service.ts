import { PrismaClient } from '@prisma/client';
import { AppointmentService } from './appointment.service';

const prisma = new PrismaClient();

/**
 * Public Booking Service
 * Handles public-facing appointment booking pages
 */
export class PublicBookingService {
  /**
   * Create or update public booking page
   */
  async createOrUpdatePage(cabinetId: string, data: {
    slug?: string;
    customDomain?: string;
    primaryColor?: string;
    secondaryColor?: string;
    logo?: string;
    headerImage?: string;
    welcomeMessage?: string;
    description?: string;
    showPractitioners?: boolean;
    showReviews?: boolean;
    isActive?: boolean;
  }) {
    const existing = await prisma.publicBookingPage.findUnique({
      where: { cabinetId },
    });

    if (existing) {
      return await prisma.publicBookingPage.update({
        where: { cabinetId },
        data,
      });
    }

    // Generate slug from cabinet if not provided
    if (!data.slug) {
      const cabinet = await prisma.cabinet.findUnique({
        where: { id: cabinetId },
      });

      if (!cabinet) {
        throw new Error('Cabinet not found');
      }

      data.slug = cabinet.slug || this.generateSlug(cabinet.name);
    }

    return await prisma.publicBookingPage.create({
      data: {
        cabinetId,
        ...data,
      },
    });
  }

  /**
   * Get public booking page by slug
   */
  async getBySlug(slug: string) {
    const page = await prisma.publicBookingPage.findUnique({
      where: { slug },
    });

    if (!page || !page.isActive) {
      throw new Error('Booking page not found or inactive');
    }

    return page;
  }

  /**
   * Get public booking page data (for rendering)
   */
  async getPublicPageData(slug: string) {
    const page = await this.getBySlug(slug);

    const cabinet = await prisma.cabinet.findUnique({
      where: { id: page.cabinetId },
      include: {
        practitioners: {
          where: { isActive: true },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            title: true,
            speciality: true,
            specialityDetails: true,
            bio: true,
            photo: true,
            consultationFee: true,
            teleconsultationFee: true,
            allowTeleconsultation: true,
          },
        },
        rooms: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!cabinet) {
      throw new Error('Cabinet not found');
    }

    return {
      page,
      cabinet: {
        id: cabinet.id,
        name: cabinet.name,
        description: cabinet.description,
        address: cabinet.address,
        city: cabinet.city,
        phone: cabinet.phone,
        email: cabinet.email,
        timezone: cabinet.timezone,
        practitioners: page.showPractitioners ? cabinet.practitioners : [],
        allowOnlineBooking: cabinet.allowOnlineBooking,
        minBookingDelay: cabinet.minBookingDelay,
        maxBookingDelay: cabinet.maxBookingDelay,
      },
    };
  }

  /**
   * Get available time slots for public booking
   */
  async getAvailableSlots(params: {
    slug: string;
    practitionerId: string;
    date: Date;
  }) {
    const page = await this.getBySlug(params.slug);

    // Verify practitioner belongs to this cabinet
    const practitioner = await prisma.practitioner.findFirst({
      where: {
        id: params.practitionerId,
        cabinetId: page.cabinetId,
        isActive: true,
      },
    });

    if (!practitioner) {
      throw new Error('Practitioner not found');
    }

    // Get available slots from appointment service
    const slots = await AppointmentService.getAvailableSlots(
      params.practitionerId,
      params.date
    );

    return slots;
  }

  /**
   * Book appointment via public page
   */
  async bookAppointment(params: {
    slug: string;
    practitionerId: string;
    startTime: Date;
    endTime: Date;
    type: 'CONSULTATION' | 'TELECONSULTATION';
    patient: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      dateOfBirth: Date;
      gender: 'MALE' | 'FEMALE' | 'OTHER';
    };
    reason?: string;
    notes?: string;
  }) {
    const page = await this.getBySlug(params.slug);

    // Verify cabinet allows online booking
    const cabinet = await prisma.cabinet.findUnique({
      where: { id: page.cabinetId },
    });

    if (!cabinet?.allowOnlineBooking) {
      throw new Error('Online booking is not enabled for this cabinet');
    }

    // Check minimum booking delay
    const now = new Date();
    const bookingTime = params.startTime;
    const minutesUntilBooking = Math.floor(
      (bookingTime.getTime() - now.getTime()) / 60000
    );

    if (minutesUntilBooking < cabinet.minBookingDelay) {
      throw new Error(
        `Appointments must be booked at least ${cabinet.minBookingDelay} minutes in advance`
      );
    }

    // Check maximum booking delay
    const daysUntilBooking = Math.floor(minutesUntilBooking / 1440);
    if (daysUntilBooking > cabinet.maxBookingDelay) {
      throw new Error(
        `Appointments can only be booked up to ${cabinet.maxBookingDelay} days in advance`
      );
    }

    // Find or create patient
    let patient = await prisma.patient.findFirst({
      where: {
        cabinetId: page.cabinetId,
        OR: [
          { email: params.patient.email },
          { phone: params.patient.phone },
        ],
      },
    });

    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          ...params.patient,
          cabinetId: page.cabinetId,
        },
      });
    }

    // Create appointment
    const duration = Math.floor(
      (params.endTime.getTime() - params.startTime.getTime()) / 60000
    );

    const appointment = await prisma.appointment.create({
      data: {
        cabinetId: page.cabinetId,
        practitionerId: params.practitionerId,
        patientId: patient.id,
        type: params.type,
        startTime: params.startTime,
        endTime: params.endTime,
        duration,
        reason: params.reason,
        notes: params.notes,
        isOnlineBooking: true,
        status: 'SCHEDULED',
      },
      include: {
        patient: true,
        practitioner: true,
        cabinet: true,
      },
    });

    // Send confirmation notification
    // This would be handled by a notification service
    await this.sendBookingConfirmation(appointment);

    return appointment;
  }

  /**
   * Send booking confirmation
   */
  private async sendBookingConfirmation(appointment: any) {
    // Send email and SMS confirmation
    // Implementation would use notification service
    console.log(`Sending booking confirmation for appointment ${appointment.id}`);
  }

  /**
   * Generate URL-friendly slug
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Check if slug is available
   */
  async isSlugAvailable(slug: string, excludeCabinetId?: string) {
    const existing = await prisma.publicBookingPage.findUnique({
      where: { slug },
    });

    if (!existing) return true;
    if (excludeCabinetId && existing.cabinetId === excludeCabinetId) return true;

    return false;
  }

  /**
   * Get booking statistics
   */
  async getStatistics(cabinetId: string, startDate: Date, endDate: Date) {
    const onlineBookings = await prisma.appointment.count({
      where: {
        cabinetId,
        isOnlineBooking: true,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalBookings = await prisma.appointment.count({
      where: {
        cabinetId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const onlineBookingRate = totalBookings > 0
      ? ((onlineBookings / totalBookings) * 100).toFixed(2)
      : '0';

    return {
      onlineBookings,
      totalBookings,
      onlineBookingRate: parseFloat(onlineBookingRate),
    };
  }
}

export default new PublicBookingService();
