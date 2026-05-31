import type { Request, Response, NextFunction } from "express";
import * as homeService from "../services/home.service";
import { sendResponse } from "../../shared/utils/response.util";

export const getHotelSections = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sections = await homeService.findHotelSections();
    return sendResponse(res, 200, "Lấy hotel sections thành công", sections);
  } catch (error) {
    next(error);
  }
};
