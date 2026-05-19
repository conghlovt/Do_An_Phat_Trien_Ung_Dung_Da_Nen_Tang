import type { Request, Response, NextFunction } from 'express';
import * as hotelService from '../services/hotels.service';
import * as roomService from '../services/room.service';
import * as availabilityService from '../services/availability.service';
import type { HotelQueryParams } from '../models/hotel.model';
import type { AvailabilityQueryParams } from '../models/room.model';

// GET /api/customer/hotels
export const getHotels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { hotels, total } = await hotelService.findHotels(req.query as HotelQueryParams);
    res.json({ data: hotels, total });
  } catch (error) {
    next(error);
  }
};

// GET /api/customer/hotels/office/info
export const getOfficeInfo = (_req: Request, res: Response): void => {
  res.json({ data: hotelService.getOfficeInfo() });
};

// GET /api/customer/hotels/locations
export const getHotelLocations = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const locations = await hotelService.findHotelLocations();
    res.json({ data: locations });
  } catch (error) {
    next(error);
  }
};

// GET /api/customer/hotels/:id
export const getHotelById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hotel = await hotelService.findHotelById(req.params.id as string);
    res.json({ data: hotel });
  } catch (error) {
    next(error);
  }
};

// GET /api/customer/hotels/:id/rooms
export const getHotelRooms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rooms = await roomService.findRoomsByHotelId(req.params.id as string);
    res.json({ data: rooms });
  } catch (error) {
    next(error);
  }
};

// GET /api/customer/hotels/:id/availability
export const getHotelAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const slots = await availabilityService.findAvailabilityByHotelId(
      req.params.id as string,
      req.query as AvailabilityQueryParams
    );
    res.json({ data: slots });
  } catch (error) {
    next(error);
  }
};
