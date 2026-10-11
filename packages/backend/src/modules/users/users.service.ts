import { prisma } from '../../utils/prisma';
import { hashPassword, comparePassword } from '../../utils/password';
import { UpdateProfileInput, ChangePasswordInput } from '@mk-drycleaners/shared';

export class UsersService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customerProfile: {
          include: {
            addresses: {
              where: { isActive: true },
            },
          },
        },
        partnerProfile: true,
      },
    });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return {
      id: user.id,
      mobile: user.mobile,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      customerProfile: user.customerProfile,
      partnerProfile: user.partnerProfile,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { customerProfile: true, partnerProfile: true },
    });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (input.email !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { email: input.email || null },
      });
    }

    if (user.customerProfile && (input.firstName || input.lastName)) {
      await prisma.customerProfile.update({
        where: { userId },
        data: {
          ...(input.firstName && { firstName: input.firstName }),
          ...(input.lastName && { lastName: input.lastName }),
        },
      });
    } else if (user.partnerProfile && (input.firstName || input.lastName)) {
      await prisma.partnerProfile.update({
        where: { userId },
        data: {
          ...(input.firstName && { firstName: input.firstName }),
          ...(input.lastName && { lastName: input.lastName }),
        },
      });
    }

    return this.getProfile(userId);
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await comparePassword(input.currentPassword, user.passwordHash);
    if (!isMatch) {
      const error: any = new Error('Current password does not match');
      error.statusCode = 400;
      throw error;
    }

    const newPasswordHash = await hashPassword(input.newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Invalidate existing refresh tokens upon password change
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return { success: true, message: 'Password updated successfully' };
  }
}

export const usersService = new UsersService();
