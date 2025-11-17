import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

export interface CreateConsultationDTO {
  cabinetId: string;
  appointmentId: string;
  practitionerId: string;
  patientId: string;
  chiefComplaint?: string;
  presentIllness?: string;
  height?: number;
  weight?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  clinicalFindings?: string;
  diagnosisPrimary?: string;
  diagnosisSecondary?: string;
  icdCodes?: string;
  prescription?: string;
  recommendations?: string;
  followUpDate?: Date;
  followUpNotes?: string;
}

export interface UpdateConsultationDTO extends Partial<CreateConsultationDTO> {}

export class ConsultationService {
  async create(data: CreateConsultationDTO) {
    // Check if consultation already exists for this appointment
    const existing = await prisma.consultation.findUnique({
      where: { appointmentId: data.appointmentId },
    });

    if (existing) {
      throw new Error('Consultation already exists for this appointment');
    }

    const consultation = await prisma.consultation.create({
      data,
      include: {
        practitioner: {
          select: {
            firstName: true,
            lastName: true,
            speciality: true,
          },
        },
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        appointment: {
          select: {
            startTime: true,
            type: true,
          },
        },
      },
    });

    // Update appointment status to completed
    await prisma.appointment.update({
      where: { id: data.appointmentId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    // Increment patient total visits
    await prisma.patient.update({
      where: { id: data.patientId },
      data: { totalVisits: { increment: 1 } },
    });

    logger.info(`Consultation created: ${consultation.id}`);
    return consultation;
  }

  async findById(id: string) {
    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: {
        practitioner: {
          select: {
            firstName: true,
            lastName: true,
            title: true,
            speciality: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
            bloodGroup: true,
            allergies: true,
            chronicDiseases: true,
          },
        },
        appointment: {
          select: {
            startTime: true,
            type: true,
          },
        },
        documents: true,
      },
    });

    if (!consultation) {
      throw new NotFoundError('Consultation not found');
    }

    return consultation;
  }

  async findAll(filters: {
    cabinetId: string;
    practitionerId?: string;
    patientId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { cabinetId, page = 1, limit = 20, startDate, endDate, ...where } = filters;
    const skip = (page - 1) * limit;

    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where: {
          cabinetId,
          ...where,
          ...(startDate && {
            createdAt: {
              gte: startDate,
              ...(endDate && { lte: endDate }),
            },
          }),
        },
        include: {
          practitioner: {
            select: {
              firstName: true,
              lastName: true,
              speciality: true,
            },
          },
          patient: {
            select: {
              firstName: true,
              lastName: true,
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
        skip,
        take: limit,
      }),
      prisma.consultation.count({
        where: {
          cabinetId,
          ...where,
        },
      }),
    ]);

    return {
      data: consultations,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: UpdateConsultationDTO) {
    const consultation = await prisma.consultation.update({
      where: { id },
      data,
    });

    logger.info(`Consultation updated: ${consultation.id}`);
    return consultation;
  }

  async delete(id: string) {
    await prisma.consultation.delete({
      where: { id },
    });

    logger.info(`Consultation deleted: ${id}`);
  }

  async getByAppointment(appointmentId: string) {
    return await prisma.consultation.findUnique({
      where: { appointmentId },
      include: {
        practitioner: {
          select: {
            firstName: true,
            lastName: true,
            title: true,
            speciality: true,
          },
        },
        patient: {
          select: {
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            allergies: true,
            chronicDiseases: true,
          },
        },
        documents: true,
      },
    });
  }

  async getPatientHistory(patientId: string) {
    return await prisma.consultation.findMany({
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
    });
  }
}

export default new ConsultationService();
