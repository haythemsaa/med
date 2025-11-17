import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/errors';
import prisma from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    cabinetId?: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const payload = verifyAccessToken(token);

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        cabinet: {
          select: { id: true },
        },
        practitioner: {
          select: { cabinetId: true },
        },
        secretary: {
          select: { cabinetId: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new AppError('User no longer exists or is inactive', 401);
    }

    // Determine cabinetId based on role
    let cabinetId: string | undefined;
    if (user.cabinet) {
      cabinetId = user.cabinet.id;
    } else if (user.practitioner) {
      cabinetId = user.practitioner.cabinetId;
    } else if (user.secretary) {
      cabinetId = user.secretary.cabinetId;
    }

    // Add user to request
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      cabinetId,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Insufficient permissions',
      });
    }

    next();
  };
};

// Middleware to check if user belongs to the cabinet
export const checkCabinetAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const cabinetId = req.params.cabinetId || req.body.cabinetId;

    if (!cabinetId) {
      throw new AppError('Cabinet ID is required', 400);
    }

    // Super admin can access all cabinets
    if (req.user?.role === 'SUPER_ADMIN') {
      return next();
    }

    // Check if user belongs to this cabinet
    if (req.user?.cabinetId !== cabinetId) {
      throw new AppError('Access denied to this cabinet', 403);
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};
