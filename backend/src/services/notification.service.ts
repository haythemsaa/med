import { NotificationType, NotificationStatus } from '@prisma/client';
import prisma from '../config/database';
import logger from '../utils/logger';
import emailService from './email.service';
import smsService from './sms.service';

export interface SendNotificationDTO {
  userId?: string;
  type: NotificationType;
  recipientEmail?: string;
  recipientPhone?: string;
  subject?: string;
  message: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  async send(data: SendNotificationDTO) {
    // Create notification record
    const notification = await prisma.notification.create({
      data: {
        ...data,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        status: 'PENDING',
      },
    });

    // Send based on type
    try {
      let sent = false;

      switch (data.type) {
        case 'EMAIL':
          if (data.recipientEmail && data.subject) {
            await emailService.send({
              to: data.recipientEmail,
              subject: data.subject,
              html: data.message,
            });
            sent = true;
          }
          break;

        case 'SMS':
          if (data.recipientPhone) {
            await smsService.send({
              to: data.recipientPhone,
              message: data.message,
            });
            sent = true;
          }
          break;

        case 'WHATSAPP':
          // TODO: Implement WhatsApp Business API
          logger.info('WhatsApp notification not implemented yet');
          break;

        default:
          logger.warn(`Unknown notification type: ${data.type}`);
      }

      if (sent) {
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
          },
        });
      }

      return notification;
    } catch (error: any) {
      logger.error('Notification send error:', error);

      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'FAILED',
          failedAt: new Date(),
          errorMessage: error.message,
        },
      });

      throw error;
    }
  }

  async sendAppointmentConfirmation(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        practitioner: true,
        cabinet: true,
      },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const message = `Bonjour ${appointment.patient.firstName},\n\nVotre rendez-vous avec Dr. ${appointment.practitioner.firstName} ${appointment.practitioner.lastName} est confirmé le ${appointment.startTime.toLocaleDateString('fr-TN')} à ${appointment.startTime.toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })}.\n\nCabinet: ${appointment.cabinet.name}\nAdresse: ${appointment.cabinet.address}\n\nMerci.`;

    const promises = [];

    // Send SMS
    if (appointment.patient.phone) {
      promises.push(
        this.send({
          type: 'SMS',
          recipientPhone: appointment.patient.phone,
          message,
          metadata: { appointmentId },
        })
      );
    }

    // Send Email
    if (appointment.patient.email) {
      promises.push(
        this.send({
          type: 'EMAIL',
          recipientEmail: appointment.patient.email,
          subject: 'Confirmation de rendez-vous',
          message: `<p>${message.replace(/\n/g, '<br>')}</p>`,
          metadata: { appointmentId },
        })
      );
    }

    await Promise.all(promises);
  }

  async sendAppointmentReminder(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        practitioner: true,
        cabinet: true,
      },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const message = `Rappel: Vous avez un rendez-vous demain le ${appointment.startTime.toLocaleDateString('fr-TN')} à ${appointment.startTime.toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })} avec Dr. ${appointment.practitioner.firstName} ${appointment.practitioner.lastName}.\n\nCabinet: ${appointment.cabinet.name}`;

    if (appointment.patient.phone) {
      await this.send({
        type: 'SMS',
        recipientPhone: appointment.patient.phone,
        message,
        metadata: { appointmentId },
      });
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { reminderSentAt: new Date() },
    });
  }

  async findAll(filters: {
    userId?: string;
    type?: NotificationType;
    status?: NotificationStatus;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 20, ...where } = filters;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      data: notifications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(id: string) {
    return await prisma.notification.update({
      where: { id },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });
  }
}

export default new NotificationService();
