import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { NotificationService } from './notification.service';

const prisma = new PrismaClient();

/**
 * Patient Messaging Without Account Service
 * Doctolib-like feature: Send messages to patients WITHOUT Doctolib account
 * - Message accessible for 14 days via SMS/Email link
 * - No registration required
 * - Secure access with token
 */
export class PatientMessagingNoAccountService {
  /**
   * Generate secure access token
   */
  private generateAccessToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate access link
   */
  private generateAccessLink(token: string, baseUrl: string): string {
    return `${baseUrl}/message/${token}`;
  }

  /**
   * Send message to patient without account
   */
  async sendToPatientNoAccount(data: {
    cabinetId: string;
    senderId: string; // Practitioner/Cabinet user
    patientPhone?: string;
    patientEmail?: string;
    subject: string;
    content: string;
    expiresInDays?: number;
  }) {
    const expiresInDays = data.expiresInDays || 14;
    const accessToken = this.generateAccessToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Store message in database with token
    const message = await prisma.message.create({
      data: {
        cabinetId: data.cabinetId,
        senderId: data.senderId,
        recipientId: data.senderId, // Placeholder (no patient account)
        subject: data.subject,
        content: data.content,
        status: 'SENT',
        sentAt: new Date(),
        // Store token and expiry in metadata or separate table
        // For now, we'll store in a JSON field
      },
    });

    // TODO: Store access token in separate table or in message metadata
    // For production, create a MessageAccessToken model

    const baseUrl = process.env.FRONTEND_URL || 'https://medicare.com';
    const accessLink = this.generateAccessLink(accessToken, baseUrl);

    // Send via SMS if phone provided
    if (data.patientPhone) {
      const smsMessage = `
Nouveau message de ${data.subject}

Pour lire votre message, cliquez ici:
${accessLink}

Ce lien expire dans ${expiresInDays} jours.
      `.trim();

      await NotificationService.sendNotification({
        type: 'SMS',
        recipientPhone: data.patientPhone,
        message: smsMessage,
      });
    }

    // Send via Email if email provided
    if (data.patientEmail) {
      const emailBody = `
<h2>${data.subject}</h2>

<p>${data.content}</p>

<p>
  <a href="${accessLink}" style="display: inline-block; padding: 12px 24px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px;">
    Lire le message complet
  </a>
</p>

<p style="color: #666; font-size: 12px;">
  Ce lien expire le ${expiresAt.toLocaleDateString('fr-FR')} (${expiresInDays} jours).
  Aucune inscription n'est nécessaire.
</p>
      `.trim();

      await NotificationService.sendNotification({
        type: 'EMAIL',
        recipientEmail: data.patientEmail,
        subject: data.subject,
        message: emailBody,
      });
    }

    return {
      messageId: message.id,
      accessToken,
      accessLink,
      expiresAt,
    };
  }

  /**
   * Get message by access token
   */
  async getByAccessToken(token: string) {
    // TODO: Implement proper token validation
    // For now, this is a placeholder

    // In production:
    // 1. Find message by token in MessageAccessToken table
    // 2. Check if token is expired
    // 3. Check if message is still valid
    // 4. Return message content

    return {
      subject: 'Message from your doctor',
      content: 'Your test results are ready...',
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    };
  }

  /**
   * Mark message as read (via token)
   */
  async markAsRead(token: string) {
    // TODO: Implement
    // Update message status to READ
    // Record read timestamp
  }

  /**
   * Get statistics
   */
  async getStatistics(cabinetId: string, startDate: Date, endDate: Date) {
    // TODO: Track messages sent to patients without accounts
    // - Total sent
    // - Delivery rate
    // - Read rate
    // - Expired rate

    return {
      totalSent: 0,
      delivered: 0,
      read: 0,
      expired: 0,
    };
  }

  /**
   * Cleanup expired messages
   */
  async cleanupExpired() {
    // TODO: Delete messages and tokens older than 14 days
    // Run as cron job
  }
}

export default new PatientMessagingNoAccountService();
