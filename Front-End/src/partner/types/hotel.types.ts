// ============================================================
// Hotel Types — Partner Module
// ============================================================

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

export interface HotelImage {
  id: string;
  imageUrl: string;
  isCover: boolean;
  sortOrder: number;
}

export interface HotelVideo {
  id: string;
  videoUrl: string;
  title?: string;
  sortOrder: number;
}

export interface Amenity {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  category: string;
}

export interface HotelAmenity {
  amenity: Amenity;
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  description?: string;
  propertyType: string;
  starRating?: number;
  checkInTime: string;
  checkOutTime: string;
  minBookingHours?: number;
  cancellationPolicy?: string;
  cancellationHours?: number;
  depositPercent?: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended';
  avgRating: number;
  totalReviews: number;
  totalRooms: number;
  address?: HotelAddress;
  images: HotelImage[];
  videos?: HotelVideo[];
  hotelAmenities: HotelAmenity[];
  owner?: { id: string; username: string; email: string; avatar?: string };
  createdAt: string;
  updatedAt: string;
}

export interface HotelListItem {
  id: string;
  name: string;
  slug: string;
  status: string;
  avgRating: number;
  totalRooms: number;
  address?: { city: string; district: string; fullAddress: string };
  images: HotelImage[];
  hotelAmenities: HotelAmenity[];
  createdAt: string;
}

export interface CreateHotelInput {
  name: string;
  description?: string;
  propertyType: string;
  starRating?: number;
  checkInTime: string;
  checkOutTime: string;
  minBookingHours?: number;
  cancellationPolicy?: string;
  cancellationHours?: number;
  depositPercent?: number;
  address: Omit<HotelAddress, 'id' | 'fullAddress'>;
  amenityIds?: string[];
}

export type UpdateHotelInput = Partial<CreateHotelInput>;

export interface HotelQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  keyword?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}
