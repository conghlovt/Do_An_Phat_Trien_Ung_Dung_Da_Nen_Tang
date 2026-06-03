import apiInstance from './api.instance';
import { ApiResponse, PaginatedData } from '../types/api.type';
import { Hotel, HotelListItem, CreateHotelInput, UpdateHotelInput, HotelQueryParams, HotelImage, HotelVideo } from '../types/hotel.type';
import { Amenity } from '../types/common.type';

const HOTEL_BASE = '/partner/hotels';

export const hotelService = {
    getHotels: async (params?: HotelQueryParams): Promise<PaginatedData<HotelListItem>> =>{
        const response = await apiInstance.get<any, ApiResponse<PaginatedData<HotelListItem>>>(HOTEL_BASE, { params })
        return response.data || { items: []};
    },
    getHotel: async (id: string): Promise<Hotel> => {
        const response = await apiInstance.get<any, ApiResponse<{ hotel: Hotel }>>(`${HOTEL_BASE}/${id}`)
        return response.data.hotel
    },
    createHotel: async (data: CreateHotelInput): Promise<Hotel> => {
        const response = await apiInstance.post<any, ApiResponse<{hotel: Hotel}>>(`${HOTEL_BASE}`, data)
        return response.data.hotel
    },
    updateHotel: async (id: string, data: UpdateHotelInput): Promise<Hotel> => {
        const response = await apiInstance.put<any, ApiResponse<{ hotel: Hotel}>>(`${HOTEL_BASE}/${id}`, data)
        return response.data.hotel;
    },
    deleteHotel: async (id: string): Promise<void> => {
        await apiInstance.delete(`${HOTEL_BASE}/${id}`)
    },
    submitHotelForReview: async (id: string): Promise<Hotel> => {
        const response = await apiInstance.post<any, ApiResponse<{ hotel: Hotel }>>(`${HOTEL_BASE}/${id}/submit`);
        return response.data.hotel
    },
    uploadHotelImages: async (id: string, files: File[]): Promise<HotelImage[]> => {
        const form = new FormData();
        files.forEach((f) => form.append('files', f));
        const response = await apiInstance.post<any, ApiResponse<{ images: HotelImage[]}>>(`${HOTEL_BASE}/${id}/images`, form)
        return response.data.images
    },
    deleteHotelImage: async (hotelId: string, imageId: string): Promise<void> => {
        await apiInstance.delete(`${HOTEL_BASE}/${hotelId}/images/${imageId}`);
    },
    uploadHotelVideo: async (id: string, file: File, title?: string): Promise<HotelVideo> => {
        const form = new FormData();
        form.append('file', file);
        if ( title ) form.append('title', title);
        const response = await apiInstance.post<any, ApiResponse<{ video: HotelVideo }>>(`${HOTEL_BASE}/${id}/videos`, form);
        return response.data.video
    },
    deleteHotelVideo: async (hotelId: string, videoId: string): Promise<void> => {
        await apiInstance.delete(`${HOTEL_BASE}/${hotelId}/videos/${videoId}`)
    },
    getAmenities: async (): Promise<Amenity[]> => {
        const response = await apiInstance.get<any, ApiResponse<Amenity[]>>('/amenities');
        return response.data
    }
}