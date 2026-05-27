import prisma from '../../login/lib/prisma';
import { Prisma, VoucherStatus } from '@prisma/client';
import { normalizeArray, normalizeObject } from '../../partner/utils/voucher.engine';

const toJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

const formatVoucher = (voucher: any) => {
  const rules = normalizeArray(voucher.rules);
  const actions = normalizeArray(voucher.actions);
  const constraints = normalizeObject(voucher.constraints);

  return {
    ...voucher,
    rules,
    actions,
    constraints,
    // Compatibility for legacy frontend
    discountType: actions[0]?.type || 'fixed',
    discountValue: actions[0]?.value || 0,
    maxDiscount: actions[0]?.max || null,
    minOrderValue: rules.find((r: any) => r.type === 'minOrder')?.value || null,
    usageLimit: constraints.usageLimit || null,
    usedCount: constraints.usedCount || 0,
    startDate: constraints.startDate || null,
    endDate: constraints.endDate || null,
    applicableRoomTypeIds: rules.find((r: any) => r.type === 'roomType')?.ids || ['all'],
  };
};

export const voucherService = {
  getAllVouchers: async (options: { q?: string; page?: number; limit?: number }) => {
    const { q, page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.VoucherWhereInput = q
      ? {
          OR: [
            { code: { contains: q, mode: 'insensitive' } },
            { name: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};

    const [vouchers, total] = await Promise.all([
      prisma.voucher.findMany({
        where,
        include: { hotel: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.voucher.count({ where }),
    ]);

    return { vouchers: vouchers.map(formatVoucher), total, page, limit };
  },

  createVoucher: async (data: any) => {
    const { code, name, rules, actions, constraints, status, hotelId } = data;

    const voucher = await prisma.voucher.create({
      data: {
        code: String(code || '').trim().toUpperCase(),
        name: String(name || '').trim(),
        hotelId,
        rules: toJson(rules || []),
        actions: toJson(actions || []),
        constraints: toJson(constraints || {}),
        status: status || VoucherStatus.ACTIVE,
      } as any,
    });

    return formatVoucher(voucher);
  },

  updateVoucher: async (id: string, data: any) => {
    const { code, name, rules, actions, constraints, status } = data;

    const voucher = await prisma.voucher.update({
      where: { id },
      data: {
        ...(code !== undefined ? { code: String(code).trim().toUpperCase() } : {}),
        ...(name !== undefined ? { name: String(name).trim() } : {}),
        ...(rules !== undefined ? { rules: toJson(rules) } : {}),
        ...(actions !== undefined ? { actions: toJson(actions) } : {}),
        ...(constraints !== undefined ? { constraints: toJson(constraints) } : {}),
        ...(status !== undefined ? { status: status as any } : {}),
      },
    });
    return formatVoucher(voucher);
  },

  deleteVoucher: async (id: string) => {
    await prisma.voucher.delete({ where: { id } });
  },
};