import type { Request, Response, NextFunction } from "express";
import * as locationService from "../services/location.service";
import { sendResponse } from "../../shared/utils/response.util";

// GET /api/customer/locations
export const getCustomerLocations = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const locations = await locationService.findCustomerLocations();
    sendResponse(res, 200, "Lấy danh sách địa chỉ thành công", locations);
  } catch (error) {
    next(error);
  }
};
