import { type Request, type Response } from 'express';
import { financeService } from '../services/finance.service';
import { sendError, sendResponse } from '../../shared/utils/response.util';
import {
  getSearchQuery,
  getStringQuery,
  normalizeSortOrder,
  parseDateRangeFromQuery,
  parsePagination,
} from '../utils/admin-query.util';

export const getFinanceRecords = async (req: Request, res: Response) => {
  try {
    const { page, limit } = parsePagination(req);
    const records = await financeService.getFinanceRecords({
      search: getSearchQuery(req),
      status: getStringQuery(req, 'status'),
      month: getStringQuery(req, 'month'),
      page,
      limit,
      sortBy: getStringQuery(req, 'sortBy'),
      sortOrder: normalizeSortOrder(req.query.sortOrder),
      dateRange: parseDateRangeFromQuery(req.query),
    });
    return sendResponse(res, 200, 'Lấy dữ liệu tài chính thành công.', records);
  } catch (error) {
    return sendError(res, error);
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await financeService.getStats({
      range: getStringQuery(req, 'range'),
      from: getStringQuery(req, 'from'),
      to: getStringQuery(req, 'to'),
    });
    return sendResponse(res, 200, 'Lấy thống kê thành công.', stats);
  } catch (error) {
    return sendError(res, error);
  }
};

export const getNotifications = async (_req: Request, res: Response) => {
  try {
    const notifications = await financeService.getNotifications();
    return sendResponse(res, 200, 'Lấy thông báo thành công.', notifications);
  } catch (error) {
    return sendError(res, error);
  }
};
