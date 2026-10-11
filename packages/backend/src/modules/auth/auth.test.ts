import { describe, it, expect, vi } from 'vitest';
import { authService } from './auth.service';
import { prisma } from '../../utils/prisma';
import * as passwordUtils from '../../utils/password';

vi.mock('../../utils/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock('../../utils/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('mockHashedPassword'),
  comparePassword: vi.fn(),
}));

describe('AuthService Unit Tests', () => {
  it('registers a new customer successfully', async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockResolvedValue({
      id: 'mock-user-id',
      mobile: '9876543210',
      email: 'test@example.com',
      role: 'CUSTOMER',
      customerProfile: {
        firstName: 'Amit',
        lastName: 'Sharma',
      },
    });

    const result = await authService.register({
      firstName: 'Amit',
      lastName: 'Sharma',
      mobile: '9876543210',
      email: 'test@example.com',
      password: 'Password@123',
    });

    expect(result.user.mobile).toBe('9876543210');
    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();
  });

  it('rejects registration when mobile number is already taken', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({ id: 'existing-id' });

    await expect(
      authService.register({
        firstName: 'Amit',
        lastName: 'Sharma',
        mobile: '9876543210',
        password: 'Password@123',
      })
    ).rejects.toThrow('Mobile number is already registered');
  });

  it('rejects login with invalid password', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'user-id',
      mobile: '9876543210',
      passwordHash: 'hashed',
      isActive: true,
      role: 'CUSTOMER',
    });
    (passwordUtils.comparePassword as any).mockResolvedValue(false);

    await expect(
      authService.login({
        mobile: '9876543210',
        password: 'WrongPassword',
      })
    ).rejects.toThrow('Invalid mobile or password');
  });
});
