import apiInstance from '../core/api/api.instance';
import type { ApiResponse } from '../core/types/api.types';
import type { Hotel, HotelListItem, CreateHotelInput, UpdateHotelInput, HotelQueryParams } from '../types/hotel.types';

const BASE = '/partner/hotels';

export const hotelApi = {
  list: async (params?: HotelQueryParams) => {
    const res = await apiInstance.get<ApiResponse<{ items: HotelListItem[] }>>(BASE, { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiInstance.get<ApiResponse<{ hotel: Hotel }>>(`${BASE}/${id}`);
    return res.data.data.hotel;
  },

  create: async (data: CreateHotelInput) => {
    const res = await apiInstance.post<ApiResponse<{ hotel: Hotel }>>(BASE, data);
    return res.data.data.hotel;
  },

  update: async (id: string, data: UpdateHotelInput) => {
    const res = await apiInstance.put<ApiResponse<{ hotel: Hotel }>>(`${BASE}/${id}`, data);
    return res.data.data.hotel;
  },

  delete: async (id: string) => {
    await apiInstance.delete(`${BASE}/${id}`);
  },

  submitForReview: async (id: string) => {
    const res = await apiInstance.post<ApiResponse<{ hotel: Hotel }>>(`${BASE}/${id}/submit`);
    return res.data.data.hotel;
  },

  // Image upload — FormData
  uploadImages: async (id: string, files: any[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const res = await apiInstance.post<ApiResponse<{ images: any[] }>>(`${BASE}/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.images;
  },

  deleteImage: async (hotelId: string, imageId: string) => {
    await apiInstance.delete(`${BASE}/${hotelId}/images/${imageId}`);
  },

  uploadVideo: async (id: string, file: any, title?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    const res = await apiInstance.post<ApiResponse<{ video: any }>>(`${BASE}/${id}/videos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.video;
  },

  deleteVideo: async (hotelId: string, videoId: string) => {
    await apiInstance.delete(`${BASE}/${hotelId}/videos/${videoId}`);
  },
};
