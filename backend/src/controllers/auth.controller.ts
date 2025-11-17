import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import authService from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { passwordSchema, emailSchema } from '../utils/validators';

// Validation schemas
const registerSchema = z.object({
  email: emailSchema,
  phone: z.string().optional(),
  password: passwordSchema,
  role: z.enum([
    'SUPER_ADMIN',
    'ADMIN_CABINET',
    'PRACTITIONER',
    'SECRETARY',
    'PARAMEDICAL',
    'RADIOLOGIST',
    'LABORATORY',
    'PATIENT',
  ]),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  cabinetId: z.string().uuid().optional(),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);
      sendSuccess(res, result, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }
      await authService.logout(req.user.userId);
      sendSuccess(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      const result = await authService.refreshTokens(refreshToken);
      sendSuccess(res, result, 'Tokens refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(email);
      sendSuccess(res, result, 'Password reset email sent');
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(token, password);
      sendSuccess(res, result, 'Password reset successful');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      const result = await authService.changePassword(
        req.user.userId,
        currentPassword,
        newPassword
      );
      sendSuccess(res, result, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }
      sendSuccess(res, req.user, 'User details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
