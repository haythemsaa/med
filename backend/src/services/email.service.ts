import nodemailer from 'nodemailer';
import env from '../config/env';
import logger from '../utils/logger';

export interface SendEmailDTO {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
  }>;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  async send(data: SendEmailDTO) {
    try {
      const info = await this.transporter.sendMail({
        from: data.from || env.EMAIL_FROM,
        to: Array.isArray(data.to) ? data.to.join(', ') : data.to,
        subject: data.subject,
        text: data.text,
        html: data.html,
        cc: data.cc,
        bcc: data.bcc,
        attachments: data.attachments,
      });

      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Email send error:', error);
      throw error;
    }
  }

  async sendWelcome(email: string, name: string) {
    return await this.send({
      to: email,
      subject: 'Bienvenue sur MediCare',
      html: `
        <h1>Bienvenue ${name}!</h1>
        <p>Merci de vous être inscrit sur MediCare.</p>
        <p>Vous pouvez maintenant gérer vos rendez-vous médicaux en toute simplicité.</p>
      `,
    });
  }

  async sendPasswordReset(email: string, resetToken: string) {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    return await this.send({
      to: email,
      subject: 'Réinitialisation de mot de passe',
      html: `
        <h1>Réinitialisation de mot de passe</h1>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe:</p>
        <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
        <p>Ce lien expire dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      `,
    });
  }

  async sendAppointmentConfirmation(
    email: string,
    appointmentDetails: {
      patientName: string;
      practitionerName: string;
      date: string;
      time: string;
      cabinetName: string;
      cabinetAddress: string;
    }
  ) {
    return await this.send({
      to: email,
      subject: 'Confirmation de rendez-vous',
      html: `
        <h1>Confirmation de rendez-vous</h1>
        <p>Bonjour ${appointmentDetails.patientName},</p>
        <p>Votre rendez-vous est confirmé:</p>
        <ul>
          <li><strong>Praticien:</strong> Dr. ${appointmentDetails.practitionerName}</li>
          <li><strong>Date:</strong> ${appointmentDetails.date}</li>
          <li><strong>Heure:</strong> ${appointmentDetails.time}</li>
          <li><strong>Cabinet:</strong> ${appointmentDetails.cabinetName}</li>
          <li><strong>Adresse:</strong> ${appointmentDetails.cabinetAddress}</li>
        </ul>
        <p>Merci de votre confiance.</p>
      `,
    });
  }

  async verify() {
    try {
      await this.transporter.verify();
      logger.info('SMTP connection verified');
      return true;
    } catch (error) {
      logger.error('SMTP verification failed:', error);
      return false;
    }
  }
}

export default new EmailService();
