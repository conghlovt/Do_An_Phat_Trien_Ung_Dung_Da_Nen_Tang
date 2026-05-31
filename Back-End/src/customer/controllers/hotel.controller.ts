import type { Request, Response, NextFunction } from "express";
import * as hotelService from "../services/hotels.service";
import * as roomService from "../services/room.service";
import * as availabilityService from "../services/availability.service";
import { sendResponse } from "../../shared/utils/response.util";
import type { HotelQueryParams } from "../models/hotel.model";
import type { AvailabilityQueryParams, RoomQueryParams } from "../models/room.model";
import type { CustomerAuthRequest } from "../middlewares/auth.middleware";

// GET /api/customer/hotels
export const getHotels = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { hotels, total } = await hotelService.findHotels(
      req.query as HotelQueryParams,
    );
    sendResponse(res, 200, "Lấy danh sách khách sạn thành công", hotels, {
      meta: { total },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/customer/hotels/office/info
export const getOfficeInfo = (_req: Request, res: Response): void => {
  sendResponse(
    res,
    200,
    "Lấy thông tin văn phòng thành công",
    hotelService.getOfficeInfo(),
  );
};

// GET /api/customer/hotels/locations
export const getHotelLocations = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const locations = await hotelService.findHotelLocations();
    sendResponse(res, 200, "Lấy danh sách vị trí thành công", locations);
  } catch (error) {
    next(error);
  }
};

export const getViewedHotels = async (
  req: CustomerAuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const hotels = await hotelService.findViewedHotels(req.user!.id);
    sendResponse(res, 200, "Lấy danh sách khách sạn đã xem thành công", hotels);
  } catch (error) {
    next(error);
  }
};

export const addViewedHotel = async (
  req: CustomerAuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await hotelService.saveViewedHotel(req.user!.id, req.params.id as string);
    sendResponse(res, 200, "Lưu khách sạn đã xem thành công", { ok: true });
  } catch (error) {
    next(error);
  }
};

// GET /api/customer/hotels/:id
export const getHotelById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const hotel = await hotelService.findHotelById(req.params.id as string);
    sendResponse(res, 200, "Lấy chi tiết khách sạn thành công", hotel);
  } catch (error) {
    next(error);
  }
};

// GET /api/customer/hotels/:id/rooms
export const getHotelRooms = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const rooms = await roomService.findRoomsByHotelId(
      req.params.id as string,
      req.query as RoomQueryParams,
    );
    sendResponse(res, 200, "Lấy danh sách phòng thành công", rooms);
  } catch (error) {
    next(error);
  }
};

// GET /api/customer/hotels/:id/availability
export const getHotelAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const slots = await availabilityService.findAvailabilityByHotelId(
      req.params.id as string,
      req.query as AvailabilityQueryParams,
    );
    sendResponse(res, 200, "Lấy thông tin sẵn có thành công", slots);
  } catch (error) {
    next(error);
  }
};
