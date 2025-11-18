import { PrismaClient, CampaignType, CampaignStatus, DeliveryStatus } from '@prisma/client';
import { NotificationService } from './notification.service';

const prisma = new PrismaClient();

/**
 * Prevention Campaign Service
 * Targeted prevention campaigns (Doctolib-like)
 * - Target by age, gender, condition
 * - Multi-channel delivery
 * - Track open rates and delivery
 */
export class PreventionCampaignService {
  /**
   * Create campaign
   */
  async create(data: {
    cabinetId: string;
    name: string;
    description: string;
    campaignType: CampaignType;
    targetCondition?: string;
    targetAgeMin?: number;
    targetAgeMax?: number;
    targetGender?: string;
    messageSubject: string;
    messageBody: string;
    startDate: Date;
    endDate?: Date;
    deliveryMethod: string[];
    createdBy: string;
  }) {
    return await prisma.preventionCampaign.create({
      data: {
        ...data,
        status: 'DRAFT',
      },
    });
  }

  /**
   * Get target patients
   */
  async getTargetPatients(campaignId: string) {
    const campaign = await prisma.preventionCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) throw new Error('Campaign not found');

    const where: any = {
      cabinetId: campaign.cabinetId,
      isActive: true,
    };

    if (campaign.targetAgeMin || campaign.targetAgeMax) {
      const now = new Date();
      if (campaign.targetAgeMax) {
        const minDOB = new Date(now.getFullYear() - campaign.targetAgeMax, now.getMonth(), now.getDate());
        where.dateOfBirth = { ...where.dateOfBirth, gte: minDOB };
      }
      if (campaign.targetAgeMin) {
        const maxDOB = new Date(now.getFullYear() - campaign.targetAgeMin, now.getMonth(), now.getDate());
        where.dateOfBirth = { ...where.dateOfBirth, lte: maxDOB };
      }
    }

    if (campaign.targetGender && campaign.targetGender !== 'ALL') {
      where.gender = campaign.targetGender;
    }

    return await prisma.patient.findMany({ where });
  }

  /**
   * Schedule campaign
   */
  async schedule(campaignId: string) {
    const campaign = await prisma.preventionCampaign.update({
      where: { id: campaignId },
      data: { status: 'SCHEDULED' },
    });

    // Get target patients and create recipients
    const patients = await this.getTargetPatients(campaignId);

    const recipients = patients.map((patient) => ({
      campaignId,
      patientId: patient.id,
    }));

    await prisma.campaignRecipient.createMany({
      data: recipients,
      skipDuplicates: true,
    });

    await prisma.preventionCampaign.update({
      where: { id: campaignId },
      data: {
        sentCount: recipients.length,
      },
    });

    return campaign;
  }

  /**
   * Send campaign
   */
  async send(campaignId: string) {
    const campaign = await prisma.preventionCampaign.findUnique({
      where: { id: campaignId },
      include: {
        recipients: {
          where: { status: 'PENDING' },
          include: { patient: true },
        },
      },
    });

    if (!campaign) throw new Error('Campaign not found');

    // Update status to SENDING
    await prisma.preventionCampaign.update({
      where: { id: campaignId },
      data: { status: 'SENDING' },
    });

    let deliveredCount = 0;

    for (const recipient of campaign.recipients) {
      try {
        // Send via configured methods
        if (campaign.deliveryMethod.includes('SMS') && recipient.patient.phone) {
          await NotificationService.sendNotification({
            type: 'SMS',
            recipientPhone: recipient.patient.phone,
            message: campaign.messageBody,
          });
        }

        if (campaign.deliveryMethod.includes('EMAIL') && recipient.patient.email) {
          await NotificationService.sendNotification({
            type: 'EMAIL',
            recipientEmail: recipient.patient.email,
            subject: campaign.messageSubject,
            message: campaign.messageBody,
          });
        }

        // Update recipient status
        await prisma.campaignRecipient.update({
          where: { id: recipient.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            deliveredAt: new Date(),
          },
        });

        deliveredCount++;
      } catch (error) {
        // Mark as failed
        await prisma.campaignRecipient.update({
          where: { id: recipient.id },
          data: {
            status: 'FAILED',
            errorMessage: (error as Error).message,
          },
        });
      }
    }

    // Update campaign
    return await prisma.preventionCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'SENT',
        deliveredCount,
      },
    });
  }

  /**
   * Get campaign statistics
   */
  async getStatistics(campaignId: string) {
    const campaign = await prisma.preventionCampaign.findUnique({
      where: { id: campaignId },
      include: {
        recipients: true,
      },
    });

    if (!campaign) throw new Error('Campaign not found');

    const stats = {
      total: campaign.recipients.length,
      sent: campaign.recipients.filter((r) => r.status === 'SENT').length,
      delivered: campaign.recipients.filter((r) => r.status === 'DELIVERED').length,
      opened: campaign.recipients.filter((r) => r.status === 'OPENED').length,
      failed: campaign.recipients.filter((r) => r.status === 'FAILED').length,
      pending: campaign.recipients.filter((r) => r.status === 'PENDING').length,
    };

    const openRate = stats.delivered > 0 ? ((stats.opened / stats.delivered) * 100).toFixed(2) : '0';
    const deliveryRate = stats.total > 0 ? ((stats.delivered / stats.total) * 100).toFixed(2) : '0';

    return {
      ...stats,
      openRate: parseFloat(openRate),
      deliveryRate: parseFloat(deliveryRate),
    };
  }

  /**
   * Get cabinet campaigns
   */
  async getCabinetCampaigns(cabinetId: string) {
    return await prisma.preventionCampaign.findMany({
      where: { cabinetId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete campaign
   */
  async delete(campaignId: string) {
    return await prisma.preventionCampaign.delete({
      where: { id: campaignId },
    });
  }
}

export default new PreventionCampaignService();
