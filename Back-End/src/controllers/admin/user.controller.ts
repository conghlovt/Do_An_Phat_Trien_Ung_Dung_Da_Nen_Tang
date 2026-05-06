import { type Request, type Response } from 'express';
import { userService } from '../../services/admin/user.service';
import { sendError, sendResponse } from '../../utils/response.util';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    const role = String(req.query.role || '').trim();
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const requesterRole = (req as any).user?.role;

    const result = await userService.getAllUsers({ q, role, requesterRole, page, limit });
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
    const user = await userService.updateUserStatus(id, status, requesterRole);
    return sendResponse(res, 200, 'Cập nhật trạng thái người dùng thành công.', user);
  } catch (error) {
    return sendError(res, error);
  }
};
