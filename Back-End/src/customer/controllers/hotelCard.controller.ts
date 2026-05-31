import type { Request, Response, NextFunction } from "express";
import * as hotelCardService from "../services/hotelCard.service";
import { sendResponse } from "../../shared/utils/response.util";

export const getHotelCards = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const hotelCards = await hotelCardService.findHotelCards();
    return sendResponse(
      res,
      200,
      "Lấy danh sách hotel cards thành công",
      hotelCards,
    );
  } catch (error) {
    next(error);
  }
};

export const getHotelCardsByCity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { city } = req.params as { city: string };
    const hotelCards = await hotelCardService.findHotelCardsByCity(city);
    return sendResponse(
      res,
      200,
      "Lấy hotel cards theo thành phố thành công",
      hotelCards,
    );
  } catch (error) {
    next(error);
  }
};
