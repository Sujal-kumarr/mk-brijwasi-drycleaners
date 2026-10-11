import { Request, Response, NextFunction } from 'express';
import { RoleType } from '@mk-drycleaners/shared';

export function requireRole(...roles: RoleType[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access forbidden: Required role [${roles.join(', ')}].`,
      });
    }

    return next();
  };
}
