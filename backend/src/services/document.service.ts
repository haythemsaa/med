import { DocumentType } from '@prisma/client';
import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { encrypt, decrypt } from '../utils/encryption';
import logger from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';
import env from '../config/env';

export interface CreateDocumentDTO {
  cabinetId: string;
  patientId: string;
  consultationId?: string;
  type: DocumentType;
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  tags?: string[];
}

export class DocumentService {
  private uploadDir = env.UPLOAD_DIR;

  async create(data: CreateDocumentDTO) {
    // Encrypt sensitive data if needed
    const encryptedPath = data.isEncrypted !== false ? encrypt(data.filePath) : data.filePath;

    const document = await prisma.document.create({
      data: {
        ...data,
        filePath: encryptedPath,
        isEncrypted: data.isEncrypted !== false,
        tags: data.tags ? JSON.stringify(data.tags) : null,
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        consultation: {
          select: {
            createdAt: true,
          },
        },
      },
    });

    // Update cabinet storage usage
    await prisma.cabinet.update({
      where: { id: data.cabinetId },
      data: {
        storageUsed: { increment: BigInt(data.fileSize) },
      },
    });

    logger.info(`Document created: ${document.id}`);
    return document;
  }

  async findById(id: string) {
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        consultation: true,
      },
    });

    if (!document) {
      throw new NotFoundError('Document not found');
    }

    return document;
  }

  async findAll(filters: {
    cabinetId: string;
    patientId?: string;
    consultationId?: string;
    type?: DocumentType;
    page?: number;
    limit?: number;
  }) {
    const { cabinetId, page = 1, limit = 20, ...where } = filters;
    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where: {
          cabinetId,
          ...where,
        },
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.document.count({
        where: {
          cabinetId,
          ...where,
        },
      }),
    ]);

    return {
      data: documents,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getFilePath(id: string): Promise<string> {
    const document = await this.findById(id);

    if (document.isEncrypted) {
      return decrypt(document.filePath);
    }

    return document.filePath;
  }

  async downloadDocument(id: string) {
    const document = await this.findById(id);
    const filePath = await this.getFilePath(id);
    const fullPath = path.join(this.uploadDir, filePath);

    try {
      const fileBuffer = await fs.readFile(fullPath);
      return {
        buffer: fileBuffer,
        fileName: document.fileName,
        mimeType: document.mimeType,
      };
    } catch (error) {
      logger.error('Error reading document file:', error);
      throw new Error('Failed to read document file');
    }
  }

  async delete(id: string) {
    const document = await this.findById(id);
    const filePath = await this.getFilePath(id);
    const fullPath = path.join(this.uploadDir, filePath);

    // Delete file from disk
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      logger.error('Error deleting document file:', error);
    }

    // Delete from database
    await prisma.document.delete({
      where: { id },
    });

    // Update cabinet storage usage
    await prisma.cabinet.update({
      where: { id: document.cabinetId },
      data: {
        storageUsed: { decrement: document.fileSize },
      },
    });

    logger.info(`Document deleted: ${id}`);
  }

  async getPatientDocuments(patientId: string) {
    return await prisma.document.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default new DocumentService();
