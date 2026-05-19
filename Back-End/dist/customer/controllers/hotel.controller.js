import * as hotelService from '../services/hotels.service';
import * as roomService from '../services/room.service';
import * as availabilityService from '../services/availability.service';
// GET /api/customer/hotels
export const getHotels = async (req, res, next) => {
    try {
        const { hotels, total } = await hotelService.findHotels(req.query);
        res.json({ data: hotels, total });
    }
    catch (error) {
        next(error);
    }
};
// GET /api/customer/hotels/office/info
export const getOfficeInfo = (_req, res) => {
    res.json({ data: hotelService.getOfficeInfo() });
};
// GET /api/customer/hotels/locations
export const getHotelLocations = async (_req, res, next) => {
    try {
        const locations = await hotelService.findHotelLocations();
        res.json({ data: locations });
    }
    catch (error) {
        next(error);
    }
};
// GET /api/customer/hotels/:id
export const getHotelById = async (req, res, next) => {
    try {
        const hotel = await hotelService.findHotelById(req.params.id);
        res.json({ data: hotel });
    }
    catch (error) {
        next(error);
    }
};
// GET /api/customer/hotels/:id/rooms
export const getHotelRooms = async (req, res, next) => {
    try {
        const rooms = await roomService.findRoomsByHotelId(req.params.id);
        res.json({ data: rooms });
    }
    catch (error) {
        next(error);
    }
};
// GET /api/customer/hotels/:id/availability
export const getHotelAvailability = async (req, res, next) => {
    try {
        const slots = await availabilityService.findAvailabilityByHotelId(req.params.id, req.query);
        res.json({ data: slots });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=hotel.controller.js.map