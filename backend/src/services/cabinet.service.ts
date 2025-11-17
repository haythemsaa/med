import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';
import logger from '../utils/logger';
import { hashPassword } from '../utils/encryption';

export interface CreateCabinetDTO {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  adminEmail: string;
  adminPassword: string;
  subscriptionPlan?: SubscriptionPlan;
}

export interface UpdateCabinetDTO {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  logo?: string;
  allowOnlineBooking?: boolean;
  minBookingDelay?: number;
  maxBookingDelay?: number;
  defaultAppointmentDuration?: number;
}

export class CabinetService {
  async create(data: CreateCabinetDTO) {
    // Check if slug already exists
    const slug = this.generateSlug(data.name);
    const existingSlug = await prisma.cabinet.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      throw new ConflictError('A cabinet with this name already exists');
    }

    // Hash admin password
    const hashedPassword = await hashPassword(data.adminPassword);

    // Create cabinet with admin user in transaction
    const cabinet = await prisma.$transaction(async (tx) => {
      // Create admin user
      const admin = await tx.user.create({
        data: {
          email: data.adminEmail,
          password: hashedPassword,
          role: 'ADMIN_CABINET',
          isEmailVerified: false,
        },
      });

      // Create cabinet
      const newCabinet = await tx.cabinet.create({
        data: {
          name: data.name,
          slug,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          adminId: admin.id,
          subscriptionPlan: data.subscriptionPlan || 'FREE',
          subscriptionStatus: 'TRIAL',
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        include: {
          admin: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return newCabinet;
    });

    logger.info(`Cabinet created: ${cabinet.name} (${cabinet.id})`);

    return cabinet;
  }

  async findById(id: string) {
    const cabinet = await prisma.cabinet.findUnique({
      where: { id },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: {
            practitioners: true,
            secretaries: true,
            patients: true,
            appointments: true,
          },
        },
      },
    });

    if (!cabinet) {
      throw new NotFoundError('Cabinet not found');
    }

    return cabinet;
  }

  async findAll(filters: {
    page?: number;
    limit?: number;
    search?: string;
    subscriptionStatus?: SubscriptionStatus;
    isActive?: boolean;
  }) {
    const { page = 1, limit = 20, search, ...where } = filters;
    const skip = (page - 1) * limit;

    const [cabinets, total] = await Promise.all([
      prisma.cabinet.findMany({
        where: {
          ...where,
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        include: {
          admin: {
            select: {
              email: true,
            },
          },
          _count: {
            select: {
              practitioners: true,
              patients: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.cabinet.count({
        where: {
          ...where,
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
      }),
    ]);

    return {
      data: cabinets,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: UpdateCabinetDTO) {
    const cabinet = await prisma.cabinet.update({
      where: { id },
      data,
    });

    logger.info(`Cabinet updated: ${cabinet.id}`);

    return cabinet;
  }

  async updateSubscription(
    id: string,
    plan: SubscriptionPlan,
    status: SubscriptionStatus
  ) {
    const cabinet = await prisma.cabinet.update({
      where: { id },
      data: {
        subscriptionPlan: plan,
        subscriptionStatus: status,
        ...(status === 'ACTIVE' && {
          subscriptionEndsAt: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ), // 1 year
        }),
      },
    });

    logger.info(
      `Cabinet subscription updated: ${cabinet.id} - ${plan} (${status})`
    );

    return cabinet;
  }

  async suspend(id: string) {
    const cabinet = await prisma.cabinet.update({
      where: { id },
      data: {
        isActive: false,
        subscriptionStatus: 'SUSPENDED',
      },
    });

    logger.info(`Cabinet suspended: ${cabinet.id}`);

    return cabinet;
  }

  async activate(id: string) {
    const cabinet = await prisma.cabinet.update({
      where: { id },
      data: {
        isActive: true,
        subscriptionStatus: 'ACTIVE',
      },
    });

    logger.info(`Cabinet activated: ${cabinet.id}`);

    return cabinet;
  }

  async delete(id: string) {
    await prisma.cabinet.delete({
      where: { id },
    });

    logger.info(`Cabinet deleted: ${id}`);
  }

  async getStats(id: string) {
    const [
      totalPatients,
      totalAppointments,
      totalPractitioners,
      appointmentsThisMonth,
    ] = await Promise.all([
      prisma.patient.count({ where: { cabinetId: id, isActive: true } }),
      prisma.appointment.count({ where: { cabinetId: id } }),
      prisma.practitioner.count({ where: { cabinetId: id, isActive: true } }),
      prisma.appointment.count({
        where: {
          cabinetId: id,
          startTime: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    return {
      totalPatients,
      totalAppointments,
      totalPractitioners,
      appointmentsThisMonth,
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

export default new CabinetService();
