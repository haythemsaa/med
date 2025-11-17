import { UserRole } from '@prisma/client';
import prisma from '../config/database';
import { hashPassword, comparePassword, generateRandomToken } from '../utils/encryption';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { AppError, AuthenticationError, ConflictError, NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

export interface RegisterDTO {
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  cabinetId?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterDTO) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Check if phone is already used
    if (data.phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone: data.phone },
      });

      if (existingPhone) {
        throw new ConflictError('User with this phone number already exists');
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user in transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          phone: data.phone,
          password: hashedPassword,
          role: data.role,
        },
      });

      // Create role-specific record
      if (data.role === 'PRACTITIONER' && data.cabinetId) {
        await tx.practitioner.create({
          data: {
            userId: newUser.id,
            cabinetId: data.cabinetId,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            speciality: 'OTHER',
          },
        });
      } else if (data.role === 'SECRETARY' && data.cabinetId) {
        await tx.secretary.create({
          data: {
            userId: newUser.id,
            cabinetId: data.cabinetId,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
          },
        });
      } else if (data.role === 'PATIENT' && data.cabinetId) {
        await tx.patient.create({
          data: {
            userId: newUser.id,
            cabinetId: data.cabinetId,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            dateOfBirth: new Date(), // Should be provided
            gender: 'OTHER',
            phone: data.phone || '',
          },
        });
      }

      return newUser;
    });

    logger.info(`User registered: ${user.email} (${user.role})`);

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Save refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async login(data: LoginDTO) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        cabinet: { select: { id: true } },
        practitioner: { select: { cabinetId: true } },
        secretary: { select: { cabinetId: true } },
      },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AuthenticationError('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Determine cabinetId
    let cabinetId: string | undefined;
    if (user.cabinet) {
      cabinetId = user.cabinet.id;
    } else if (user.practitioner) {
      cabinetId = user.practitioner.cabinetId;
    } else if (user.secretary) {
      cabinetId = user.secretary.cabinetId;
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      cabinetId,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      cabinetId,
    });

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        lastLogin: new Date(),
      },
    });

    logger.info(`User logged in: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        cabinetId,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    logger.info(`User logged out: ${userId}`);
  }

  async refreshTokens(refreshToken: string) {
    const user = await prisma.user.findFirst({
      where: { refreshToken },
      include: {
        cabinet: { select: { id: true } },
        practitioner: { select: { cabinetId: true } },
        secretary: { select: { cabinetId: true } },
      },
    });

    if (!user || !user.isActive) {
      throw new AuthenticationError('Invalid refresh token');
    }

    // Determine cabinetId
    let cabinetId: string | undefined;
    if (user.cabinet) {
      cabinetId = user.cabinet.id;
    } else if (user.practitioner) {
      cabinetId = user.practitioner.cabinetId;
    } else if (user.secretary) {
      cabinetId = user.secretary.cabinetId;
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      cabinetId,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      cabinetId,
    });

    // Update refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a reset link will be sent' };
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // TODO: Send email with reset link
    logger.info(`Password reset requested for: ${email}`);

    return {
      message: 'If the email exists, a reset link will be sent',
      resetToken, // In production, only send via email
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        passwordChangedAt: new Date(),
      },
    });

    logger.info(`Password reset for user: ${user.email}`);

    return { message: 'Password reset successful' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    logger.info(`Password changed for user: ${user.email}`);

    return { message: 'Password changed successfully' };
  }
}

export default new AuthService();
