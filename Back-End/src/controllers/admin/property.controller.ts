import { type Request, type Response } from 'express';
import { propertyService } from '../../services/admin/property.service';
import { sendError, sendResponse } from '../../utils/response.util';

export const getProperties = async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    const properties = await propertyService.getProperties({ q });
    return sendResponse(res, 200, 'Lấy danh sách chỗ nghỉ thành công.', properties);
  } catch (error) {
    return sendError(res, error);
  }
};

export const updateProperty = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const property = await propertyService.updateProperty(id, req.body);
    return sendResponse(res, 200, 'Cập nhật chỗ nghỉ thành công.', property);
  } catch (error) {
    return sendError(res, error);
  }
};

export const updatePropertyStatus = async (req: Request, res: Response) => {
  req.body = { status: req.body.status };
  return updateProperty(req, res);
};

export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await propertyService.deleteProperty(id);
    return sendResponse(res, 200, 'Xóa chỗ nghỉ thành công.');
  } catch (error) {
    return sendError(res, error);
  }
};
