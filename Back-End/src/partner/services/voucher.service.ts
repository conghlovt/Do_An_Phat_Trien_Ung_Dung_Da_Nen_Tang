import prisma from '../../login/lib/prisma';
import { VoucherStatus, Prisma } from '@prisma/client';
import {
  applyActions,
  validateConstraints,
  validateRules,
  normalizeArray,
  normalizeObject,
} from '../utils/voucher.engine';


const toJson = (value: unknown): Prisma.InputJsonValue => {
  return value as Prisma.InputJsonValue;
};
function makeError(message: string, statusCode = 400) {
  const error: any = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function checkHotelOwner(hotelId: string, ownerId: string) {
  if (!ownerId) {
    throw makeError('Bạn chưa đăng nhập', 401);
  }

  const hotel = await prisma.hotel.findFirst({
    where: {
      id: hotelId,
      ownerId,
    },
  });

  if (!hotel) {
    throw makeError(
      'Không tìm thấy khách sạn hoặc bạn không có quyền truy cập',
      404
    );
  }

  return hotel;
}

function formatVoucher(voucher: any) {
  const rules = normalizeArray(voucher.rules);
  const actions = normalizeArray(voucher.actions);
  const constraints = normalizeObject(voucher.constraints);

  return {
    ...voucher,

    rules,
    actions,
    constraints,

    // compatibility cho frontend cũ
    discountType: actions[0]?.type || 'fixed',
    discountValue: actions[0]?.value || 0,
    maxDiscount: actions[0]?.max || null,
    minOrderValue:
      rules.find((rule: any) => rule.type === 'minOrder')?.value || null,
    usageLimit: constraints.usageLimit || null,
    usedCount: constraints.usedCount || 0,
    startDate: constraints.startDate || null,
    endDate: constraints.endDate || null,
    applicableRoomTypeIds:
      rules.find((rule: any) => rule.type === 'roomType')?.ids || ['all'],
    roomTypes: [],
  };
}

export const voucherService = {
  async listByHotel(hotelId: string, ownerId: string) {
    await checkHotelOwner(hotelId, ownerId);

    const vouchers = await prisma.voucher.findMany({
      where: {
        hotelId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return vouchers.map(formatVoucher);
  },

  async getById(hotelId: string, voucherId: string, ownerId: string) {
    await checkHotelOwner(hotelId, ownerId);

    const voucher = await prisma.voucher.findFirst({
      where: {
        id: voucherId,
        hotelId,
      },
    });

    if (!voucher) {
      throw makeError('Không tìm thấy voucher', 404);
    }

    return formatVoucher(voucher);
  },

  async create(hotelId: string, ownerId: string, data: any) {
    await checkHotelOwner(hotelId, ownerId);

    const code = String(data.code || '').trim().toUpperCase();
    const name = String(data.name || '').trim();

    if (!code) {
      throw makeError('Mã voucher không được để trống', 400);
    }

    if (!name) {
      throw makeError('Tên voucher không được để trống', 400);
    }

    const rules = Array.isArray(data.rules) ? data.rules : [];
    const actions = Array.isArray(data.actions) ? data.actions : [];
    const constraints =
      data.constraints && typeof data.constraints === 'object'
        ? data.constraints
        : {};

    if (!actions.length) {
      throw makeError('Voucher cần ít nhất một hành động giảm giá', 400);
    }

    const voucher = await prisma.voucher.create({
      data: {
        hotelId,
        code,
        name,
        rules: toJson(rules),
        actions: toJson(actions),
        constraints: toJson(constraints),
        status: VoucherStatus.ACTIVE,
      } as any,
    });

    return formatVoucher(voucher);
  },

  async update(hotelId: string, voucherId: string, ownerId: string, data: any) {
    await checkHotelOwner(hotelId, ownerId);

    const existingVoucher = await prisma.voucher.findFirst({
      where: {
        id: voucherId,
        hotelId,
      },
    });

    if (!existingVoucher) {
      throw makeError('Không tìm thấy voucher', 404);
    }

    const updateData: any = {};

    if (data.code !== undefined) {
      updateData.code = String(data.code).trim().toUpperCase();
    }

    if (data.name !== undefined) {
      updateData.name = String(data.name).trim();
    }

    if (data.rules !== undefined) {
      updateData.rules = toJson(Array.isArray(data.rules) ? data.rules : []);
    }

    if (data.actions !== undefined) {
      updateData.actions = toJson(Array.isArray(data.actions) ? data.actions : []);
    }

    if (data.constraints !== undefined) {
      updateData.constraints = toJson(
        data.constraints && typeof data.constraints === 'object'
          ? data.constraints
          : {}
      );
 
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    const voucher = await prisma.voucher.update({
      where: {
        id: voucherId,
      },
      data: updateData,
    });

    return formatVoucher(voucher);
  },

  async remove(hotelId: string, voucherId: string, ownerId: string) {
    await checkHotelOwner(hotelId, ownerId);

    const existingVoucher = await prisma.voucher.findFirst({
      where: {
        id: voucherId,
        hotelId,
      },
    });

    if (!existingVoucher) {
      throw makeError('Không tìm thấy voucher', 404);
    }

    await prisma.voucher.delete({
      where: {
        id: voucherId,
      },
    });

    return true;
  },

  async applyVoucher(hotelId: string, userId: string, data: any) {
    const safeData = data || {};

    if (Array.isArray(safeData.codes) || Array.isArray(safeData.voucherCodes)) {
      throw makeError('Mỗi đơn đặt phòng chỉ được áp dụng một voucher', 400);
    }

    const code = String(safeData.code || '').trim().toUpperCase();

    if (!code) {
      throw makeError('Vui lòng nhập mã voucher', 400);
    }

    const totalPrice = Number(safeData.totalPrice || 0);

    if (totalPrice <= 0) {
      throw makeError('Tổng tiền không hợp lệ', 400);
    }

    const voucher = await prisma.voucher.findFirst({
      where: {
        hotelId,
        code,
        status: VoucherStatus.ACTIVE,
      },
    });

    if (!voucher) {
      throw makeError('Voucher không tồn tại hoặc đã bị tắt', 404);
    }

    const hasPreviousBooking = false;

    // Tạm thời cho test perUser.
    // Sau này khi làm Booking/VoucherUsage thì lấy thật từ DB.
    const userUsage = Number(safeData.userUsage || 0);

    // Tạm thời cho test hạng khách.
    // Sau này có thể tính từ số booking hoặc bảng loyalty.
    const customerTier = String(safeData.customerTier || 'REGULAR').toUpperCase();

    const context = {
      totalPrice,
      bookingType: safeData.bookingType,
      roomTypeId: safeData.roomTypeId,
      stayDays: Number(safeData.stayDays || 0),
      stayHours: Number(safeData.stayHours || 0),
      hasPreviousBooking,
      userUsage,
      customerTier,
    };

    const constraintResult = validateConstraints(
      voucher.constraints || {},
      context
    );

    if (!constraintResult.valid) {
      throw makeError(constraintResult.reason || 'Voucher không hợp lệ', 400);
    }

    const ruleResult = validateRules(
      voucher.rules || [],
      context
    );

    if (!ruleResult.valid) {
      throw makeError(ruleResult.reason || 'Voucher không áp dụng', 400);
    }

    const priceResult = applyActions(
      voucher.actions || [],
      totalPrice
    );


    return {
      voucher: formatVoucher(voucher),
      voucherId: voucher.id,
      voucherCode: voucher.code,
      ...priceResult,
    };

  }

};