import multer from 'multer';
import path from 'path';
import fs from 'fs';
import env from '../config/env';
import { AppError } from '../utils/errors';

// Ensure upload directory exists
const uploadDir = env.UPLOAD_DIR;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = env.ALLOWED_FILE_TYPES.split(',');

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type ${file.mimetype} not allowed`, 400));
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE,
  },
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Middleware for multiple files upload
export const uploadMultiple = (fieldName: string, maxCount: number = 10) =>
  upload.array(fieldName, maxCount);

// Middleware for multiple fields
export const uploadFields = (fields: { name: string; maxCount: number }[]) =>
  upload.fields(fields);
