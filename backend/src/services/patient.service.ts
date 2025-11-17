import { Gender, BloodGroup } from '@prisma/client';
import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';
import logger from '../utils/logger';

export interface CreatePatientDTO {
  cabinetId: string;
  userId?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  bloodGroup?: BloodGroup;
  allergies?: string;
  chronicDiseases?: string;
  currentMedications?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  insuranceCompany?: string;
  insuranceNumber?: string;
}

export interface UpdatePatientDTO extends Partial<CreatePatientDTO> {}

export class PatientService {
  async create(data: CreatePatientDTO) {
    // Check if phone already exists in this cabinet
    const existingPhone = await prisma.patient.findFirst({
      where: {
        cabinetId: data.cabinetId,
        phone: data.phone,
      },
    });

    if (existingPhone) {
      throw new ConflictError('A patient with this phone number already exists in this cabinet');
    }

    const patient = await prisma.patient.create({
      data,
    });

    logger.info(`Patient created: ${patient.id}`);
    return patient;
  }

  async findById(id: string) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            isActive: true,
          },
        },
        appointments: {
          take: 10,
          orderBy: { startTime: 'desc' },
          include: {
            practitioner: {
              select: {
                firstName: true,
                lastName: true,
                speciality: true,
              },
            },
          },
        },
        consultations: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            appointments: true,
            consultations: true,
            documents: true,
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    return patient;
  }

  async findAll(filters: {
    cabinetId: string;
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { cabinetId, page = 1, limit = 20, search, ...where } = filters;
    const skip = (page - 1) * limit;

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where: {
          cabinetId,
          ...where,
          ...(search && {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        include: {
          _count: {
            select: {
              appointments: true,
              consultations: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.patient.count({
        where: {
          cabinetId,
          ...where,
          ...(search && {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
            ],
          }),
        },
      }),
    ]);

    return {
      data: patients,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: UpdatePatientDTO) {
    const patient = await prisma.patient.update({
      where: { id },
      data,
    });

    logger.info(`Patient updated: ${patient.id}`);
    return patient;
  }

  async delete(id: string) {
    await prisma.patient.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info(`Patient deactivated: ${id}`);
  }

  async getHistory(patientId: string) {
    const [consultations, appointments, documents] = await Promise.all([
      prisma.consultation.findMany({
        where: { patientId },
        include: {
          practitioner: {
            select: {
              firstName: true,
              lastName: true,
              speciality: true,
            },
          },
          appointment: {
            select: {
              startTime: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.appointment.findMany({
        where: { patientId },
        include: {
          practitioner: {
            select: {
              firstName: true,
              lastName: true,
              speciality: true,
            },
          },
        },
        orderBy: { startTime: 'desc' },
      }),
      prisma.document.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      consultations,
      appointments,
      documents,
    };
  }

  async getStats(patientId: string) {
    const [totalVisits, upcomingAppointments, lastVisit, noShowCount] = await Promise.all([
      prisma.consultation.count({ where: { patientId } }),
      prisma.appointment.count({
        where: {
          patientId,
          status: 'SCHEDULED',
          startTime: { gte: new Date() },
        },
      }),
      prisma.consultation.findFirst({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      prisma.patient.findUnique({
        where: { id: patientId },
        select: { noShowCount: true },
      }),
    ]);

    return {
      totalVisits,
      upcomingAppointments,
      lastVisit: lastVisit?.createdAt,
      noShowCount: noShowCount?.noShowCount || 0,
    };
  }
}

export default new PatientService();
