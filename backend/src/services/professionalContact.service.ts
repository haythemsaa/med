import { PrismaClient, ContactType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Professional Contact Service
 * Professional address book (Doctolib-like)
 * - Shared contacts within establishment
 * - RPPS/ADELI/FINESS numbers
 * - Tags and categories
 */
export class ProfessionalContactService {
  /**
   * Create contact
   */
  async create(data: {
    cabinetId: string;
    contactType: ContactType;
    title?: string;
    firstName: string;
    lastName: string;
    specialty?: string;
    organization?: string;
    department?: string;
    position?: string;
    email?: string;
    phone?: string;
    fax?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    rppsNumber?: string;
    adeliNumber?: string;
    finessNumber?: string;
    isShared?: boolean;
    sharedWith?: string[];
    notes?: string;
    tags?: string[];
    createdBy: string;
  }) {
    return await prisma.professionalContact.create({
      data,
    });
  }

  /**
   * Get cabinet contacts
   */
  async getCabinetContacts(
    cabinetId: string,
    userId?: string,
    filters?: {
      contactType?: ContactType;
      specialty?: string;
      tags?: string[];
      search?: string;
    }
  ) {
    const where: any = {
      cabinetId,
      OR: [{ isShared: true }, ...(userId ? [{ createdBy: userId }] : [])],
    };

    if (filters?.contactType) {
      where.contactType = filters.contactType;
    }

    if (filters?.specialty) {
      where.specialty = {
        contains: filters.specialty,
        mode: 'insensitive',
      };
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { organization: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.professionalContact.findMany({
      where,
      orderBy: {
        lastName: 'asc',
      },
    });
  }

  /**
   * Get by type
   */
  async getByType(cabinetId: string, contactType: ContactType) {
    return await prisma.professionalContact.findMany({
      where: {
        cabinetId,
        contactType,
      },
      orderBy: {
        lastName: 'asc',
      },
    });
  }

  /**
   * Update contact
   */
  async update(id: string, data: any) {
    return await prisma.professionalContact.update({
      where: { id },
      data,
    });
  }

  /**
   * Share contact
   */
  async share(id: string, userIds: string[]) {
    return await prisma.professionalContact.update({
      where: { id },
      data: {
        isShared: true,
        sharedWith: userIds,
      },
    });
  }

  /**
   * Delete contact
   */
  async delete(id: string) {
    return await prisma.professionalContact.delete({
      where: { id },
    });
  }

  /**
   * Get contact statistics
   */
  async getStatistics(cabinetId: string) {
    const contacts = await prisma.professionalContact.findMany({
      where: { cabinetId },
    });

    const byType: any = {};
    contacts.forEach((contact) => {
      if (!byType[contact.contactType]) byType[contact.contactType] = 0;
      byType[contact.contactType]++;
    });

    return {
      total: contacts.length,
      shared: contacts.filter((c) => c.isShared).length,
      byType,
      withRPPS: contacts.filter((c) => c.rppsNumber).length,
    };
  }
}

export default new ProfessionalContactService();
