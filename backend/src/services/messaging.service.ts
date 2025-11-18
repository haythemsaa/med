import { PrismaClient, MessageStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Messaging Service
 * Secure messaging between practitioners and patients
 */
export class MessagingService {
  /**
   * Send message
   */
  async send(data: {
    cabinetId: string;
    senderId: string;
    recipientId: string;
    subject?: string;
    content: string;
    attachments?: any[];
    threadId?: string;
    replyToId?: string;
    isUrgent?: boolean;
  }) {
    return await prisma.message.create({
      data: {
        cabinetId: data.cabinetId,
        senderId: data.senderId,
        recipientId: data.recipientId,
        subject: data.subject,
        content: data.content,
        attachments: data.attachments,
        threadId: data.threadId,
        replyToId: data.replyToId,
        isUrgent: data.isUrgent || false,
        status: 'SENT',
      },
    });
  }

  /**
   * Get user messages (inbox)
   */
  async getInbox(userId: string, cabinetId: string) {
    return await prisma.message.findMany({
      where: {
        cabinetId,
        recipientId: userId,
        isArchived: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get sent messages
   */
  async getSent(userId: string, cabinetId: string) {
    return await prisma.message.findMany({
      where: {
        cabinetId,
        senderId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get conversation thread
   */
  async getThread(threadId: string) {
    return await prisma.message.findMany({
      where: { threadId },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Mark as read
   */
  async markAsRead(messageId: string) {
    return await prisma.message.update({
      where: { id: messageId },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });
  }

  /**
   * Archive message
   */
  async archive(messageId: string) {
    return await prisma.message.update({
      where: { id: messageId },
      data: {
        isArchived: true,
      },
    });
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string, cabinetId: string) {
    return await prisma.message.count({
      where: {
        cabinetId,
        recipientId: userId,
        status: { in: ['SENT', 'DELIVERED'] },
      },
    });
  }

  /**
   * Get urgent messages
   */
  async getUrgentMessages(userId: string, cabinetId: string) {
    return await prisma.message.findMany({
      where: {
        cabinetId,
        recipientId: userId,
        isUrgent: true,
        status: { in: ['SENT', 'DELIVERED'] },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Delete message
   */
  async delete(messageId: string) {
    return await prisma.message.delete({
      where: { id: messageId },
    });
  }

  /**
   * Search messages
   */
  async search(userId: string, cabinetId: string, query: string) {
    return await prisma.message.findMany({
      where: {
        cabinetId,
        OR: [
          { senderId: userId },
          { recipientId: userId },
        ],
        OR: [
          {
            subject: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            content: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

export default new MessagingService();
