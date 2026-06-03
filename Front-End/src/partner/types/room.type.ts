import { OVERNIGHT_TIME_OPTIONS } from './../../customer/constants/booking/bookingDate.constants';
import { Amenity, BaseMedia } from './common.type';

export interface RoomMedia extends BaseMedia {
    imageUrl: string;
    mediaType: 'image' | 'video';
}

export interface RoomUnit {
    id: string;
    roomTypeId: string;
    roomNumber: string;
    floor?: number;
    status: string;
    notes?: string;
}

export interface RoomType {
    id: string; hotelId: string;
    name: string; slug: string;
    description?: string; maxGuests: number;
    bedType?: string; roomSizeSqm?: number;
    totalUnits: number; status: string;
    sortOrder: number; roomTypeAmenities: {amenity: Amenity}[];
    media: RoomMedia[]; pricingPolicies?: Record<string, unknown>[];
    _count?: {
        roomUnits: number;
    };
    roomUnit?: RoomUnit[];
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

export interface CreateRoomTypeInput extends Pick<RoomType, 'name' |'description' | 'maxGuests' | 'bedType' | 'roomSizeSqm' | 'totalUnits'> {
    amenityId?: string[];
    pricingPolicies: PricingPolicyInput[];
}

export type UpdateRoomTypeInput = Partial<CreateRoomTypeInput> & { status?: string };

export type CreateRoomUnitInput = Pick<RoomUnit, 'roomNumber' | 'floor' | 'notes'>;

export type UpdateRoomUnitInput = Partial<CreateRoomUnitInput> & { status?: string };

export interface InventoryItem {
    totalRooms: number;
    bookedRooms: number;
    availableRooms: number;
    isClosed: boolean;
}

export interface CalendarRoomType {
    id: string;
    name: string;
    totalUnits: number;
    status: string;
    inventory: Record<string, InventoryItem>;
    pricing: Record<string, number>;
}