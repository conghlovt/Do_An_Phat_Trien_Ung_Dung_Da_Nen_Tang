import apiInstance from '../../login/shared/api/api.instance';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
  id: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: BookingStatus;
  user: { username: string; phone: string | null };
  room: { name: string };
}

export interface HotelAddress {
  id?: string;
  addressLine: string;
  ward?: string;
  district: string;
  city: string;
  province?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  fullAddress?: string;
}

export interface HotelImage { id: string; imageUrl: string; isCover: boolean; sortOrder: number; }
export interface HotelVideo { id: string; videoUrl: string; title?: string; sortOrder: number; }
export interface Amenity { id: string; name: string; slug: string; icon?: string; category: string; }
export interface HotelAmenity { amenity: Amenity; }

export interface Hotel {
  id: string; name: string; slug: string; description?: string;
  propertyType: string; starRating?: number; checkInTime: string; checkOutTime: string;
  minBookingHours?: number; cancellationPolicy?: string; cancellationHours?: number;
  depositPercent?: number; status: 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended';
  avgRating: number; totalReviews: number; totalRooms: number;
  address?: HotelAddress; images: HotelImage[]; videos?: HotelVideo[];
  hotelAmenities: HotelAmenity[];
  owner?: { id: string; username: string; email: string; avatar?: string };
  createdAt: string; updatedAt: string;
}

export interface HotelListItem {
  id: string; name: string; slug: string; status: string;
  avgRating: number; totalRooms: number;
  address?: { city: string; district: string; fullAddress: string };
  images: HotelImage[]; hotelAmenities: HotelAmenity[]; createdAt: string;
}

export interface CreateHotelInput {
  name: string; description?: string; propertyType: string; starRating?: number;
  checkInTime: string; checkOutTime: string; minBookingHours?: number;
  cancellationPolicy?: string; cancellationHours?: number; depositPercent?: number;
  address: Omit<HotelAddress, 'id' | 'fullAddress'>; amenityIds?: string[];
}
export type UpdateHotelInput = Partial<CreateHotelInput> & { status?: string };
export interface HotelQueryParams {
  page?: number; limit?: number; status?: string; keyword?: string;
  sort?: string; order?: 'asc' | 'desc';
}

export interface RoomMedia {
  id: string; imageUrl: string; mediaType: 'image' | 'video'; isCover: boolean; sortOrder: number;
}
export interface RoomType {
  id: string; hotelId: string; name: string; slug: string; description?: string;
  maxGuests: number; bedType?: string; roomSizeSqm?: number; totalUnits: number;
  status: string; sortOrder: number; roomTypeAmenities: { amenity: Amenity }[];
  media: RoomMedia[]; pricingPolicies?: any[]; _count?: { roomUnits: number };
  roomUnits?: RoomUnit[];
}
export interface RoomUnit {
  id: string; roomTypeId: string; roomNumber: string; floor?: number; status: string; notes?: string;
}
export interface PricingPolicyInput {
  bookingType: 'hourly' | 'overnight' | 'daily';
  basePrice: number;
  minHours?: number;
  maxHours?: number;
  extraHourPrice?: number;
  overnightCheckinFrom?: string;
  overnightCheckoutBefore?: string;
}

export interface CreateRoomTypeInput {
  name: string; description?: string; maxGuests: number; bedType?: string;
  roomSizeSqm?: number; totalUnits: number; amenityIds?: string[];
  pricingPolicies?: PricingPolicyInput[];
}
export type UpdateRoomTypeInput = Partial<CreateRoomTypeInput> & { status?: string };
export interface CreateRoomUnitInput { roomNumber: string; floor?: number; notes?: string; }
export interface UpdateRoomUnitInput { roomNumber?: string; floor?: number; status?: string; notes?: string; }

export interface InventoryItem {
  totalRooms: number; bookedRooms: number; availableRooms: number; isClosed: boolean;
}
export interface CalendarRoomType {
  id: string; name: string; totalUnits: number; status: string;
  inventory: Record<string, InventoryItem>; pricing: Record<string, number>;
}

export type VoucherStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
export type VoucherDiscountType = 'percent' | 'fixed';

