import { type Request, type Response } from 'express';
import { userService } from '../services/user.service';
import { sendError, sendResponse } from '../../shared/utils/response.util';
import {
  getSearchQuery,
  getStringQuery,
  normalizeSortOrder,
  parseDateRangeFromQuery,
  parsePagination,
} from '../utils/admin-query.util';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page, limit } = parsePagination(req);
    const requesterRole = (req as any).user?.role;

    const result = await userService.getAllUsers({
      search: getSearchQuery(req),
      role: getStringQuery(req, 'role'),
      status: getStringQuery(req, 'status'),
      requesterRole,
      page,
      limit,
      sortBy: getStringQuery(req, 'sortBy'),
      sortOrder: normalizeSortOrder(req.query.sortOrder),
      dateRange: parseDateRangeFromQuery(req.query),
    });
    return sendResponse(res, 200, 'Lấy danh sách người dùng thành công.', result);
  } catch (error) {
    return sendError(res, error);
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const requesterRole = (req as any).user?.role;
    const user = await userService.createUser(req.body, requesterRole);
    return sendResponse(res, 201, 'Tạo người dùng thành công.', user);
  } catch (error) {
    return sendError(res, error);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const requesterRole = (req as any).user?.role;
    const user = await userService.updateUser(id, req.body, requesterRole);
    return sendResponse(res, 200, 'Cập nhật người dùng thành công.', user);
  } catch (error) {
    return sendError(res, error);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const requesterRole = (req as any).user?.role;
    await userService.deleteUser(id, requesterRole);
    return sendResponse(res, 200, 'Xóa người dùng thành công.');
  } catch (error) {
    return sendError(res, error);
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;
    const requesterRole = (req as any).user?.role;
    const requesterId = (req as any).user?.id;
    const user = await userService.updateUserStatus(id, status, requesterRole, requesterId);
    return sendResponse(res, 200, 'Cập nhật trạng thái người dùng thành công.', user);
  } catch (error) {
    return sendError(res, error);
  }
};

export const blockUser = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const requesterRole = (req as any).user?.role;
    const requesterId = (req as any).user?.id;
    const user = await userService.blockUser(id, requesterRole, requesterId);
    return sendResponse(res, 200, 'Đã khóa tài khoản người dùng.', user);
  } catch (error) {
    return sendError(res, error);
  }
};

export const unblockUser = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const requesterRole = (req as any).user?.role;
    const requesterId = (req as any).user?.id;
    const user = await userService.unblockUser(id, requesterRole, requesterId);
    return sendResponse(res, 200, 'Đã mở khóa tài khoản người dùng.', user);
  } catch (error) {
    return sendError(res, error);
  }
};
