import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

export interface AuditLogOptions {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  before?: Prisma.InputJsonValue | null;
  after?: Prisma.InputJsonValue | null;
  ip?: string;
}

export async function createAuditLog(options: AuditLogOptions) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorId: options.actorId,
        action: options.action,
        entity: options.entity,
        entityId: options.entityId,
        before: options.before !== undefined ? (options.before as Prisma.InputJsonValue) : Prisma.JsonNull,
        after: options.after !== undefined ? (options.after as Prisma.InputJsonValue) : Prisma.JsonNull,
        ip: options.ip,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    return null;
  }
}
