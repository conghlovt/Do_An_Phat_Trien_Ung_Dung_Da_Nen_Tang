// ============================================================
// Room Types — Partner Module
// ============================================================

import type { Amenity } from './hotel.types';

export interface RoomMedia {
  id: string;
  imageUrl: string;
  mediaType: 'image' | 'video';
  isCover: boolean;
  sortOrder: number;
}

export interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  slug: string;
  description?: string;
  maxGuests: number;
  bedType?: string;
  roomSizeSqm?: number;
  totalUnits: number;
  status: string;
  sortOrder: number;
  roomTypeAmenities: { amenity: Amenity }[];
  media: RoomMedia[];
  pricingPolicies?: any[];
  _count?: { roomUnits: number };
  roomUnits?: RoomUnit[];
}

export interface RoomUnit {
  id: string;
  roomTypeId: string;
  roomNumber: string;
  floor?: number;
  status: string;
  notes?: string;
}

export interface CreateRoomTypeInput {
  name: string;
  description?: string;
  maxGuests: number;
  bedType?: string;
  roomSizeSqm?: number;
  totalUnits: number;
  amenityIds?: string[];
}

export type UpdateRoomTypeInput = Partial<CreateRoomTypeInput> & { status?: string };

export interface CreateRoomUnitInput {
  roomNumber: string;
  floor?: number;
  notes?: string;
}

export interface UpdateRoomUnitInput {
  roomNumber?: string;
  floor?: number;
  status?: string;
  notes?: string;
}
