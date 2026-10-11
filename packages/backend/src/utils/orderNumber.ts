import { prisma } from './prisma';

export async function generateOrderNumber(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const datePrefix = `MK-${year}${month}${day}`;

  const countToday = await prisma.order.count({
    where: {
      orderNumber: {
        startsWith: datePrefix,
      },
    },
  });

  const sequence = String(countToday + 1).padStart(4, '0');
  return `${datePrefix}-${sequence}`;
}
