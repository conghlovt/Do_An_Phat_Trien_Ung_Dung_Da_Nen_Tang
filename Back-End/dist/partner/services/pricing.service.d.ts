import type { CreatePricingInput, UpdatePricingInput, CreateSpecialPriceInput } from '../middlewares/pricing.validator';
export declare class PricingService {
    private verifyOwnership;
    private verifyRoomType;
    createPricing(hotelId: string, roomTypeId: string, ownerId: string, data: CreatePricingInput): Promise<{
        specialPrices: {
            id: string;
            createdAt: Date;
            price: import("@prisma/client-runtime-utils").Decimal;
            date: Date;
            reason: string | null;
            pricingPolicyId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        bookingType: import(".prisma/client").$Enums.BookingType;
        roomTypeId: string;
        basePrice: import("@prisma/client-runtime-utils").Decimal;
        minHours: number | null;
        maxHours: number | null;
        extraHourPrice: import("@prisma/client-runtime-utils").Decimal | null;
        overnightCheckinFrom: string | null;
        overnightCheckoutBefore: string | null;
    }>;
    updatePricing(hotelId: string, roomTypeId: string, pricingId: string, ownerId: string, data: UpdatePricingInput): Promise<{
        specialPrices: {
            id: string;
            createdAt: Date;
            price: import("@prisma/client-runtime-utils").Decimal;
            date: Date;
            reason: string | null;
            pricingPolicyId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        bookingType: import(".prisma/client").$Enums.BookingType;
        roomTypeId: string;
        basePrice: import("@prisma/client-runtime-utils").Decimal;
        minHours: number | null;
        maxHours: number | null;
        extraHourPrice: import("@prisma/client-runtime-utils").Decimal | null;
        overnightCheckinFrom: string | null;
        overnightCheckoutBefore: string | null;
    }>;
    listPricing(hotelId: string, roomTypeId: string): Promise<({
        specialPrices: {
            id: string;
            createdAt: Date;
            price: import("@prisma/client-runtime-utils").Decimal;
            date: Date;
            reason: string | null;
            pricingPolicyId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        bookingType: import(".prisma/client").$Enums.BookingType;
        roomTypeId: string;
        basePrice: import("@prisma/client-runtime-utils").Decimal;
        minHours: number | null;
        maxHours: number | null;
        extraHourPrice: import("@prisma/client-runtime-utils").Decimal | null;
        overnightCheckinFrom: string | null;
        overnightCheckoutBefore: string | null;
    })[]>;
    deletePricing(hotelId: string, roomTypeId: string, pricingId: string, ownerId: string): Promise<boolean>;
    createSpecialPrice(hotelId: string, pricingId: string, ownerId: string, data: CreateSpecialPriceInput): Promise<{
        id: string;
        createdAt: Date;
        price: import("@prisma/client-runtime-utils").Decimal;
        date: Date;
        reason: string | null;
        pricingPolicyId: string;
    }>;
    listSpecialPrices(pricingId: string, from?: string, to?: string): Promise<{
        id: string;
        createdAt: Date;
        price: import("@prisma/client-runtime-utils").Decimal;
        date: Date;
        reason: string | null;
        pricingPolicyId: string;
    }[]>;
    deleteSpecialPrice(hotelId: string, specialPriceId: string, ownerId: string): Promise<boolean>;
}
export declare const pricingService: PricingService;
//# sourceMappingURL=pricing.service.d.ts.map