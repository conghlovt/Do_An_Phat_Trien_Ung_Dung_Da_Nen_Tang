import { AppError } from '../utils/app-error.util';

type Tx = any;

const makeValidationError = (message: string) =>
  new AppError(400, 'VALIDATION_ERROR', { userMessage: message });

const makeNotFoundError = (message: string) =>
  new AppError(404, 'RESOURCE_NOT_FOUND', { userMessage: message });

const normalizeCode = (code?: string | null) => String(code || '').trim().toUpperCase();

export const calculateVoucherDiscount = (voucher: any, subtotal: number) => {
  const discountType = String(voucher.discountType || '').toLowerCase();
  const discountValue = Number(voucher.discountValue || 0);
  const rawDiscount =
    discountType === 'percent' || discountType === 'percentage'
      ? Math.floor((subtotal * discountValue) / 100)
      : discountValue;

  const cappedDiscount =
    voucher.maxDiscount !== null && voucher.maxDiscount !== undefined
      ? Math.min(rawDiscount, Number(voucher.maxDiscount))
      : rawDiscount;

  return Math.max(0, Math.min(subtotal, cappedDiscount));
};

const isVoucherDateActive = (voucher: any, now = new Date()) =>
  voucher.startDate <= now && voucher.endDate >= now;

const isVoucherApplicableToRoomType = (voucher: any, roomTypeId?: string | null | undefined) => {
  const roomTypes = voucher.roomTypes || [];
  if (!roomTypes.length) return true;
  if (!roomTypeId) return false;
  return roomTypes.some((item: any) => item.roomTypeId === roomTypeId);
};

const assertVoucherUsable = (
  voucher: any,
  params: { roomTypeId?: string | null | undefined; subtotal: number; now?: Date },
) => {
  if (voucher.status !== 'ACTIVE') {
    throw makeValidationError('Voucher khong hoat dong.');
  }
  if (!isVoucherDateActive(voucher, params.now)) {
    throw makeValidationError('Voucher da het han hoac chua den thoi gian su dung.');
  }
  if (Number(voucher.usedCount || 0) >= Number(voucher.usageLimit || 0)) {
    throw makeValidationError('Voucher da het luot su dung.');
  }
  if (voucher.minOrderValue !== null && voucher.minOrderValue !== undefined && params.subtotal < Number(voucher.minOrderValue)) {
    throw makeValidationError('Tong tien chua dat dieu kien ap dung voucher.');
  }
  if (!isVoucherApplicableToRoomType(voucher, params.roomTypeId)) {
    throw makeValidationError('Voucher khong ap dung cho loai phong nay.');
  }
};

export const normalizeVoucherForCustomer = (voucher: any, subtotal?: number) => {
  const discount = subtotal !== undefined ? calculateVoucherDiscount(voucher, subtotal) : 0;
  return {
    id: voucher.id,
    hotelId: voucher.hotelId,
    code: voucher.code,
    name: voucher.name,
    discountType: voucher.discountType,
    discountValue: voucher.discountValue,
    minOrderValue: voucher.minOrderValue,
    maxDiscount: voucher.maxDiscount,
    usageLimit: voucher.usageLimit,
    usedCount: voucher.usedCount,
    startDate: voucher.startDate,
    endDate: voucher.endDate,
    status: voucher.status,
    applicableRoomTypeIds: voucher.roomTypes?.length
      ? voucher.roomTypes.map((item: any) => item.roomTypeId)
      : ['all'],
    discount,
    finalTotal: subtotal !== undefined ? Math.max(0, subtotal - discount) : undefined,
  };
};

export const listUsableVouchers = async (
  tx: Tx,
  params: { hotelId: string; roomTypeId?: string | null | undefined; subtotal: number },
) => {
  const now = new Date();
  const vouchers = await tx.voucher.findMany({
    where: {
      hotelId: params.hotelId,
      status: 'ACTIVE',
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: { roomTypes: true },
    orderBy: { createdAt: 'desc' },
  } as any);

  return vouchers
    .filter((voucher: any) => {
      try {
        assertVoucherUsable(voucher, {
          roomTypeId: params.roomTypeId,
          subtotal: params.subtotal,
          now,
        });
        return true;
      } catch {
        return false;
      }
    })
    .map((voucher: any) => normalizeVoucherForCustomer(voucher, params.subtotal));
};

export const validateVoucher = async (
  tx: Tx,
  params: {
    hotelId: string;
    code: string;
    roomTypeId?: string | null | undefined;
    subtotal: number;
  },
) => {
  const code = normalizeCode(params.code);
  if (!code) {
    throw makeValidationError('Vui long nhap ma voucher.');
  }

  const voucher = await tx.voucher.findFirst({
    where: {
      hotelId: params.hotelId,
      code,
    },
    include: { roomTypes: true },
  });

  if (!voucher) {
    throw makeNotFoundError('Khong tim thay voucher.');
  }

  assertVoucherUsable(voucher, {
    roomTypeId: params.roomTypeId,
    subtotal: params.subtotal,
  });

  const discount = calculateVoucherDiscount(voucher, params.subtotal);
  return {
    voucher,
    discount,
    finalTotal: Math.max(0, params.subtotal - discount),
    normalized: normalizeVoucherForCustomer(voucher, params.subtotal),
  };
};

export const incrementVoucherUsage = async (tx: Tx, voucherId: string, usageLimit: number) => {
  const updated = await tx.voucher.updateMany({
    where: {
      id: voucherId,
      usedCount: { lt: usageLimit },
    },
    data: { usedCount: { increment: 1 } },
  } as any);

  if (updated.count !== 1) {
    throw makeValidationError('Voucher da het luot su dung.');
  }
};

export const decrementVoucherUsageByCode = async (
  tx: Tx,
  hotelId: string,
  code?: string | null,
) => {
  const normalizedCode = normalizeCode(code);
  if (!normalizedCode) return;

  await tx.voucher.updateMany({
    where: {
      hotelId,
      code: normalizedCode,
      usedCount: { gt: 0 },
    },
    data: { usedCount: { decrement: 1 } },
  });
};
