import apiInstance from "./api.instance";
import { ApiResponse } from '../types/api.type'
import { Booking, BookingStatus } from '../types/booking.type'

export const bookingService = {
    getBookings: async (status?: string): Promise<Booking[]> => {
        const response = await apiInstance.get<any, ApiResponse<{ bookings: Booking[]}>>('/partner/bookings', {
            params: status ? { status }: undefined,
        });
        return response.data.bookings
    },
    updateBookingStatus: async ( id: string, status: BookingStatus): Promise<Booking> => {
        const response = await apiInstance.patch<any, ApiResponse<{ booking: Booking}>>(`/partner/bookings/${id}/status`, { status })
        return response.data.booking;
    }
}