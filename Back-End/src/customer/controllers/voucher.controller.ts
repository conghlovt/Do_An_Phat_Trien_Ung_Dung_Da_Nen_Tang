import type { Request, Response, NextFunction } from 'express';
import { customerVoucherService } from '../services/voucher.service';

export const listHotelVouchers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vouchers = await customerVoucherService.listForCheckout({
      hotelId: req.params.id as string,
      roomTypeId: req.query.roomTypeId ? String(req.query.roomTypeId) : undefined,
      subtotal: req.query.subtotal ? Number(req.query.subtotal) : 0,
    });

    res.json({ data: { vouchers } });
  } catch (error) {
    next(error);
  }
};

export const validateHotelVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await customerVoucherService.validateForCheckout({
      hotelId: req.params.id as string,
      roomTypeId: req.body.roomTypeId ? String(req.body.roomTypeId) : undefined,
      subtotal: Number(req.body.subtotal || 0),
      code: String(req.body.code || ''),
    });

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};
