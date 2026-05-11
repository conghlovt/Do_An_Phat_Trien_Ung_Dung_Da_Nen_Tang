import { type Request, type Response } from 'express';
import { voucherService } from '../services/voucher.service';
import { sendError, sendResponse } from '../../login/utils/response.util';
import { USER_MESSAGES } from '../../login/utils/app-error.util';

export const getAllVouchers = async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const result = await voucherService.getAllVouchers({ q, page, limit });
    return sendResponse(res, 200, 'Lấy danh sách voucher thành công.', result);
  } catch (error) {
    return sendError(res, error);
  }
};

export const createVoucher = async (req: Request, res: Response) => {
  try {
    const { code, discount, type, expiry, endDate } = req.body;
    if (!code || discount === undefined || !type || !(expiry || endDate)) {
      return sendResponse(res, 400, USER_MESSAGES.VOUCHER_REQUIRED_FIELDS);
    }
    const voucher = await voucherService.createVoucher(req.body);
    return sendResponse(res, 201, 'Tạo voucher thành công.', voucher);
  } catch (error) {
    return sendError(res, error);
  }
};

export const updateVoucher = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const voucher = await voucherService.updateVoucher(id, req.body);
    return sendResponse(res, 200, 'Cập nhật voucher thành công.', voucher);
  } catch (error) {
    return sendError(res, error);
  }
};

export const deleteVoucher = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await voucherService.deleteVoucher(id);
    return sendResponse(res, 200, 'Xóa voucher thành công.');
  } catch (error) {
    return sendError(res, error);
  }
};
