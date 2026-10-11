import crypto from 'crypto';
import { prisma } from '../../utils/prisma';
import { hashPassword, comparePassword } from '../../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import {
  RegisterInput,
  LoginInput,
  DevLoginInput,
  RoleType,
} from '@mk-drycleaners/shared';
import { env } from '../../config/env';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { mobile: input.mobile },
    });

    if (existing) {
      const error: any = new Error('Mobile number is already registered');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        mobile: input.mobile,
        email: input.email || null,
        passwordHash: hashedPassword,
        role: input.role as any,
        customerProfile: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName,
          },
        },
      },
      include: {
        customerProfile: true,
      },
    });

    const accessToken = signAccessToken({
      userId: user.id,
      role: user.role as RoleType,
    });

    const rawRefreshToken = signRefreshToken({
      userId: user.id,
      role: user.role as RoleType,
    });

    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        firstName: user.customerProfile?.firstName,
        lastName: user.customerProfile?.lastName,
      },
      tokens: {
        accessToken,
        refreshToken: rawRefreshToken,
      },
    };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { mobile: input.mobile },
      include: {
        customerProfile: true,
        partnerProfile: true,
      },
    });

    if (!user || !user.isActive) {
      const error: any = new Error('Invalid mobile or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await comparePassword(input.password, user.passwordHash);
    if (!isMatch) {
      const error: any = new Error('Invalid mobile or password');
      error.statusCode = 401;
      throw error;
    }

    const accessToken = signAccessToken({
      userId: user.id,
      role: user.role as RoleType,
    });

    const rawRefreshToken = signRefreshToken({
      userId: user.id,
      role: user.role as RoleType,
    });

    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const firstName = user.customerProfile?.firstName || user.partnerProfile?.firstName || 'User';
    const lastName = user.customerProfile?.lastName || user.partnerProfile?.lastName || '';

    return {
      user: {
        id: user.id,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        firstName,
        lastName,
      },
      tokens: {
        accessToken,
        refreshToken: rawRefreshToken,
      },
    };
  }

  async devLogin(input: DevLoginInput) {
    if (env.NODE_ENV !== 'development') {
      const error: any = new Error('Development login is disabled in this environment');
      error.statusCode = 403;
      throw error;
    }

    if (input.devKey !== env.DEV_LOGIN_KEY) {
      const error: any = new Error('Invalid development key');
      error.statusCode = 401;
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { mobile: input.mobile },
      include: {
        customerProfile: true,
        partnerProfile: true,
      },
    });

    if (!user) {
      const error: any = new Error('User not found for this mobile number');
      error.statusCode = 404;
      throw error;
    }

    const accessToken = signAccessToken({
      userId: user.id,
      role: user.role as RoleType,
    });

    const rawRefreshToken = signRefreshToken({
      userId: user.id,
      role: user.role as RoleType,
    });

    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const firstName = user.customerProfile?.firstName || user.partnerProfile?.firstName || 'User';
    const lastName = user.customerProfile?.lastName || user.partnerProfile?.lastName || '';

    return {
      user: {
        id: user.id,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        firstName,
        lastName,
      },
      tokens: {
        accessToken,
        refreshToken: rawRefreshToken,
      },
    };
  }

  async refresh(rawRefreshToken: string) {
    if (!rawRefreshToken) {
      const error: any = new Error('Refresh token is required');
      error.statusCode = 401;
      throw error;
    }

    let payload: any;
    try {
      payload = verifyRefreshToken(rawRefreshToken);
    } catch (e) {
      const error: any = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      throw error;
    }

    const oldTokenHash = hashToken(rawRefreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash: oldTokenHash },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      }
      const error: any = new Error('Refresh token has expired or is invalid');
      error.statusCode = 401;
      throw error;
    }

    // Delete old refresh token (rotate)
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        customerProfile: true,
        partnerProfile: true,
      },
    });

    if (!user || !user.isActive) {
      const error: any = new Error('User not found or inactive');
      error.statusCode = 401;
      throw error;
    }

    const newAccessToken = signAccessToken({
      userId: user.id,
      role: user.role as RoleType,
    });

    const newRawRefreshToken = signRefreshToken({
      userId: user.id,
      role: user.role as RoleType,
    });

    const newTokenHash = hashToken(newRawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newTokenHash,
        expiresAt,
      },
    });

    const firstName = user.customerProfile?.firstName || user.partnerProfile?.firstName || 'User';
    const lastName = user.customerProfile?.lastName || user.partnerProfile?.lastName || '';

    return {
      user: {
        id: user.id,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        firstName,
        lastName,
      },
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRawRefreshToken,
      },
    };
  }

  async logout(rawRefreshToken: string) {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await prisma.refreshToken.deleteMany({
        where: { tokenHash },
      });
    }
    return { success: true };
  }
}

export const authService = new AuthService();
