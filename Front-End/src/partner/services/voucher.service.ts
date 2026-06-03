import apiInstance from './api.instance';
import { ApiResponse } from '../types/api.type'
import { Voucher, CreateVoucherInput, UpdateVoucherInput } from '../types/booking.type'

const HOTEL_BASE = '/partner/hotels';

export const partnerVoucherService = {
  getVouchers: async ( hotelId: string): Promise<Voucher[]> => {
    const response = await apiInstance.get<any, ApiResponse<{ items: Voucher[]}>>(`${HOTEL_BASE}/${hotelId}/vouchers`);
    return response.data.items || [];
  },
  getVoucherById: async ( hotelId: string, voucherId: string): Promise<Voucher> => {
    const response = await apiInstance.get<any, ApiResponse<{ voucher: Voucher}>>(`${HOTEL_BASE}/${hotelId}/vouchers/${voucherId}`);
    return response.data.voucher
  },
  createVoucher: async ( hotelId: string, data: CreateVoucherInput): Promise<Voucher> => {
    const response = await apiInstance.post<any, ApiResponse<{ voucher: Voucher}>>(`${HOTEL_BASE}/${hotelId}/vouchers`, data);
    return response.data.voucher;
  },
  updateVoucher: async ( hotelId: string, voucherId: string, data: UpdateVoucherInput): Promise<Voucher> => {
    const response = await apiInstance.put<any, ApiResponse<{ voucher: Voucher}>>(`${HOTEL_BASE}/${hotelId}/vouchers/${voucherId}`, data);
    return response.data.voucher;
  },
  deleteVoucher: async ( hotelId: string, voucherId: string): Promise<void> => {
    await apiInstance.delete(`${HOTEL_BASE}/${hotelId}/vouchers/${voucherId}`)
  },
  applyVoucher: async ( hotelId: string, data: Record<string, unknown>): Promise<any> => {
    const response = await apiInstance.post<any, ApiResponse<any>>(`${HOTEL_BASE}/${hotelId}/vouchers/apply`, data)
    return response.data;
  }
}