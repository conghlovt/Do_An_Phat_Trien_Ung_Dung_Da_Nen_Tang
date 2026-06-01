import prisma from '../../login/lib/prisma';
import {
  listUsableVouchers,
  validateVoucher,
} from '../../shared/services/voucher-validation.service';

export const customerVoucherService = {
  listForCheckout: async (params: { hotelId: string; roomTypeId?: string | undefined; subtotal?: number }) => {
    const subtotal = Number(params.subtotal || 0);
    return prisma.$transaction((tx) =>
      listUsableVouchers(tx, {
        hotelId: params.hotelId,
        roomTypeId: params.roomTypeId,
        subtotal,
      }),
    );
  },

  validateForCheckout: async (params: {
    hotelId: string;
    roomTypeId?: string | undefined;
    subtotal: number;
    code: string;
  }) => {
    const result = await prisma.$transaction((tx) =>
      validateVoucher(tx, {
        hotelId: params.hotelId,
        roomTypeId: params.roomTypeId,
        subtotal: Number(params.subtotal || 0),
        code: params.code,
      }),
    );

    return {
      voucher: result.normalized,
      discount: result.discount,
      finalTotal: result.finalTotal,
    };
  },
};
