import { UserBase } from "./common.type";
import { RoomType } from "./room.type";

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'PAYMENT_PENDING' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
    id: string;
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    status: BookingStatus;
    user: Pick<UserBase, 'username'| 'phone'>;
    room: Pick<RoomType, 'name'>;
    property?: { id: string; name: string }; 
}

export type VoucherStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

export type VoucherDiscountType = 'percent' | 'fixed';

export interface Voucher {
    id: string; hotelId: string; code: string; name: string;
    status: VoucherStatus; rules?: Record<string, unknown>[];
    actions?: Record<string, unknown>[];
    constraints?: {
        usageLimit?: number; usedCount?: number; perUser?: number;
        startDate?: string; endDate?: string; [key: string]: unknown;
    }
    discountType: VoucherDiscountType; discountValue: number;
    minOrderValue?: number | null; maxDiscount?: number | null;
    usageLimit?: number | null; usedCount: number;
    startDate?: string | null; endDate?: string | null;
    applicableRoomTypeIds?: string[];
    roomType?: Pick<RoomType, 'id' | 'name'>[];
    createdAt?: string; updatedAt?: string;
}

export interface CreateVoucherInput extends Pick<Voucher, 'code' | 'name' | 'status'> {
    rules?: Record<string, unknown>[];
    actions?: Record<string, unknown>[];
    constraints?: NonNullable<Voucher['constraints']>;
}

export type UpdateVoucherInput = Partial<CreateVoucherInput>;