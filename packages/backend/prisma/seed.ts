import { PrismaClient, Role, SlotType, PricingUnit } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting MK Brijwasi Drycleaners database seeding...');

  // 1. BusinessConfig (id=1)
  const businessConfig = await prisma.businessConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      businessName: 'MK Brijwasi Drycleaners',
      contactPhone: '9999999999',
      contactEmail: 'contact@mkbrijwasidrycleaners.com',
      address: 'Near Banke Bihari Temple Road, Vrindavan, Mathura, Uttar Pradesh 281121',
      openingHours: {
        monday: '08:00 - 20:00',
        tuesday: '08:00 - 20:00',
        wednesday: '08:00 - 20:00',
        thursday: '08:00 - 20:00',
        friday: '08:00 - 20:00',
        saturday: '08:00 - 20:00',
        sunday: '09:00 - 18:00',
      },
      minOrderAmountInPaise: 10000, // ₹100
      deliveryFeeInPaise: 3000,     // ₹30
      currency: 'INR',
      taxPercent: 0,
      cancellationPolicyHours: 2,
    },
  });
  console.log('Seeded BusinessConfig:', businessConfig.businessName);

  // 2. ServiceAreas: Vrindavan (281121), Mathura (281001), Govardhan (281502)
  const serviceAreas = [
    { name: 'Vrindavan', pincode: '281121' },
    { name: 'Mathura', pincode: '281001' },
    { name: 'Govardhan', pincode: '281502' },
  ];

  for (const area of serviceAreas) {
    await prisma.serviceArea.upsert({
      where: { pincode: area.pincode },
      update: { name: area.name, isActive: true },
      create: { ...area, isActive: true },
    });
  }
  console.log('Seeded ServiceAreas');

  // 3. TimeSlots
  const pickupSlots = [
    { label: '9am-12pm', startHour: 9, endHour: 12, slotType: SlotType.PICKUP },
    { label: '12pm-3pm', startHour: 12, endHour: 15, slotType: SlotType.PICKUP },
    { label: '3pm-6pm', startHour: 15, endHour: 18, slotType: SlotType.PICKUP },
  ];

  const deliverySlots = [
    { label: '9am-12pm', startHour: 9, endHour: 12, slotType: SlotType.DELIVERY },
    { label: '12pm-3pm', startHour: 12, endHour: 15, slotType: SlotType.DELIVERY },
    { label: '3pm-6pm', startHour: 15, endHour: 18, slotType: SlotType.DELIVERY },
    { label: '6pm-9pm', startHour: 18, endHour: 21, slotType: SlotType.DELIVERY },
  ];

  for (const slot of [...pickupSlots, ...deliverySlots]) {
    const existing = await prisma.timeSlot.findFirst({
      where: { label: slot.label, slotType: slot.slotType },
    });
    if (!existing) {
      await prisma.timeSlot.create({ data: slot });
    }
  }
  console.log('Seeded TimeSlots');

  // 4. LaundryServices
  const laundryServicesData = [
    { name: 'Wash & Fold', slug: 'wash-and-fold', description: 'Everyday washing and neat folding' },
    { name: 'Wash & Iron', slug: 'wash-and-iron', description: 'Washing followed by crisp steam ironing' },
    { name: 'Iron Only', slug: 'iron-only', description: 'Steam ironing for wrinkle-free finish' },
    { name: 'Dry Cleaning', slug: 'dry-cleaning', description: 'Gentle solvent cleaning for delicate and festive garments' },
    { name: 'Stain Treatment', slug: 'stain-treatment', description: 'Specialized deep stain removal' },
    { name: 'Bulky Cleaning', slug: 'bulky-cleaning', description: 'Curtains, blankets, quilts, and heavy fabrics' },
  ];

  const serviceMap = new Map<string, string>();
  for (const s of laundryServicesData) {
    const service = await prisma.laundryService.upsert({
      where: { slug: s.slug },
      update: { name: s.name, description: s.description },
      create: s,
    });
    serviceMap.set(s.slug, service.id);
  }
  console.log('Seeded LaundryServices');

  // 5. ClothingCategories: clothing, towels-and-linens, other
  const categoriesData = [
    { name: 'Clothing', slug: 'clothing', description: 'Shirts, trousers, ethnic wear, suits, sarees', sortOrder: 1 },
    { name: 'Towels & Linens', slug: 'towels-and-linens', description: 'Bedsheets, towels, pillow covers, blankets', sortOrder: 2 },
    { name: 'Other Items', slug: 'other', description: 'Bags, shoes, curtains, upholstery', sortOrder: 3 },
  ];

  const categoryMap = new Map<string, string>();
  for (const c of categoriesData) {
    const category = await prisma.clothingCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, sortOrder: c.sortOrder },
      create: c,
    });
    categoryMap.set(c.slug, category.id);
  }
  console.log('Seeded ClothingCategories');

  // 6. ClothingItems and Sample/Dev Prices
  const itemsData = [
    {
      categoryId: categoryMap.get('clothing')!,
      name: 'Shirt / T-Shirt',
      description: 'Men/women cotton or synthetic shirt',
      pricingUnit: PricingUnit.PER_PIECE,
      prices: [
        { serviceSlug: 'wash-and-fold', priceInPaise: 3000 }, // ₹30
        { serviceSlug: 'wash-and-iron', priceInPaise: 4500 }, // ₹45
        { serviceSlug: 'iron-only', priceInPaise: 1500 },     // ₹15
        { serviceSlug: 'dry-cleaning', priceInPaise: 7000 },  // ₹70
      ],
    },
    {
      categoryId: categoryMap.get('clothing')!,
      name: 'Trousers / Jeans',
      description: 'Cotton trousers, jeans, chinos',
      pricingUnit: PricingUnit.PER_PIECE,
      prices: [
        { serviceSlug: 'wash-and-fold', priceInPaise: 3500 },
        { serviceSlug: 'wash-and-iron', priceInPaise: 5000 },
        { serviceSlug: 'iron-only', priceInPaise: 2000 },
        { serviceSlug: 'dry-cleaning', priceInPaise: 8000 },
      ],
    },
    {
      categoryId: categoryMap.get('clothing')!,
      name: 'Kurta / Pyjama Set',
      description: 'Traditional cotton / silk kurta and pyjama',
      pricingUnit: PricingUnit.PER_PIECE,
      prices: [
        { serviceSlug: 'wash-and-iron', priceInPaise: 9000 },
        { serviceSlug: 'dry-cleaning', priceInPaise: 14000 },
      ],
    },
    {
      categoryId: categoryMap.get('clothing')!,
      name: 'Saree (Silk / Heavy)',
      description: 'Designer or silk saree with delicate embroidery',
      pricingUnit: PricingUnit.PER_PIECE,
      prices: [
        { serviceSlug: 'dry-cleaning', priceInPaise: 25000 },
        { serviceSlug: 'iron-only', priceInPaise: 6000 },
      ],
    },
    {
      categoryId: categoryMap.get('clothing')!,
      name: 'Suit (2-Piece / 3-Piece)',
      description: 'Formal blazer and trousers',
      pricingUnit: PricingUnit.PER_PIECE,
      prices: [
        { serviceSlug: 'dry-cleaning', priceInPaise: 30000 },
      ],
    },
    {
      categoryId: categoryMap.get('towels-and-linens')!,
      name: 'Bedsheet (Double)',
      description: 'King or queen size cotton bedsheet',
      pricingUnit: PricingUnit.PER_PIECE,
      prices: [
        { serviceSlug: 'wash-and-fold', priceInPaise: 6000 },
        { serviceSlug: 'wash-and-iron', priceInPaise: 9000 },
        { serviceSlug: 'dry-cleaning', priceInPaise: 12000 },
      ],
    },
    {
      categoryId: categoryMap.get('towels-and-linens')!,
      name: 'Blanket / Quilt (Heavy)',
      description: 'Winter heavy comforter or double blanket',
      pricingUnit: PricingUnit.PER_PIECE,
      prices: [
        { serviceSlug: 'bulky-cleaning', priceInPaise: 35000 },
        { serviceSlug: 'dry-cleaning', priceInPaise: 40000 },
      ],
    },
  ];

  for (const item of itemsData) {
    let clothingItem = await prisma.clothingItem.findFirst({
      where: { name: item.name, categoryId: item.categoryId },
    });

    if (!clothingItem) {
      clothingItem = await prisma.clothingItem.create({
        data: {
          categoryId: item.categoryId,
          name: item.name,
          description: item.description,
          pricingUnit: item.pricingUnit,
        },
      });
    }

    for (const p of item.prices) {
      const sId = serviceMap.get(p.serviceSlug);
      if (sId) {
        await prisma.servicePrice.upsert({
          where: {
            clothingItemId_laundryServiceId: {
              clothingItemId: clothingItem.id,
              laundryServiceId: sId,
            },
          },
          update: { priceInPaise: p.priceInPaise, estimatedDays: 2 },
          create: {
            clothingItemId: clothingItem.id,
            laundryServiceId: sId,
            priceInPaise: p.priceInPaise,
            estimatedDays: 2,
          },
        });
      }
    }
  }
  console.log('Seeded ClothingItems & Prices');

  // Helper password hashes (Admin@1234, Customer@1234, Partner@1234)
  const adminPasswordHash = await bcrypt.hash('Admin@1234', 12);
  const customerPasswordHash = await bcrypt.hash('Customer@1234', 12);
  const partnerPasswordHash = await bcrypt.hash('Partner@1234', 12);

  // 7. Super Admin: mobile='9000000001', role=SUPER_ADMIN
  await prisma.user.upsert({
    where: { mobile: '9000000001' },
    update: {
      passwordHash: adminPasswordHash,
      role: Role.SUPER_ADMIN,
      email: 'superadmin@mkdrycleaners.com',
      isActive: true,
    },
    create: {
      mobile: '9000000001',
      passwordHash: adminPasswordHash,
      role: Role.SUPER_ADMIN,
      email: 'superadmin@mkdrycleaners.com',
      isActive: true,
    },
  });

  // 8. Second admin: mobile='9000000002', role=ADMIN
  await prisma.user.upsert({
    where: { mobile: '9000000002' },
    update: {
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      email: 'admin@mkdrycleaners.com',
      isActive: true,
    },
    create: {
      mobile: '9000000002',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      email: 'admin@mkdrycleaners.com',
      isActive: true,
    },
  });

  // 9. Sample customer: mobile='9000000003', role=CUSTOMER
  const customerUser = await prisma.user.upsert({
    where: { mobile: '9000000003' },
    update: {
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      email: 'customer@mkdrycleaners.com',
      isActive: true,
    },
    create: {
      mobile: '9000000003',
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      email: 'customer@mkdrycleaners.com',
      isActive: true,
    },
  });

  await prisma.customerProfile.upsert({
    where: { userId: customerUser.id },
    update: { firstName: 'Radha', lastName: 'Sharma' },
    create: {
      userId: customerUser.id,
      firstName: 'Radha',
      lastName: 'Sharma',
    },
  });

  // 10. Sample delivery partner: mobile='9000000004', role=DELIVERY_PARTNER
  const partnerUser = await prisma.user.upsert({
    where: { mobile: '9000000004' },
    update: {
      passwordHash: partnerPasswordHash,
      role: Role.DELIVERY_PARTNER,
      email: 'partner@mkdrycleaners.com',
      isActive: true,
    },
    create: {
      mobile: '9000000004',
      passwordHash: partnerPasswordHash,
      role: Role.DELIVERY_PARTNER,
      email: 'partner@mkdrycleaners.com',
      isActive: true,
    },
  });

  await prisma.partnerProfile.upsert({
    where: { userId: partnerUser.id },
    update: {
      firstName: 'Mohan',
      lastName: 'Kumar',
      vehicleNumber: 'UP-85-AB-1234',
      isAvailable: true,
      serviceAreas: ['281121', '281001'],
    },
    create: {
      userId: partnerUser.id,
      firstName: 'Mohan',
      lastName: 'Kumar',
      vehicleNumber: 'UP-85-AB-1234',
      isAvailable: true,
      serviceAreas: ['281121', '281001'],
    },
  });

  console.log('Seeded Users: Super Admin (9000000001), Admin (9000000002), Customer (9000000003), Partner (9000000004)');
  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
