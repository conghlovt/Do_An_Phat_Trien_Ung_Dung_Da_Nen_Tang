import type { CreateRoomTypeInput, UpdateRoomTypeInput, CreateRoomUnitInput, UpdateRoomUnitInput } from '../middlewares/room.validator';
export declare class RoomService {
    private verifyOwnership;
    createRoomType(hotelId: string, ownerId: string, data: CreateRoomTypeInput): Promise<{
        _count: {
            roomUnits: number;
        };
        media: {
            id: string;
            createdAt: Date;
            sortOrder: number;
            roomTypeId: string;
            fileId: string | null;
            imageUrl: string | null;
            mediaType: import(".prisma/client").$Enums.MediaType;
            caption: string | null;
            isCover: boolean;
            uploadedBy: string | null;
        }[];
        pricingPolicies: {
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
        }[];
        roomTypeAmenities: ({
            amenity: {
                id: string;
                createdAt: Date;
                name: string;
                category: import(".prisma/client").$Enums.AmenityCategory;
                isActive: boolean;
                slug: string;
                icon: string | null;
            };
        } & {
            roomTypeId: string;
            amenityId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.RoomTypeStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        slug: string;
        sortOrder: number;
        hotelId: string;
        maxGuests: number;
        bedType: string | null;
        roomSizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
        totalUnits: number;
    }>;
    updateRoomType(hotelId: string, roomTypeId: string, ownerId: string, data: UpdateRoomTypeInput): Promise<({
        _count: {
            roomUnits: number;
        };
        media: {
            id: string;
            createdAt: Date;
            sortOrder: number;
            roomTypeId: string;
            fileId: string | null;
            imageUrl: string | null;
            mediaType: import(".prisma/client").$Enums.MediaType;
            caption: string | null;
            isCover: boolean;
            uploadedBy: string | null;
        }[];
        pricingPolicies: {
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
        }[];
        roomTypeAmenities: ({
            amenity: {
                id: string;
                createdAt: Date;
                name: string;
                category: import(".prisma/client").$Enums.AmenityCategory;
                isActive: boolean;
                slug: string;
                icon: string | null;
            };
        } & {
            roomTypeId: string;
            amenityId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.RoomTypeStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        slug: string;
        sortOrder: number;
        hotelId: string;
        maxGuests: number;
        bedType: string | null;
        roomSizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
        totalUnits: number;
    }) | null>;
    listRoomTypes(hotelId: string): Promise<({
        _count: {
            roomUnits: number;
        };
        media: {
            id: string;
            createdAt: Date;
            sortOrder: number;
            roomTypeId: string;
            fileId: string | null;
            imageUrl: string | null;
            mediaType: import(".prisma/client").$Enums.MediaType;
            caption: string | null;
            isCover: boolean;
            uploadedBy: string | null;
        }[];
        pricingPolicies: {
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
        }[];
        roomTypeAmenities: ({
            amenity: {
                id: string;
                createdAt: Date;
                name: string;
                category: import(".prisma/client").$Enums.AmenityCategory;
                isActive: boolean;
                slug: string;
                icon: string | null;
            };
        } & {
            roomTypeId: string;
            amenityId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.RoomTypeStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        slug: string;
        sortOrder: number;
        hotelId: string;
        maxGuests: number;
        bedType: string | null;
        roomSizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
        totalUnits: number;
    })[]>;
    getRoomType(hotelId: string, roomTypeId: string): Promise<{
        [x: string]: ({
            id: string;
            status: import(".prisma/client").$Enums.RoomUnitStatus;
            createdAt: Date;
            updatedAt: Date;
            roomTypeId: string;
            roomNumber: string;
            floor: number | null;
            notes: string | null;
        } | {
            id: string;
            status: import(".prisma/client").$Enums.RoomUnitStatus;
            createdAt: Date;
            updatedAt: Date;
            roomTypeId: string;
            roomNumber: string;
            floor: number | null;
            notes: string | null;
        })[] | ({
            id: string;
            createdAt: Date;
            sortOrder: number;
            roomTypeId: string;
            fileId: string | null;
            imageUrl: string | null;
            mediaType: import(".prisma/client").$Enums.MediaType;
            caption: string | null;
            isCover: boolean;
            uploadedBy: string | null;
        } | {
            id: string;
            createdAt: Date;
            sortOrder: number;
            roomTypeId: string;
            fileId: string | null;
            imageUrl: string | null;
            mediaType: import(".prisma/client").$Enums.MediaType;
            caption: string | null;
            isCover: boolean;
            uploadedBy: string | null;
        })[] | ({
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
        } | {
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
        })[] | ({
            id: string;
            updatedAt: Date;
            totalRooms: number;
            date: Date;
            roomTypeId: string;
            bookedRooms: number;
            isClosed: boolean;
        } | {
            id: string;
            updatedAt: Date;
            totalRooms: number;
            date: Date;
            roomTypeId: string;
            bookedRooms: number;
            isClosed: boolean;
        })[] | ({
            roomTypeId: string;
            amenityId: string;
        } | {
            roomTypeId: string;
            amenityId: string;
        })[] | {
            id: string;
            status: import(".prisma/client").$Enums.RoomUnitStatus;
            createdAt: Date;
            updatedAt: Date;
            roomTypeId: string;
            roomNumber: string;
            floor: number | null;
            notes: string | null;
        }[] | {
            id: string;
            createdAt: Date;
            sortOrder: number;
            roomTypeId: string;
            fileId: string | null;
            imageUrl: string | null;
            mediaType: import(".prisma/client").$Enums.MediaType;
            caption: string | null;
            isCover: boolean;
            uploadedBy: string | null;
        }[] | {
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
        }[] | {
            id: string;
            updatedAt: Date;
            totalRooms: number;
            date: Date;
            roomTypeId: string;
            bookedRooms: number;
            isClosed: boolean;
        }[] | {
            roomTypeId: string;
            amenityId: string;
        }[];
        [x: number]: never;
        [x: symbol]: never;
    } & {
        id: string;
        status: import(".prisma/client").$Enums.RoomTypeStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        slug: string;
        sortOrder: number;
        hotelId: string;
        maxGuests: number;
        bedType: string | null;
        roomSizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
        totalUnits: number;
    }>;
    deleteRoomType(hotelId: string, roomTypeId: string, ownerId: string): Promise<boolean>;
    createRoomUnit(hotelId: string, roomTypeId: string, ownerId: string, data: CreateRoomUnitInput): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.RoomUnitStatus;
        createdAt: Date;
        updatedAt: Date;
        roomTypeId: string;
        roomNumber: string;
        floor: number | null;
        notes: string | null;
    }>;
    updateRoomUnit(hotelId: string, roomTypeId: string, unitId: string, ownerId: string, data: UpdateRoomUnitInput): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.RoomUnitStatus;
        createdAt: Date;
        updatedAt: Date;
        roomTypeId: string;
        roomNumber: string;
        floor: number | null;
        notes: string | null;
    }>;
    listRoomUnits(hotelId: string, roomTypeId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.RoomUnitStatus;
        createdAt: Date;
        updatedAt: Date;
        roomTypeId: string;
        roomNumber: string;
        floor: number | null;
        notes: string | null;
    }[]>;
    deleteRoomUnit(hotelId: string, roomTypeId: string, unitId: string, ownerId: string): Promise<boolean>;
    addMedia(hotelId: string, roomTypeId: string, ownerId: string, files: Express.Multer.File[]): Promise<{
        file: {
            id: string;
            url: string;
            originalName: string;
            mimeType: string;
            size: number;
            bucketName: string;
            objectKey: string;
        };
        id: string;
        createdAt: Date;
        sortOrder: number;
        roomTypeId: string;
        fileId: string | null;
        imageUrl: string | null;
        mediaType: import(".prisma/client").$Enums.MediaType;
        caption: string | null;
        isCover: boolean;
        uploadedBy: string | null;
    }[]>;
    removeMedia(hotelId: string, roomTypeId: string, mediaId: string, ownerId: string): Promise<boolean>;
}
export declare const roomService: RoomService;
//# sourceMappingURL=room.service.d.ts.map