import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';
import { RoleType } from '@mk-drycleaners/shared';

export interface AuthenticatedUser {
  id: string;
  role: RoleType;
  mobile: string;
  email: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. No token provided.',
    });
  }

  try {
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, mobile: true, email: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User not found or account deactivated.',
      });
    }

    req.user = {
      id: user.id,
      role: user.role as RoleType,
      mobile: user.mobile,
      email: user.email,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired access token.',
    });
  }
}

export const requireAuth = authenticate;
