import { AppError } from '../utils/app-error.util';
import {
  applyActions,
  validateConstraints,
  validateRules,
  normalizeArray,
  normalizeObject,
} from '../../partner/utils/voucher.engine';
import prisma from '../../login/lib/prisma';

type Tx = any;

const makeValidationError = (message: string) =>
  new AppError(400, 'VALIDATION_ERROR', { userMessage: message });

const makeNotFoundError = (message: string) =>
  new AppError(404, 'RESOURCE_NOT_FOUND', { userMessage: message });

const normalizeCode = (code?: string | null) => String(code || '').trim().toUpperCase();

const voucherScopeWhere = (hotelId: string) => ({
  OR: [{ hotelId }, { hotelId: null }],
});

const pickScopedVoucher = (vouchers: any[], hotelId: string) =>
  vouchers.find((voucher) => voucher.hotelId === hotelId) ||
  vouchers.find((voucher) => voucher.hotelId === null) ||
  null;

export const formatVoucherForCustomer = (voucher: any, subtotal?: number) => {
  const rules = normalizeArray(voucher.rules);
  const actions = normalizeArray(voucher.actions);
  const constraints = normalizeObject(voucher.constraints);

  const priceResult = subtotal !== undefined ? applyActions(actions, subtotal) : null;

  return {
    id: voucher.id,
    hotelId: voucher.hotelId,
    code: voucher.code,
    name: voucher.name,
    status: voucher.status,
    rules,
    actions,
    constraints,

    // Legacy fields for backward compatibility
    discountType: actions[0]?.type || 'fixed',
    discountValue: actions[0]?.value || 0,
    maxDiscount: actions[0]?.max || null,
    minOrderValue: rules.find((r: any) => r.type === 'minOrder')?.value || null,
    usageLimit: constraints.usageLimit || null,
    usedCount: constraints.usedCount || 0,
    startDate: constraints.startDate || null,
    endDate: constraints.endDate || null,
    applicableRoomTypeIds: rules.find((r: any) => r.type === 'roomType')?.ids || ['all'],

    discount: priceResult?.discount || 0,
    finalTotal: priceResult?.finalPrice ?? subtotal,
  };
};

export const listUsableVouchers = async (
  tx: Tx,
  params: { hotelId: string; roomTypeId?: string | null | undefined; subtotal: number },
) => {
  const vouchers = await tx.voucher.findMany({
    where: {
      ...voucherScopeWhere(params.hotelId),
      status: 'ACTIVE',
    },
    orderBy: { createdAt: 'desc' },
  });

  const context = {
    totalPrice: params.subtotal,
    roomTypeId: params.roomTypeId || undefined,
  };

  return vouchers
    .sort((a: any, b: any) => {
      if (a.hotelId === params.hotelId && b.hotelId !== params.hotelId) return -1;
      if (a.hotelId !== params.hotelId && b.hotelId === params.hotelId) return 1;
      return 0;
    })
    .filter((v: any) => {
      const cValid = validateConstraints(v.constraints, context).valid;
      const rValid = validateRules(v.rules, context).valid;
      return cValid && rValid;
    })
    .map((v: any) => formatVoucherForCustomer(v, params.subtotal));
};

export const validateVoucher = async (
  tx: Tx,
  params: {
    hotelId: string;
    code: string;
    roomTypeId?: string | null | undefined;
    subtotal: number;
    bookingType?: string;
    stayDays?: number;
    stayHours?: number;
    userUsage?: number;
    hasPreviousBooking?: boolean;
    customerTier?: string;
  },
) => {
  const code = normalizeCode(params.code);
  if (!code) throw makeValidationError('Vui lòng nhập mã voucher.');

  const vouchers = await tx.voucher.findMany({
    where: {
      ...voucherScopeWhere(params.hotelId),
      code,
      status: 'ACTIVE',
    },
  });
  const voucher = pickScopedVoucher(vouchers, params.hotelId);

  if (!voucher) throw makeNotFoundError('Không tìm thấy voucher.');

  const context = {
    totalPrice: params.subtotal,
    roomTypeId: params.roomTypeId || undefined,
    bookingType: params.bookingType,
    stayDays: params.stayDays,
    stayHours: params.stayHours,
    userUsage: params.userUsage,
    hasPreviousBooking: params.hasPreviousBooking,
    customerTier: params.customerTier,
  };

  const cResult = validateConstraints(voucher.constraints, context);
  if (!cResult.valid) throw makeValidationError(cResult.reason || 'Voucher không hợp lệ.');

  const rResult = validateRules(voucher.rules, context);
  if (!rResult.valid) throw makeValidationError(rResult.reason || 'Điều kiện voucher không thỏa mãn.');

  const priceResult = applyActions(voucher.actions, params.subtotal);

  return {
    voucher,
    discount: priceResult.discount,
    finalTotal: priceResult.finalPrice,
    normalized: formatVoucherForCustomer(voucher, params.subtotal),
  };
};

export const incrementVoucherUsage = async (tx: Tx, voucherId: string) => {
  const voucher = await tx.voucher.findUnique({ where: { id: voucherId } });
  if (!voucher) return;

  const constraints = normalizeObject(voucher.constraints);
  const usageLimit = Number(constraints.usageLimit || 999999);
  const usedCount = Number(constraints.usedCount || 0);

  if (usedCount >= usageLimit) {
    throw makeValidationError('Voucher đã hết lượt sử dụng.');
  }

  const updatedConstraints = { ...constraints, usedCount: usedCount + 1 };

  await tx.voucher.update({
    where: { id: voucherId },
    data: { constraints: updatedConstraints as any },
  });
};

export const decrementVoucherUsageByCode = async (
  tx: Tx,
  hotelId: string,
  code?: string | null,
) => {
  const normalizedCode = normalizeCode(code);
  if (!normalizedCode) return;

  const vouchers = await tx.voucher.findMany({
    where: {
      ...voucherScopeWhere(hotelId),
      code: normalizedCode,
    },
  });
  const voucher = pickScopedVoucher(vouchers, hotelId);

  if (!voucher) return;

  const constraints = normalizeObject(voucher.constraints);
  const usedCount = Math.max(0, Number(constraints.usedCount || 0) - 1);
  const updatedConstraints = { ...constraints, usedCount };

  await tx.voucher.update({
    where: { id: voucher.id },
    data: { constraints: updatedConstraints as any },
  });
};

