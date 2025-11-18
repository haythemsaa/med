import { PrismaClient, ReminderType, NotificationStatus } from '@prisma/client';
import { NotificationService } from './notification.service';

const prisma = new PrismaClient();

/**
 * Automated Reminder Service
 * Advanced reminder system (Calendly-style)
 * Reduces no-shows significantly
 */
export class AutomatedReminderService {
  /**
   * Create reminder
   */
  async create(data: {
    cabinetId: string;
    appointmentId?: string;
    patientId: string;
    type: ReminderType;
    scheduledFor: Date;
    message: string;
    subject?: string;
    sendSMS?: boolean;
    sendEmail?: boolean;
    sendPush?: boolean;
  }) {
    return await prisma.automatedReminder.create({
      data: {
        cabinetId: data.cabinetId,
        appointmentId: data.appointmentId,
        patientId: data.patientId,
        type: data.type,
        scheduledFor: data.scheduledFor,
        message: data.message,
        subject: data.subject,
        sendSMS: data.sendSMS ?? true,
        sendEmail: data.sendEmail ?? true,
        sendPush: data.sendPush ?? false,
        status: 'PENDING',
      },
    });
  }

  /**
   * Create appointment reminders (24h and 1h before)
   */
  async createAppointmentReminders(appointmentId: string) {
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

    const reminders = [];

    // 24h reminder
    const reminder24h = new Date(appointment.startTime);
    reminder24h.setHours(reminder24h.getHours() - 24);

    if (reminder24h > new Date()) {
      const message24h = `Rappel: Vous avez un rendez-vous demain à ${appointment.startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} avec Dr. ${appointment.practitioner.firstName} ${appointment.practitioner.lastName}. ${appointment.cabinet.name}`;

      reminders.push(
        await this.create({
          cabinetId: appointment.cabinetId,
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          type: 'APPOINTMENT_REMINDER_24H',
          scheduledFor: reminder24h,
          subject: 'Rappel rendez-vous demain',
          message: message24h,
        })
      );
    }

    // 1h reminder
    const reminder1h = new Date(appointment.startTime);
    reminder1h.setHours(reminder1h.getHours() - 1);

    if (reminder1h > new Date()) {
      const message1h = `Rappel: Votre rendez-vous est dans 1 heure à ${appointment.startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} avec Dr. ${appointment.practitioner.firstName} ${appointment.practitioner.lastName}.`;

      reminders.push(
        await this.create({
          cabinetId: appointment.cabinetId,
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          type: 'APPOINTMENT_REMINDER_1H',
          scheduledFor: reminder1h,
          subject: 'Rendez-vous dans 1 heure',
          message: message1h,
        })
      );
    }

    return reminders;
  }

  /**
   * Process pending reminders (should be called by cron job)
   */
  async processPendingReminders() {
    const now = new Date();

    const pendingReminders = await prisma.automatedReminder.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        patient: true,
      },
    });

    const results = [];

    for (const reminder of pendingReminders) {
      try {
        // Send via configured channels
        if (reminder.sendSMS && reminder.patient.phone) {
          await NotificationService.sendNotification({
            type: 'SMS',
            recipientPhone: reminder.patient.phone,
            message: reminder.message,
          });
        }

        if (reminder.sendEmail && reminder.patient.email) {
          await NotificationService.sendNotification({
            type: 'EMAIL',
            recipientEmail: reminder.patient.email,
            subject: reminder.subject || 'Rappel',
            message: reminder.message,
          });
        }

        // Update reminder status
        await prisma.automatedReminder.update({
          where: { id: reminder.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            deliveredAt: new Date(),
          },
        });

        results.push({ id: reminder.id, success: true });
      } catch (error: any) {
        // Log error and update reminder
        await prisma.automatedReminder.update({
          where: { id: reminder.id },
          data: {
            status: 'FAILED',
            attempts: reminder.attempts + 1,
            lastAttemptAt: new Date(),
            errorMessage: error.message,
          },
        });

        results.push({ id: reminder.id, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Cancel appointment reminders
   */
  async cancelAppointmentReminders(appointmentId: string) {
    await prisma.automatedReminder.deleteMany({
      where: {
        appointmentId,
        status: 'PENDING',
      },
    });
  }

  /**
   * Get patient reminders
   */
  async getPatientReminders(patientId: string) {
    return await prisma.automatedReminder.findMany({
      where: { patientId },
      orderBy: {
        scheduledFor: 'desc',
      },
    });
  }

  /**
   * Get reminder statistics
   */
  async getStatistics(cabinetId: string, startDate: Date, endDate: Date) {
    const reminders = await prisma.automatedReminder.findMany({
      where: {
        cabinetId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const total = reminders.length;
    const sent = reminders.filter((r) => r.status === 'SENT').length;
    const failed = reminders.filter((r) => r.status === 'FAILED').length;
    const pending = reminders.filter((r) => r.status === 'PENDING').length;

    const deliveryRate = total > 0 ? ((sent / total) * 100).toFixed(2) : '0';

    return {
      total,
      sent,
      failed,
      pending,
      deliveryRate: parseFloat(deliveryRate),
    };
  }
}

export default new AutomatedReminderService();
