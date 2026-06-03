import { AddressBase, UserBase, Amenity, BaseMedia } from './common.type';

export interface HotelAddress extends AddressBase {
    id?: string;
    addressLine: string;
    ward: string;
    province: string;
    country: string;
    latitude?: number;
    longitude?: number;
}

export interface HotelImage extends BaseMedia {
    imageUrl: string;
}

export interface HotelVideo extends BaseMedia {
    videoUrl: string;
    title?: string;
}

export type HotelStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended';

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
    cancellationHours: number;
    depositPercent?: number;
    hotelStatus: HotelStatus;
    avgRating: number;
    totalReviews: number;
    totalRooms: number;
    address?: HotelAddress;
    images: HotelImage[];
    videos?: HotelVideo[];
    hotelAmenities: { amenity: Amenity }[];
    owner?: UserBase;
    createAt: string;
    updateAt: string;
}

export type HotelListItem = Pick<Hotel, 'id' | 'name' |'slug' | 'hotelStatus' | 'avgRating' | 'totalReviews' | 'totalRooms' | 'images' | 'hotelAmenities' |'createAt' > & {
    address?: AddressBase;
};

export interface CreateHotelInput extends Omit<Hotel, 'id' | 'slug' |'hotelStatus' | 'avgRating' | 'totalReviews' | 'totalRooms' | 'address' | 'images' | 'videos' | 'hotelAmenities' | 'owner' | 'createAt' | 'updateAt'> {
    address: Omit<HotelAddress, 'id' | 'fullAddress'>;
    amenityIds?: string[];
}

export type UpdateHotelInput = Partial<CreateHotelInput> & { status?: HotelStatus };

export interface HotelQueryParams {
    page?: number; limit?: number; status?: string; keyword?: string;
    sort?: string; order?: 'asc' | 'desc';
}