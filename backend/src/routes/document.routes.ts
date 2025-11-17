import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadSingle } from '../middleware/upload.middleware';
import documentService from '../services/document.service';
import { sendSuccess } from '../utils/response';
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { paginationSchema } from '../utils/validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload document
router.post(
  '/upload',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  uploadSingle('document'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const { cabinetId, patientId, consultationId, type, title, description, tags } = req.body;

      const document = await documentService.create({
        cabinetId,
        patientId,
        consultationId,
        type,
        title,
        description,
        fileName: req.file.originalname,
        filePath: req.file.filename,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: req.user!.userId,
        tags: tags ? JSON.parse(tags) : undefined,
      });

      sendSuccess(res, document, 'Document uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  }
);

// Get documents
router.get(
  '/',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'SECRETARY', 'PATIENT'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cabinetId, patientId, consultationId, type } = req.query;
      const { page, limit } = paginationSchema.parse(req.query);

      const result = await documentService.findAll({
        cabinetId: cabinetId as string,
        patientId: patientId as string,
        consultationId: consultationId as string,
        type: type as any,
        page,
        limit,
      });

      res.json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get document by ID
router.get(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'PATIENT'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const document = await documentService.findById(id);
      sendSuccess(res, document);
    } catch (error) {
      next(error);
    }
  }
);

// Download document
router.get(
  '/:id/download',
  authorize('ADMIN_CABINET', 'PRACTITIONER', 'PATIENT'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { buffer, fileName, mimeType } = await documentService.downloadDocument(id);

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
);

// Delete document
router.delete(
  '/:id',
  authorize('ADMIN_CABINET', 'PRACTITIONER'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await documentService.delete(id);
      sendSuccess(res, null, 'Document deleted successfully');
    } catch (error) {
      next(error);
    }
  }
);

export default router;
