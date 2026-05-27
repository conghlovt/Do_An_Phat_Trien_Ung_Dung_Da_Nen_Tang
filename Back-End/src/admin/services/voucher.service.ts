import prisma from '../../login/lib/prisma';
import { Prisma, VoucherStatus } from '@prisma/client';

const toJson = (value: unknown): Prisma.InputJsonValue => {
  return value as Prisma.InputJsonValue;
};

const normalizeArray = (value: unknown): any[] => {
  return Array.isArray(value) ? value : [];
};

const normalizeObject = (value: unknown): Record<string, any> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, any>;
  }

  return {};
};

const normalizeVoucher = (voucher: any) => {
  const rules = normalizeArray(voucher.rules);
  const actions = normalizeArray(voucher.actions);
  const constraints = normalizeObject(voucher.constraints);

  return {
    ...voucher,

    rules,
    actions,
    constraints,

    // compatibility cho UI cũ
    discountType: actions[0]?.type || 'fixed',
    discountValue: actions[0]?.value || 0,
    maxDiscount: actions[0]?.max || null,
    minOrderValue:
      rules.find((rule: any) => rule.type === 'minOrder')?.value || null,

    usageLimit: constraints.usageLimit || null,
    usedCount: constraints.usedCount || 0,
    startDate: constraints.startDate || null,
    endDate: constraints.endDate || null,
    expiry: constraints.endDate || null,

    applicableRoomTypeIds:
      rules.find((rule: any) => rule.type === 'roomType')?.ids || ['all'],
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.voucher.count({ where }),
    ]);

    return {
      vouchers: vouchers.map(normalizeVoucher),
      total,
      page,
      limit,
    };
  },

  createVoucher: async (data: any) => {
    const {
      hotelId,
      code,
      name,
      rules,
      actions,
      constraints,

      // fallback từ UI cũ nếu có
      discount,
      discountType,
      type,
      maxDiscount,
      minOrderValue,
      usageLimit,
      expiry,
      endDate,
      isActive,
      status,
    } = data;

    const finalRules = Array.isArray(rules)
      ? rules
      : minOrderValue
        ? [{ type: 'minOrder', value: Number(minOrderValue) }]
        : [];

    const finalActions = Array.isArray(actions)
      ? actions
      : [
          {
            type: discountType || type || 'fixed',
            value: Number(discount || 0),
            ...(maxDiscount ? { max: Number(maxDiscount) } : {}),
          },
        ];

    const finalConstraints =
      constraints && typeof constraints === 'object'
        ? constraints
        : {
            usageLimit: Number(usageLimit || 100),
            usedCount: 0,
            ...(expiry || endDate
              ? { endDate: new Date(expiry || endDate).toISOString() }
              : {}),
          };

    const voucher = await prisma.voucher.create({
      data: {
        hotelId: hotelId || null,
        code: String(code).trim().toUpperCase(),
        name: String(name || code).trim(),
        rules: toJson(finalRules),
        actions: toJson(finalActions),
        constraints: toJson(finalConstraints),
        status: status || (isActive === false ? VoucherStatus.INACTIVE : VoucherStatus.ACTIVE),
      } as any,
    });

    return normalizeVoucher(voucher);
  },

  updateVoucher: async (id: string, data: any) => {
    const {
      code,
      name,
      rules,
      actions,
      constraints,

      // fallback từ UI cũ nếu có
      discount,
      discountType,
      type,
      maxDiscount,
      minOrderValue,
      usageLimit,
      usedCount,
      expiry,
      endDate,
      isActive,
      status,
    } = data;

    const updateData: any = {};

    if (code !== undefined) {
      updateData.code = String(code).trim().toUpperCase();
    }

    if (name !== undefined) {
      updateData.name = String(name).trim();
    }

    if (rules !== undefined) {
      updateData.rules = toJson(Array.isArray(rules) ? rules : []);
    } else if (minOrderValue !== undefined) {
      updateData.rules = toJson([
        { type: 'minOrder', value: Number(minOrderValue) },
      ]);
    }

    if (actions !== undefined) {
      updateData.actions = toJson(Array.isArray(actions) ? actions : []);
    } else if (discount !== undefined || discountType !== undefined || type !== undefined) {
      updateData.actions = toJson([
        {
          type: discountType || type || 'fixed',
          value: Number(discount || 0),
          ...(maxDiscount ? { max: Number(maxDiscount) } : {}),
        },
      ]);
    }

    if (constraints !== undefined) {
      updateData.constraints = toJson(
        constraints && typeof constraints === 'object' ? constraints : {}
      );
    } else if (
      usageLimit !== undefined ||
      usedCount !== undefined ||
      expiry !== undefined ||
      endDate !== undefined
    ) {
      updateData.constraints = toJson({
        ...(usageLimit !== undefined ? { usageLimit: Number(usageLimit) } : {}),
        ...(usedCount !== undefined ? { usedCount: Number(usedCount) } : {}),
        ...(expiry !== undefined || endDate !== undefined
          ? { endDate: new Date(expiry || endDate).toISOString() }
          : {}),
      });
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (isActive !== undefined) {
      updateData.status = isActive ? VoucherStatus.ACTIVE : VoucherStatus.INACTIVE;
    }

    const voucher = await prisma.voucher.update({
      where: { id },
      data: updateData,
    });

    return normalizeVoucher(voucher);
  },

  deleteVoucher: async (id: string) => {
    await prisma.voucher.delete({ where: { id } });
  },
};