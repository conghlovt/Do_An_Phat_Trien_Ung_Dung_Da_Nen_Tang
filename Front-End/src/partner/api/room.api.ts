import apiInstance from '../core/api/api.instance';
import type { ApiResponse } from '../core/types/api.types';
import type { RoomType, RoomUnit, CreateRoomTypeInput, UpdateRoomTypeInput, CreateRoomUnitInput, UpdateRoomUnitInput } from '../types/room.types';

const base = (hotelId: string) => `/partner/hotels/${hotelId}/room-types`;

export const roomApi = {
  listRoomTypes: async (hotelId: string) => {
    const res = await apiInstance.get<ApiResponse<{ items: RoomType[] }>>(base(hotelId));
    return res.data.data.items;
  },

  getRoomType: async (hotelId: string, roomTypeId: string) => {
    const res = await apiInstance.get<ApiResponse<{ roomType: RoomType }>>(`${base(hotelId)}/${roomTypeId}`);
    return res.data.data.roomType;
  },

  createRoomType: async (hotelId: string, data: CreateRoomTypeInput) => {
    const res = await apiInstance.post<ApiResponse<{ roomType: RoomType }>>(base(hotelId), data);
    return res.data.data.roomType;
  },

  updateRoomType: async (hotelId: string, roomTypeId: string, data: UpdateRoomTypeInput) => {
    const res = await apiInstance.put<ApiResponse<{ roomType: RoomType }>>(`${base(hotelId)}/${roomTypeId}`, data);
    return res.data.data.roomType;
  },

  deleteRoomType: async (hotelId: string, roomTypeId: string) => {
    await apiInstance.delete(`${base(hotelId)}/${roomTypeId}`);
  },

  // Room Units
  listUnits: async (hotelId: string, roomTypeId: string) => {
    const res = await apiInstance.get<ApiResponse<{ items: RoomUnit[] }>>(`${base(hotelId)}/${roomTypeId}/units`);
    return res.data.data.items;
  },

  createUnit: async (hotelId: string, roomTypeId: string, data: CreateRoomUnitInput) => {
    const res = await apiInstance.post<ApiResponse<{ roomUnit: RoomUnit }>>(`${base(hotelId)}/${roomTypeId}/units`, data);
    return res.data.data.roomUnit;
  },

  updateUnit: async (hotelId: string, roomTypeId: string, unitId: string, data: UpdateRoomUnitInput) => {
    const res = await apiInstance.put<ApiResponse<{ roomUnit: RoomUnit }>>(`${base(hotelId)}/${roomTypeId}/units/${unitId}`, data);
    return res.data.data.roomUnit;
  },

  deleteUnit: async (hotelId: string, roomTypeId: string, unitId: string) => {
    await apiInstance.delete(`${base(hotelId)}/${roomTypeId}/units/${unitId}`);
  },

  // Media upload
  uploadMedia: async (hotelId: string, roomTypeId: string, files: any[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const res = await apiInstance.post<ApiResponse<{ media: any[] }>>(`${base(hotelId)}/${roomTypeId}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.media;
  },

  deleteMedia: async (hotelId: string, roomTypeId: string, mediaId: string) => {
    await apiInstance.delete(`${base(hotelId)}/${roomTypeId}/media/${mediaId}`);
  },
};
