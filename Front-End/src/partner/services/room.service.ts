import apiInstance from "./api.instance";
import { ApiResponse } from "../types/api.type";
import { RoomType, RoomUnit, CreateRoomTypeInput, UpdateRoomTypeInput, CreateRoomUnitInput, UpdateRoomUnitInput, RoomMedia, CalendarRoomType } from "../types/room.type";

const HOTEL_BASE = '/partner/hotels'

export const roomService = {
    getRoomTypes: async (hotelId: string): Promise<RoomType[]> => {
        const response = await apiInstance.get<any, ApiResponse<{ items: RoomType[]}>>(`${HOTEL_BASE}/${hotelId}/room-types`)
        return response.data.items
    },
    getRoomType: async (hotelId: string, roomTypeId: string): Promise<RoomType> => {
    const response = await apiInstance.get<any, ApiResponse<{ roomType: RoomType }>>(`${HOTEL_BASE}/${hotelId}/room-types/${roomTypeId}`);
    return response.data.roomType;
    },
    createRoomType: async (hotelId: string, data: CreateRoomTypeInput): Promise<RoomType> => {
        const response = await apiInstance.post<any, ApiResponse<{ roomType: RoomType}>>(`${HOTEL_BASE}/${hotelId}/room-type`, data)
        return response.data.roomType;
    },
    updateRoomType: async ( hotelId: string, roomTypeId: string, data: UpdateRoomTypeInput): Promise<RoomType> => {
        const response = await apiInstance.put<any, ApiResponse<{ roomType: RoomType }>>(`${HOTEL_BASE}/${hotelId}/room-type/${roomTypeId}`, data);
        return response.data.roomType;
    },
    deleteRoomType: async ( hotelId: string, roomTypeId: string): Promise<void> => {
        await apiInstance.delete(`${HOTEL_BASE}/${hotelId}/room-type/${roomTypeId}`)
    },
    getRoomUnit: async (hotelId: string, roomTypeId: string): Promise<RoomUnit[]> => {
        const response = await apiInstance.get<any, ApiResponse<{ items: RoomUnit[]}>>(`${HOTEL_BASE}/${hotelId}/room-type/${roomTypeId}/units`);
        return response.data.items;
    },
    createRoomUnit: async ( hotelId: string, roomTypeId: string, data: CreateRoomUnitInput): Promise<RoomUnit> => {
        const response = await apiInstance.post<any, ApiResponse<{ roomUnit: RoomUnit}>>(`${HOTEL_BASE}/${hotelId}/room-type/${roomTypeId}/units`, data);
        return response.data.roomUnit
    },
    deleteRoomUnit: async ( hotelId: string, roomTypeId: string, unitId: string): Promise<void> => {
        await apiInstance.delete(`${HOTEL_BASE}/${hotelId}/room-type/${roomTypeId}/units/${unitId}`);
    },
    uploadRoomMedia: async ( hotelId: string, roomTypeId: string, files: File[]): Promise<RoomMedia[]> => {
        const form = new FormData();
        files.forEach((f) => form.append('file', f))
        const response = await apiInstance.post<any, ApiResponse<{ media: RoomMedia[]}>>(`${HOTEL_BASE}/${hotelId}/room-types/${roomTypeId}/media`, form);
        return response.data.media
    },
    deleteRoomMedia: async ( hotelId: string, roomTypeId: string, mediaId: string): Promise<void> => {
        await apiInstance.delete(`${HOTEL_BASE}/${hotelId}/room-types/${roomTypeId}/media/${mediaId}`);
    },
    getInventoryCalendar: async ( hotelId: string, startDate: string, endDate: string): Promise<CalendarRoomType[]> => {
        const response = await apiInstance.get<any, ApiResponse<CalendarRoomType[]>>(`${HOTEL_BASE}/${hotelId}/inventory`, { params: {startDate, endDate }});
        return response.data
    },
    updateInventory: async ( hotelId: string, roomTypeId: string, date: string, data: { totalRooms?: number; isClosed?: boolean}) => {
        const response = await apiInstance.put<any, any>(`${HOTEL_BASE}/${hotelId}/inventory/${roomTypeId}`)
        return response.data;
    }
}