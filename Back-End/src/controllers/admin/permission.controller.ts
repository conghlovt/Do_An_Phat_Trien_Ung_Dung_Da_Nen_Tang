import { type Request, type Response } from 'express';
import { permissionService } from '../../services/admin/permission.service';
import { sendError, sendResponse } from '../../utils/response.util';
import { USER_MESSAGES } from '../../utils/app-error.util';

export const getRolePermissions = async (_req: Request, res: Response) => {
  try {
    const permissions = await permissionService.getRolePermissions();
    return sendResponse(res, 200, 'Lấy cấu hình phân quyền thành công.', permissions);
  } catch (error) {
    return sendError(res, error);
  }
};

export const updateRolePermissions = async (req: Request, res: Response) => {
  try {
    const role = String(req.params.role);
    const { permissions } = req.body;
    if (!permissions || typeof permissions !== 'object') {
      return sendResponse(res, 400, USER_MESSAGES.PERMISSION_PAYLOAD_REQUIRED);
    }
    const updated = await permissionService.updateRolePermissions(role, permissions);
    return sendResponse(res, 200, 'Lưu cấu hình phân quyền thành công.', updated);
  } catch (error) {
    return sendError(res, error);
  }
};
