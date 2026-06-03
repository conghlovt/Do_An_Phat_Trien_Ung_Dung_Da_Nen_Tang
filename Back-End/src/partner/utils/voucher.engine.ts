type VoucherRule = {
  type: string;
  value?: any;
  min?: number | undefined;
  max?: number | undefined;
  ids?: string[] | undefined;
  values?: string[] | undefined;
};

type VoucherAction = {
  type: string;
  value: number;
  max?: number | undefined;
};

type VoucherConstraints = {
  usageLimit?: number | undefined;
  usedCount?: number | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  perUser?: number | undefined;
};

type VoucherContext = {
  totalPrice: number;
  bookingType?: string | undefined;
  roomTypeId?: string | undefined;
  stayDays?: number | undefined;
  stayHours?: number | undefined;
  hasPreviousBooking?: boolean | undefined;
  userUsage?: number | undefined;
  customerTier?: string | undefined;  
};


export function normalizeArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

export function normalizeObject(value: unknown): Record<string, any> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, any>;
  }

  return {};
}

export function validateConstraints(
  constraintsInput: unknown,
  context: VoucherContext
) {
  const constraints = normalizeObject(constraintsInput) as VoucherConstraints;
  const now = new Date();

  if (constraints.startDate) {
    const startDate = new Date(constraints.startDate);
    if (startDate > now) {
      return { valid: false, reason: 'Voucher chưa đến thời gian sử dụng' };
    }
  }

  if (constraints.endDate) {
    const endDate = new Date(constraints.endDate);
    if (endDate < now) {
      return { valid: false, reason: 'Voucher đã hết hạn' };
    }
  }

  if (
    typeof constraints.usageLimit === 'number' &&
    typeof constraints.usedCount === 'number' &&
    constraints.usedCount >= constraints.usageLimit
  ) {
    return { valid: false, reason: 'Voucher đã hết lượt sử dụng' };
  }

  if (
    typeof constraints.perUser === 'number' &&
    typeof context.userUsage === 'number' &&
    context.userUsage >= constraints.perUser
  ) {
    return {
      valid: false,
      reason: 'Bạn đã sử dụng voucher này quá số lần cho phép',
    };
  }

  return { valid: true, reason: null };
}

export function validateRules(rulesInput: unknown, context: VoucherContext) {
  const rules = normalizeArray(rulesInput) as VoucherRule[];

  for (const rule of rules) {
    switch (rule.type) {
      case 'minOrder': {
        if (context.totalPrice < Number(rule.value || 0)) {
          return {
            valid: false,
            reason: `Đơn hàng chưa đạt giá trị tối thiểu ${Number(rule.value || 0).toLocaleString('vi-VN')}đ`,
          };
        }
        break;
      }
      case 'customerTier': {
        const values = Array.isArray(rule.values) ? rule.values : [];

        if (!context.customerTier || !values.includes(context.customerTier)) {
          return {
            valid: false,
            reason: 'Voucher không áp dụng cho hạng khách hàng hiện tại',
          };
        }

        break;
      }
      case 'bookingType': {
        if (context.bookingType !== rule.value) {
          return {
            valid: false,
            reason: 'Voucher không áp dụng cho kiểu đặt phòng này',
          };
        }
        break;
      }

      case 'roomType': {
        const ids = Array.isArray(rule.ids) ? rule.ids : [];

        if (!context.roomTypeId || !ids.includes(context.roomTypeId)) {
          return {
            valid: false,
            reason: 'Voucher không áp dụng cho loại phòng này',
          };
        }
        break;
      }

      case 'stayDays': {
        const stayDays = Number(context.stayDays || 0);

        if (typeof rule.min === 'number' && stayDays < rule.min) {
          return {
            valid: false,
            reason: `Voucher yêu cầu lưu trú tối thiểu ${rule.min} ngày`,
          };
        }

        if (typeof rule.max === 'number' && stayDays > rule.max) {
          return {
            valid: false,
            reason: `Voucher chỉ áp dụng tối đa ${rule.max} ngày`,
          };
        }
        break;
      }

      case 'stayHours': {
        const stayHours = Number(context.stayHours || 0);

        if (typeof rule.min === 'number' && stayHours < rule.min) {
          return {
            valid: false,
            reason: `Voucher yêu cầu đặt tối thiểu ${rule.min} giờ`,
          };
        }

        if (typeof rule.max === 'number' && stayHours > rule.max) {
          return {
            valid: false,
            reason: `Voucher chỉ áp dụng tối đa ${rule.max} giờ`,
          };
        }
        break;
      }

      case 'firstBooking': {
        if (context.hasPreviousBooking) {
          return {
            valid: false,
            reason: 'Voucher chỉ áp dụng cho lần đặt đầu tiên',
          };
        }
        break;
      }

      default: {
        return {
          valid: false,
          reason: `Rule không được hỗ trợ: ${rule.type}`,
        };
      }
    }
  }

  return { valid: true, reason: null };
}

export function applyActions(actionsInput: unknown, totalPrice: number) {
  const actions = normalizeArray(actionsInput) as VoucherAction[];
  let discount = 0;

  for (const action of actions) {
    switch (action.type) {
      case 'percent': {
        const rawDiscount = (totalPrice * Number(action.value || 0)) / 100;
        const finalDiscount =
          typeof action.max === 'number'
            ? Math.min(rawDiscount, action.max)
            : rawDiscount;

        discount += finalDiscount;
        break;
      }

      case 'fixed': {
        discount += Number(action.value || 0);
        break;
      }

      default:
        break;
    }
  }

  const safeDiscount = Math.min(discount, totalPrice);
  const finalPrice = Math.max(totalPrice - safeDiscount, 0);

  return {
    originalPrice: totalPrice,
    discount: safeDiscount,
    finalPrice,
  };
}