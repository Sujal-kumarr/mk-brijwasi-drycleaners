import { prisma } from '../../utils/prisma';
import { AddressInput, UpdateAddressInput } from '@mk-drycleaners/shared';

export class AddressesService {
  async getCustomerProfile(userId: string) {
    let profile = await prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      profile = await prisma.customerProfile.create({
        data: {
          userId,
          firstName: 'Customer',
          lastName: user?.mobile?.slice(-4) || 'User',
        },
      });
    }

    return profile;
  }

  async getAddresses(userId: string) {
    const profile = await this.getCustomerProfile(userId);
    return prisma.address.findMany({
      where: {
        customerId: profile.id,
        isActive: true,
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createAddress(userId: string, data: AddressInput) {
    const profile = await this.getCustomerProfile(userId);

    // If marked default or first address, manage defaults
    const existingCount = await prisma.address.count({
      where: { customerId: profile.id, isActive: true },
    });

    const isDefault = data.isDefault || existingCount === 0;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { customerId: profile.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.address.create({
      data: {
        customerId: profile.id,
        recipientName: data.recipientName,
        mobile: data.mobile,
        addressLine: data.addressLine,
        locality: data.locality,
        landmark: data.landmark,
        city: data.city || 'Vrindavan',
        state: data.state || 'Uttar Pradesh',
        pincode: data.pincode,
        lat: data.lat,
        lng: data.lng,
        isDefault,
      },
    });
  }

  async updateAddress(userId: string, addressId: string, data: UpdateAddressInput) {
    const profile = await this.getCustomerProfile(userId);

    const existing = await prisma.address.findFirst({
      where: { id: addressId, customerId: profile.id, isActive: true },
    });

    if (!existing) {
      throw Object.assign(new Error('Address not found or unauthorized'), { statusCode: 404 });
    }

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { customerId: profile.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const profile = await this.getCustomerProfile(userId);

    const existing = await prisma.address.findFirst({
      where: { id: addressId, customerId: profile.id, isActive: true },
    });

    if (!existing) {
      throw Object.assign(new Error('Address not found or unauthorized'), { statusCode: 404 });
    }

    const wasDefault = existing.isDefault;

    const deleted = await prisma.address.update({
      where: { id: addressId },
      data: { isActive: false, isDefault: false },
    });

    // If it was default, make the next active address default if one exists
    if (wasDefault) {
      const nextAddr = await prisma.address.findFirst({
        where: { customerId: profile.id, isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      if (nextAddr) {
        await prisma.address.update({
          where: { id: nextAddr.id },
          data: { isDefault: true },
        });
      }
    }

    return deleted;
  }

  async setDefaultAddress(userId: string, addressId: string) {
    const profile = await this.getCustomerProfile(userId);

    const existing = await prisma.address.findFirst({
      where: { id: addressId, customerId: profile.id, isActive: true },
    });

    if (!existing) {
      throw Object.assign(new Error('Address not found or unauthorized'), { statusCode: 404 });
    }

    await prisma.address.updateMany({
      where: { customerId: profile.id, isDefault: true },
      data: { isDefault: false },
    });

    return prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }

  async checkServiceability(pincode: string) {
    const area = await prisma.serviceArea.findFirst({
      where: { pincode, isActive: true },
    });

    return {
      serviceable: !!area,
      pincode,
      area: area || null,
    };
  }
}

export const addressesService = new AddressesService();