export interface VoucherRoomType {
  id?: string;
  name?: string;
}

export interface Voucher {
  id: string;
  hotelId: string;
  code: string;
  name: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: VoucherStatus;
  applicableRoomTypeIds: string[];
  roomTypes?: VoucherRoomType[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVoucherInput {
  code: string;
  name: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startDate: string;
  endDate: string;
  applicableRoomTypeIds: string[];
}

export type UpdateVoucherInput = Partial<CreateVoucherInput>;


// ─── API Calls ────────────────────────────────────────────────────────────────

const HOTEL_BASE = '/v1/partner/hotels';

export const partnerService = {
  // ── Hotels ────────────────────────────────────────────────────
  getHotels: async (params?: HotelQueryParams) => {
    const res: any = await apiInstance.get(HOTEL_BASE, { params });

    console.log('RAW getHotels response:', res);

    const payload =
      res?.data?.data ||
      res?.data ||
      res;

    const items =
      payload?.items ||
      payload?.data?.items ||
      [];

    return {
      items: Array.isArray(items) ? items : [],
    } as { items: HotelListItem[] };
  },


  getHotel: async (id: string) => {
    const res = await apiInstance.get(`${HOTEL_BASE}/${id}`);
    return res.data.data.hotel as Hotel;
  },
  createHotel: async (data: CreateHotelInput) => {
    const res = await apiInstance.post(HOTEL_BASE, data);
    return res.data.data.hotel as Hotel;
  },
  updateHotel: async (id: string, data: UpdateHotelInput) => {
    const res = await apiInstance.put(`${HOTEL_BASE}/${id}`, data);
    return res.data.data.hotel as Hotel;
  },
  deleteHotel: async (id: string) => {
    await apiInstance.delete(`${HOTEL_BASE}/${id}`);
  },
  submitHotelForReview: async (id: string) => {
    const res = await apiInstance.post(`${HOTEL_BASE}/${id}/submit`);
    return res.data.data.hotel as Hotel;
  },
  uploadHotelImages: async (id: string, files: any[]) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    const res = await apiInstance.post(`${HOTEL_BASE}/${id}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.images as any[];
  },
  deleteHotelImage: async (hotelId: string, imageId: string) => {
    await apiInstance.delete(`${HOTEL_BASE}/${hotelId}/images/${imageId}`);
  },
  uploadHotelVideo: async (id: string, file: any, title?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (title) form.append('title', title);
    const res = await apiInstance.post(`${HOTEL_BASE}/${id}/videos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.video;
  },
  deleteHotelVideo: async (hotelId: string, videoId: string) => {
    await apiInstance.delete(`${HOTEL_BASE}/${hotelId}/videos/${videoId}`);
  },

  // ── Rooms ──────────────────────────────────────────────────────
  getRoomTypes: async (hotelId: string) => {
    const res = await apiInstance.get(`${HOTEL_BASE}/${hotelId}/room-types`);
    return res.data.data.items as RoomType[];
  },
  getRoomType: async (hotelId: string, roomTypeId: string) => {
    const res = await apiInstance.get(`${HOTEL_BASE}/${hotelId}/room-types/${roomTypeId}`);
    return res.data.data.roomType as RoomType;
  },
  createRoomType: async (hotelId: string, data: CreateRoomTypeInput) => {
    const res = await apiInstance.post(`${HOTEL_BASE}/${hotelId}/room-types`, data);
    return res.data.data.roomType as RoomType;
  },
  updateRoomType: async (hotelId: string, roomTypeId: string, data: UpdateRoomTypeInput) => {
    const res = await apiInstance.put(`${HOTEL_BASE}/${hotelId}/room-types/${roomTypeId}`, data);
    return res.data.data.roomType as RoomType;
  },
  deleteRoomType: async (hotelId: string, roomTypeId: string) => {
    await apiInstance.delete(`${HOTEL_BASE}/${hotelId}/room-types/${roomTypeId}`);
  },
  getRoomUnits: async (hotelId: string, roomTypeId: string) => {
    const res = await apiInstance.get(`${HOTEL_BASE}/${hotelId}/room-types/${roomTypeId}/units`);
    return res.data.data.items as RoomUnit[];
  },
  createRoomUnit: async (hotelId: string, roomTypeId: string, data: CreateRoomUnitInput) => {
    const res = await apiInstance.post(`${HOTEL_BASE}/${hotelId}/room-types/${roomTypeId}/units`, data);
    return res.data.data.roomUnit as RoomUnit;
  },
  deleteRoomUnit: async (hotelId: string, roomTypeId: string, unitId: string) => {
    await apiInstance.delete(`${HOTEL_BASE}/${hotelId}/room-types/${roomTypeId}/units/${unitId}`);
  },
  uploadRoomMedia: async (hotelId: string, roomTypeId: string, files: any[]) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    const res = await apiInstance.post(
      `${HOTEL_BASE}/${hotelId}/room-types/${roomTypeId}/media`, form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data.data.media as any[];
  },
  deleteRoomMedia: async (hotelId: string, roomTypeId: string, mediaId: string) => {
    await apiInstance.delete(`${HOTEL_BASE}/${hotelId}/room-types/${roomTypeId}/media/${mediaId}`);
  },

  // ── Bookings ───────────────────────────────────────────────────
  getBookings: async (status?: string) => {
    const res = await apiInstance.get('/v1/partner/bookings', {
      params: status ? { status } : undefined,
    });
    return res.data.data.bookings as Booking[];
  },
  updateBookingStatus: async (id: string, status: BookingStatus) => {
    const res = await apiInstance.patch(`/v1/partner/bookings/${id}/status`, { status });
    return res.data.data.booking as Booking;
  },

  // ── Amenities ──────────────────────────────────────────────────
  getAmenities: async () => {
    const res = await apiInstance.get('/v1/amenities');
    return res.data.data as Amenity[];
  },

  // ── Inventory ──────────────────────────────────────────────────
  getInventoryCalendar: async (hotelId: string, startDate: string, endDate: string) => {
    const res = await apiInstance.get(`${HOTEL_BASE}/${hotelId}/inventory`, {
      params: { startDate, endDate },
    });
    return res.data.data as CalendarRoomType[];
  },
  updateInventory: async (
    hotelId: string, roomTypeId: string, date: string,
    data: { totalRooms?: number; isClosed?: boolean }
  ) => {
    const res = await apiInstance.put(`${HOTEL_BASE}/${hotelId}/inventory/${roomTypeId}`, { date, ...data });
    return res.data.data;
  },


// ── Vouchers ──────────────────────────────────────────────────

  getVouchers: async (hotelId: string) => {
    const res: any = await apiInstance.get(`${HOTEL_BASE}/${hotelId}/vouchers`);

    console.log('RAW getVouchers response:', res);

    const payload =
      res?.data?.data ||
      res?.data ||
      res;

    const items =
      payload?.items ||
      payload?.data?.items ||
      [];

    return Array.isArray(items) ? items : [];
  },


  getVoucher: async (hotelId: string, voucherId: string) => {
    const res: any = await apiInstance.get(
      `${HOTEL_BASE}/${hotelId}/vouchers/${voucherId}`
    );

    const payload =
      res?.data?.data ||
      res?.data ||
      res;

    return payload?.voucher as Voucher;
  },

  createVoucher: async (hotelId: string, data: CreateVoucherInput) => {
    const res: any = await apiInstance.post(
      `${HOTEL_BASE}/${hotelId}/vouchers`,
      data
    );

    const payload =
      res?.data?.data ||
      res?.data ||
      res;

    return payload?.voucher as Voucher;
  },

  updateVoucher: async (
    hotelId: string,
    voucherId: string,
    data: UpdateVoucherInput
  ) => {
    const res: any = await apiInstance.put(
      `${HOTEL_BASE}/${hotelId}/vouchers/${voucherId}`,
      data
    );

    const payload =
      res?.data?.data ||
      res?.data ||
      res;

    return payload?.voucher as Voucher;
  },

  deleteVoucher: async (hotelId: string, voucherId: string) => {
    await apiInstance.delete(`${HOTEL_BASE}/${hotelId}/vouchers/${voucherId}`);
  },




};
