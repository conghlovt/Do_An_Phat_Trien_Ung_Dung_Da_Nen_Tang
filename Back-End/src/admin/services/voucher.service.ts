import prisma from '../../login/lib/prisma';
import { Prisma, VoucherStatus } from '@prisma/client';
import { normalizeArray, normalizeObject } from '../../partner/utils/voucher.engine';
import { buildListResult, type DateRange, type SortOrder } from '../utils/admin-query.util';

const toJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;
const validScopes = new Set(['partner', 'customer', 'all']);

function makeError(message: string, statusCode = 400) {
  const error: any = new Error(message);
  error.statusCode = statusCode;
  return error;
}

const asNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeScope = (data: any) => {
  const raw = String(data?.scope || data?.voucherScope || data?.voucherType || '').trim().toLowerCase();
  if (validScopes.has(raw) && raw !== 'all') return raw;
  if (data?.hotelId === null) return 'customer';
  if (data?.hotelId) return 'partner';
  return 'customer';
};

const normalizeDate = (value: unknown) => {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const getAction = (actions: any[]) => actions[0] || {};

const normalizeVoucherPayload = (data: any, existing?: any) => {
  const rawRules = data.rules !== undefined ? normalizeArray(data.rules) : normalizeArray(existing?.rules);
  const rawActions = data.actions !== undefined ? normalizeArray(data.actions) : normalizeArray(existing?.actions);
  const rawConstraints =
    data.constraints !== undefined ? normalizeObject(data.constraints) : normalizeObject(existing?.constraints);

  const legacyType = String(data.discountType || data.type || getAction(rawActions).type || 'percent').toLowerCase();
  const discountType = legacyType === 'fixed' || legacyType === 'fixed_amount' || legacyType === 'fixed_amount_vnd' || legacyType === 'FIXED'.toLowerCase()
    ? 'fixed'
    : 'percent';
  const discountValue = asNumber(data.discountValue ?? data.discount ?? getAction(rawActions).value);
  const maxDiscount = asNumber(data.maxDiscount ?? getAction(rawActions).max);
  const minOrderValue = asNumber(
    data.minOrderValue ?? rawRules.find((rule: any) => rule.type === 'minOrder')?.value,
  );
  const usageLimit = asNumber(data.usageLimit ?? rawConstraints.usageLimit);
  const usedCount = asNumber(data.usedCount ?? rawConstraints.usedCount) ?? 0;
  const startDate = normalizeDate(data.startDate ?? rawConstraints.startDate);
  const endDate = normalizeDate(data.endDate ?? data.expiry ?? rawConstraints.endDate);
  const applicableRoomTypeIds = Array.isArray(data.applicableRoomTypeIds)
    ? data.applicableRoomTypeIds
    : rawRules.find((rule: any) => rule.type === 'roomType')?.ids;

  const rules = rawRules.filter((rule: any) => !['minOrder', 'roomType'].includes(rule?.type));
  if (minOrderValue !== null && minOrderValue > 0) {
    rules.push({ type: 'minOrder', value: minOrderValue });
  }
  if (Array.isArray(applicableRoomTypeIds) && !applicableRoomTypeIds.includes('all')) {
    rules.push({ type: 'roomType', ids: applicableRoomTypeIds });
  }

  const action: any = { type: discountType, value: discountValue };
  if (discountType === 'percent' && maxDiscount !== null && maxDiscount > 0) {
    action.max = maxDiscount;
  }

  const constraints: any = {
    ...rawConstraints,
    usedCount,
  };
  if (usageLimit !== null && usageLimit > 0) constraints.usageLimit = usageLimit;
  if (startDate) constraints.startDate = startDate;
  if (endDate) constraints.endDate = endDate;

  return {
    rules,
    actions: [action],
    constraints,
    discountType,
    discountValue,
    startDate,
    endDate,
  };
};

const validateVoucherPayload = (data: any, normalized: ReturnType<typeof normalizeVoucherPayload>, isCreate: boolean) => {
  const code = data.code !== undefined ? String(data.code || '').trim().toUpperCase() : undefined;
  const name = data.name !== undefined ? String(data.name || '').trim() : undefined;

  if (isCreate || data.code !== undefined) {
    if (!code) throw makeError('Mã voucher không được để trống', 400);
  }
  if (isCreate || data.name !== undefined) {
    if (!name) throw makeError('Tên voucher không được để trống', 400);
  }
  if (isCreate || data.discountValue !== undefined || data.discount !== undefined || data.actions !== undefined) {
    if (!normalized.discountValue || normalized.discountValue <= 0) {
      throw makeError('Giá trị giảm giá phải lớn hơn 0', 400);
    }
    if (normalized.discountType === 'percent' && (normalized.discountValue < 1 || normalized.discountValue > 100)) {
      throw makeError('Voucher phần trăm phải nằm trong khoảng 1-100', 400);
    }
  }
  if (normalized.startDate && normalized.endDate && new Date(normalized.endDate) <= new Date(normalized.startDate)) {
    throw makeError('Ngày hết hạn phải sau ngày bắt đầu', 400);
  }
};

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
  scope?: string | undefined;
  hotelId?: string | undefined;
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

  if (options.hotelId) {
    where.hotelId = options.hotelId;
  } else if (options.scope === 'partner') {
    where.hotelId = { not: null };
  } else if (options.scope === 'customer') {
    where.hotelId = null;
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
    const scope = normalizeScope(data);
    const hotelId = scope === 'customer' ? null : String(data.hotelId || '').trim();
    if (scope === 'partner' && !hotelId) {
      throw makeError('Voucher partner phải gắn với khách sạn', 400);
    }

    const code = String(data.code || '').trim().toUpperCase();
    const name = String(data.name || '').trim();
    const normalized = normalizeVoucherPayload(data);
    validateVoucherPayload({ ...data, code, name }, normalized, true);

    const existing = await prisma.voucher.findFirst({
      where: scope === 'customer' ? { hotelId: null, code } : { hotelId, code },
      select: { id: true },
    });
    if (existing) {
      throw makeError('Mã voucher đã tồn tại trong phạm vi này', 409);
    }

    const voucher = await prisma.voucher.create({
      data: {
        code,
        name,
        hotelId,
        rules: toJson(normalized.rules),
        actions: toJson(normalized.actions),
        constraints: toJson(normalized.constraints),
        status: data.status || VoucherStatus.ACTIVE,
      } as any,
    });

    return formatVoucher(voucher);
  },

  updateVoucher: async (id: string, data: any) => {
    const existingVoucher = await prisma.voucher.findUnique({ where: { id } });
    if (!existingVoucher) {
      throw makeError('Không tìm thấy voucher', 404);
    }

    const targetHotelId =
      data.hotelId !== undefined
        ? data.hotelId
          ? String(data.hotelId).trim()
          : null
        : existingVoucher.hotelId;
    const normalized = normalizeVoucherPayload(data, existingVoucher);
    validateVoucherPayload(data, normalized, false);
    const nextCode = data.code !== undefined ? String(data.code).trim().toUpperCase() : existingVoucher.code;
    const nextName = data.name !== undefined ? String(data.name).trim() : existingVoucher.name;

    if (!nextCode) throw makeError('Mã voucher không được để trống', 400);
    if (!nextName) throw makeError('Tên voucher không được để trống', 400);

    if (data.code !== undefined || data.hotelId !== undefined) {
      const duplicate = await prisma.voucher.findFirst({
        where: {
          id: { not: id },
          code: nextCode,
          hotelId: targetHotelId,
        },
        select: { id: true },
      });
      if (duplicate) {
        throw makeError('Mã voucher đã tồn tại trong phạm vi này', 409);
      }
    }

    const voucher = await prisma.voucher.update({
      where: { id },
      data: {
        code: nextCode,
        name: nextName,
        hotelId: targetHotelId,
        rules: toJson(normalized.rules),
        actions: toJson(normalized.actions),
        constraints: toJson(normalized.constraints),
        ...(data.status !== undefined ? { status: data.status as any } : {}),
      },
    });
    return formatVoucher(voucher);
  },

  deleteVoucher: async (id: string) => {
    await prisma.voucher.delete({ where: { id } });
  },
};
