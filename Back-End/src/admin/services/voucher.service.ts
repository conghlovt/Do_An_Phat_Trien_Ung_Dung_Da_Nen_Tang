import prisma from '../../login/lib/prisma';
import { Prisma, VoucherStatus } from '@prisma/client';
import { normalizeArray, normalizeObject } from '../../partner/utils/voucher.engine';
import { buildListResult, type DateRange, type SortOrder } from '../utils/admin-query.util';

const toJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

const formatVoucher = (voucher: any) => {
  const rules = normalizeArray(voucher.rules);
  const actions = normalizeArray(voucher.actions);
  const constraints = normalizeObject(voucher.constraints);
  const discountType = actions[0]?.type || 'fixed';
  const discountValue = actions[0]?.value || 0;
  const endDate = constraints.endDate || null;

  return {
    ...voucher,
    rules,
    actions,
    constraints,
    // Compatibility for legacy frontend
    discountType,
    discountValue,
    discount: discountValue,
    type: discountType === 'fixed' ? 'FIXED' : 'PERCENTAGE',
    maxDiscount: actions[0]?.max || null,
    minOrderValue: rules.find((r: any) => r.type === 'minOrder')?.value || null,
    usageLimit: constraints.usageLimit || null,
    usedCount: constraints.usedCount || 0,
    startDate: constraints.startDate || null,
    endDate,
    expiry: endDate,
    applicableRoomTypeIds: rules.find((r: any) => r.type === 'roomType')?.ids || ['all'],
  };
};

export type AdminVoucherListOptions = {
  q?: string | undefined;
  search?: string | undefined;
  status?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
  sortBy?: string | undefined;
  sortOrder?: SortOrder | undefined;
  dateRange?: DateRange | undefined;
  paginate?: boolean | undefined;
};

const voucherSortFields = new Set(['createdAt', 'updatedAt', 'code', 'name', 'status']);

const buildVoucherWhere = (options: AdminVoucherListOptions): Prisma.VoucherWhereInput => {
  const query = String(options.search || options.q || '').trim();
  const where: Prisma.VoucherWhereInput = {};

  if (query) {
    where.OR = [
      { code: { contains: query, mode: 'insensitive' } },
      { name: { contains: query, mode: 'insensitive' } },
      { hotel: { name: { contains: query, mode: 'insensitive' } } },
    ];
  }

  if (options.status) {
    where.status = options.status as any;
  }

  if (options.dateRange?.from || options.dateRange?.to) {
    where.createdAt = {
      ...(options.dateRange.from ? { gte: options.dateRange.from } : {}),
      ...(options.dateRange.to ? { lte: options.dateRange.to } : {}),
    };
  }

  return where;
};

const buildVoucherOrderBy = (sortBy?: string, sortOrder: SortOrder = 'desc') => ({
  [voucherSortFields.has(String(sortBy || '')) ? String(sortBy) : 'createdAt']: sortOrder,
});

export const voucherService = {
  getAllVouchers: async (options: AdminVoucherListOptions = {}) => {
    const { page = 1, limit = 10, paginate = true } = options;
    const skip = (page - 1) * limit;
    const where = buildVoucherWhere(options);

    const [vouchers, total, hotels] = await Promise.all([
      prisma.voucher.findMany({
        where,
        include: { hotel: { select: { id: true, name: true } } },
        orderBy: buildVoucherOrderBy(options.sortBy, options.sortOrder) as any,
        ...(paginate ? { skip, take: limit } : {}),
      }),
      prisma.voucher.count({ where }),
      prisma.hotel.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      ...buildListResult('vouchers', vouchers.map(formatVoucher), page, limit, total),
      hotels,
    };
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
