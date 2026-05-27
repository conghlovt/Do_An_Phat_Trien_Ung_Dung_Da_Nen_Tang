import { type Request, type Response } from 'express';
import { voucherService } from '../services/voucher.service';
import { sendError, sendResponse } from '../../shared/utils/response.util';
import { USER_MESSAGES } from '../../shared/utils/app-error.util';
import {
  getSearchQuery,
  getStringQuery,
  normalizeSortOrder,
  parseDateRangeFromQuery,
  parsePagination,
} from '../utils/admin-query.util';

export const getAllVouchers = async (req: Request, res: Response) => {
  try {
    const { page, limit } = parsePagination(req);
    const result = await voucherService.getAllVouchers({
      search: getSearchQuery(req),
      status: getStringQuery(req, 'status'),
      page,
      limit,
      sortBy: getStringQuery(req, 'sortBy'),
      sortOrder: normalizeSortOrder(req.query.sortOrder),
      dateRange: parseDateRangeFromQuery(req.query),
    });
    return sendResponse(res, 200, 'Lấy danh sách voucher thành công.', result);
  } catch (error) {
    return sendError(res, error);
  }
};

export const createVoucher = async (req: Request, res: Response) => {
  try {
    const { code, hotelId, discount, discountValue, type, discountType, expiry, startDate, endDate } = req.body;
    if (!hotelId || !code || (discount === undefined && discountValue === undefined) || !(type || discountType) || !(expiry || endDate) || !startDate) {
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
