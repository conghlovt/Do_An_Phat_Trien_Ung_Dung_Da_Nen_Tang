import {} from 'express';
import { financeService } from '../services/finance.service';
import { sendError, sendResponse } from '../../shared/utils/response.util';
export const getFinanceRecords = async (_req, res) => {
    try {
        const records = await financeService.getFinanceRecords();
        return sendResponse(res, 200, 'Lấy dữ liệu tài chính thành công.', records);
    }
    catch (error) {
        return sendError(res, error);
    }
};
export const getStats = async (_req, res) => {
    try {
        const stats = await financeService.getStats();
        return sendResponse(res, 200, 'Lấy thống kê thành công.', stats);
    }
    catch (error) {
        return sendError(res, error);
    }
};
export const getNotifications = async (_req, res) => {
    try {
        const notifications = await financeService.getNotifications();
        return sendResponse(res, 200, 'Lấy thông báo thành công.', notifications);
    }
    catch (error) {
        return sendError(res, error);
    }
};
//# sourceMappingURL=finance.controller.js.map