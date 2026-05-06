import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

const normalizeVoucher = (voucher: any) => ({
  ...voucher,
  endDate: voucher.expiry,
});

export const voucherService = {
  getAllVouchers: async (options: { q?: string; page?: number; limit?: number }) => {
    const { q, page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.VoucherWhereInput = q
      ? {
          OR: [
            { code: { contains: q, mode: 'insensitive' } },
            { type: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};

    const [vouchers, total] = await Promise.all([
      prisma.voucher.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.voucher.count({ where }),
    ]);

    return { vouchers: vouchers.map(normalizeVoucher), total, page, limit };
  },

  createVoucher: async (data: any) => {
    const { code, discount, type, expiry, endDate, usageLimit, isActive, status } = data;
    const expiryDate = expiry || endDate;

    const voucher = await prisma.voucher.create({
      data: {
        code: String(code).trim().toUpperCase(),
        discount: Number(discount),
        type,
        expiry: new Date(expiryDate),
        usageLimit: Number(usageLimit || 100),
        status: status || (isActive === false ? 'INACTIVE' : 'ACTIVE'),
      },
    });
    return normalizeVoucher(voucher);
  },

  updateVoucher: async (id: string, data: any) => {
    const { code, discount, type, expiry, endDate, usageLimit, usedCount, isActive, status } = data;

    const voucher = await prisma.voucher.update({
      where: { id },
      data: {
        ...(code !== undefined ? { code: String(code).trim().toUpperCase() } : {}),
        ...(discount !== undefined ? { discount: Number(discount) } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(expiry !== undefined || endDate !== undefined ? { expiry: new Date(expiry || endDate) } : {}),
        ...(usageLimit !== undefined ? { usageLimit: Number(usageLimit) } : {}),
        ...(usedCount !== undefined ? { usedCount: Number(usedCount) } : {}),
        ...(status !== undefined ? { status: status as any } : {}),
        ...(isActive !== undefined ? { status: isActive ? 'ACTIVE' : 'INACTIVE' } : {}),
      },
    });
    return normalizeVoucher(voucher);
  },

  deleteVoucher: async (id: string) => {
    await prisma.voucher.delete({ where: { id } });
  },
};
