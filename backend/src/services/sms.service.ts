import env from '../config/env';
import logger from '../utils/logger';

export interface SendSMSDTO {
  to: string;
  message: string;
}

export class SMSService {
  private client: any;

  constructor() {
    if (env.SMS_PROVIDER === 'twilio' && env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
      try {
        const twilio = require('twilio');
        this.client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
        logger.info('Twilio SMS client initialized');
      } catch (error) {
        logger.warn('Twilio client initialization failed:', error);
      }
    } else {
      logger.warn('SMS service not configured');
    }
  }

  async send(data: SendSMSDTO) {
    if (!this.client) {
      logger.warn('SMS service not available, skipping SMS');
      return { success: false, message: 'SMS service not configured' };
    }

    try {
      const message = await this.client.messages.create({
        body: data.message,
        from: env.TWILIO_PHONE_NUMBER,
        to: data.to,
      });

      logger.info(`SMS sent: ${message.sid}`);
      return { success: true, sid: message.sid };
    } catch (error) {
      logger.error('SMS send error:', error);
      throw error;
    }
  }

  async sendAppointmentConfirmation(phone: string, details: {
    practitionerName: string;
    date: string;
    time: string;
    cabinetName: string;
  }) {
    const message = `Confirmation RDV: Dr. ${details.practitionerName} le ${details.date} à ${details.time} - ${details.cabinetName}`;

    return await this.send({
      to: phone,
      message,
    });
  }

  async sendAppointmentReminder(phone: string, details: {
    practitionerName: string;
    date: string;
    time: string;
  }) {
    const message = `Rappel: RDV demain avec Dr. ${details.practitionerName} à ${details.time}. Merci de confirmer.`;

    return await this.send({
      to: phone,
      message,
    });
  }

  async sendVerificationCode(phone: string, code: string) {
    const message = `Votre code de vérification MediCare: ${code}`;

    return await this.send({
      to: phone,
      message,
    });
  }
}

export default new SMSService();
