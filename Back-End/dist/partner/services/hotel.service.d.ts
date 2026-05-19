import type { CreateHotelInput, UpdateHotelInput, HotelQueryInput } from '../middlewares/hotel.validator';
import type { Prisma } from '@prisma/client';
export declare class HotelService {
    private verifyOwnership;
    /**
     * Create a new hotel (Partner)
     */
    create(ownerId: string, data: CreateHotelInput): Promise<{
        address: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            city: string;
            district: string;
            province: string;
            hotelId: string;
            addressLine: string;
            ward: string | null;
            country: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            fullAddress: string | null;
        } | null;
        images: {
            id: string;
            createdAt: Date;
            sortOrder: number;
            hotelId: string;
            fileId: string | null;
            imageUrl: string | null;
            caption: string | null;
            isCover: boolean;
            uploadedBy: string | null;
        }[];
        owner: {
            id: string;
            email: string;
            username: string;
            avatar: string | null;
        };
        videos: {
            id: string;
            createdAt: Date;
            title: string | null;
            sortOrder: number;
            hotelId: string;
            fileId: string | null;
            uploadedBy: string | null;
            videoUrl: string | null;
            duration: number | null;
        }[];
        roomTypes: ({
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
                basePrice: Prisma.Decimal;
                minHours: number | null;
                maxHours: number | null;
                extraHourPrice: Prisma.Decimal | null;
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
            roomSizeSqm: Prisma.Decimal | null;
            totalUnits: number;
        })[];
        hotelAmenities: ({
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
            hotelId: string;
            amenityId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.HotelStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        ownerId: string;
        totalRooms: number;
        slug: string;
        propertyType: import(".prisma/client").$Enums.PropertyType;
        starRating: number | null;
        isFeatured: boolean;
        checkInTime: string;
        checkOutTime: string;
        minBookingHours: number | null;
        cancellationPolicy: import(".prisma/client").$Enums.CancellationPolicy;
        cancellationHours: number;
        depositPercent: Prisma.Decimal;
        avgRating: Prisma.Decimal;
        totalReviews: number;
        approvedAt: Date | null;
        approvedBy: string | null;
        rejectionReason: string | null;
    }>;
    /**
     * Update hotel (Partner - owner only)
     */
    update(hotelId: string, ownerId: string, data: UpdateHotelInput): Promise<({
        address: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            city: string;
            district: string;
            province: string;
            hotelId: string;
            addressLine: string;
            ward: string | null;
            country: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            fullAddress: string | null;
        } | null;
        images: {
            id: string;
            createdAt: Date;
            sortOrder: number;
            hotelId: string;
            fileId: string | null;
            imageUrl: string | null;
            caption: string | null;
            isCover: boolean;
            uploadedBy: string | null;
        }[];
        owner: {
            id: string;
            email: string;
            username: string;
            avatar: string | null;
        };
        videos: {
            id: string;
            createdAt: Date;
            title: string | null;
            sortOrder: number;
            hotelId: string;
            fileId: string | null;
            uploadedBy: string | null;
            videoUrl: string | null;
            duration: number | null;
        }[];
        roomTypes: ({
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
                basePrice: Prisma.Decimal;
                minHours: number | null;
                maxHours: number | null;
                extraHourPrice: Prisma.Decimal | null;
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
            roomSizeSqm: Prisma.Decimal | null;
            totalUnits: number;
        })[];
        hotelAmenities: ({
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
            hotelId: string;
            amenityId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.HotelStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        ownerId: string;
        totalRooms: number;
        slug: string;
        propertyType: import(".prisma/client").$Enums.PropertyType;
        starRating: number | null;
        isFeatured: boolean;
        checkInTime: string;
        checkOutTime: string;
        minBookingHours: number | null;
        cancellationPolicy: import(".prisma/client").$Enums.CancellationPolicy;
        cancellationHours: number;
        depositPercent: Prisma.Decimal;
        avgRating: Prisma.Decimal;
        totalReviews: number;
        approvedAt: Date | null;
        approvedBy: string | null;
        rejectionReason: string | null;
    }) | null>;
    /**
     * Get hotel by ID (Partner - owner only)
     */
    getById(hotelId: string, ownerId: string): Promise<{
        address: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            city: string;
            district: string;
            province: string;
            hotelId: string;
            addressLine: string;
            ward: string | null;
            country: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            fullAddress: string | null;
        } | null;
        images: {
            id: string;
            createdAt: Date;
            sortOrder: number;
            hotelId: string;
            fileId: string | null;
            imageUrl: string | null;
            caption: string | null;
            isCover: boolean;
            uploadedBy: string | null;
        }[];
        owner: {
            id: string;
            email: string;
            username: string;
            avatar: string | null;
        };
        videos: {
            id: string;
            createdAt: Date;
            title: string | null;
            sortOrder: number;
            hotelId: string;
            fileId: string | null;
            uploadedBy: string | null;
            videoUrl: string | null;
            duration: number | null;
        }[];
        roomTypes: ({
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
                basePrice: Prisma.Decimal;
                minHours: number | null;
                maxHours: number | null;
                extraHourPrice: Prisma.Decimal | null;
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
            roomSizeSqm: Prisma.Decimal | null;
            totalUnits: number;
        })[];
        hotelAmenities: ({
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
            hotelId: string;
            amenityId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.HotelStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        ownerId: string;
        totalRooms: number;
        slug: string;
        propertyType: import(".prisma/client").$Enums.PropertyType;
        starRating: number | null;
        isFeatured: boolean;
        checkInTime: string;
        checkOutTime: string;
        minBookingHours: number | null;
        cancellationPolicy: import(".prisma/client").$Enums.CancellationPolicy;
        cancellationHours: number;
        depositPercent: Prisma.Decimal;
        avgRating: Prisma.Decimal;
        totalReviews: number;
        approvedAt: Date | null;
        approvedBy: string | null;
        rejectionReason: string | null;
    }>;
    /**
     * Get hotel by slug (Public)
     */
    getBySlug(slug: string): Promise<{
        address: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            city: string;
            district: string;
            province: string;
            hotelId: string;
            addressLine: string;
            ward: string | null;
            country: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            fullAddress: string | null;
        } | null;
        images: {
            id: string;
            createdAt: Date;
            sortOrder: number;
            hotelId: string;
            fileId: string | null;
            imageUrl: string | null;
            caption: string | null;
            isCover: boolean;
            uploadedBy: string | null;
        }[];
        owner: {
            id: string;
            email: string;
            username: string;
            avatar: string | null;
        };
        videos: {
            id: string;
            createdAt: Date;
            title: string | null;
            sortOrder: number;
            hotelId: string;
            fileId: string | null;
            uploadedBy: string | null;
            videoUrl: string | null;
            duration: number | null;
        }[];
        roomTypes: ({
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
                basePrice: Prisma.Decimal;
                minHours: number | null;
                maxHours: number | null;
                extraHourPrice: Prisma.Decimal | null;
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
            roomSizeSqm: Prisma.Decimal | null;
            totalUnits: number;
        })[];
        hotelAmenities: ({
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
            hotelId: string;
            amenityId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.HotelStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        ownerId: string;
        totalRooms: number;
        slug: string;
        propertyType: import(".prisma/client").$Enums.PropertyType;
        starRating: number | null;
        isFeatured: boolean;
        checkInTime: string;
        checkOutTime: string;
        minBookingHours: number | null;
        cancellationPolicy: import(".prisma/client").$Enums.CancellationPolicy;
        cancellationHours: number;
        depositPercent: Prisma.Decimal;
        avgRating: Prisma.Decimal;
        totalReviews: number;
        approvedAt: Date | null;
        approvedBy: string | null;
        rejectionReason: string | null;
    }>;
    /**
     * List hotels for a partner (owner)
     */
    listByOwner(ownerId: string, query: HotelQueryInput): Promise<{
        items: ({
            address: {
                city: string;
                district: string;
                fullAddress: string | null;
            } | null;
            images: {
                id: string;
                createdAt: Date;
                sortOrder: number;
                hotelId: string;
                fileId: string | null;
                imageUrl: string | null;
                caption: string | null;
                isCover: boolean;
                uploadedBy: string | null;
            }[];
            hotelAmenities: ({
                amenity: {
                    id: string;
                    name: string;
                    icon: string | null;
                };
            } & {
                hotelId: string;
                amenityId: string;
            })[];
        } & {
            id: string;
            status: import(".prisma/client").$Enums.HotelStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            ownerId: string;
            totalRooms: number;
            slug: string;
            propertyType: import(".prisma/client").$Enums.PropertyType;
            starRating: number | null;
            isFeatured: boolean;
            checkInTime: string;
            checkOutTime: string;
            minBookingHours: number | null;
            cancellationPolicy: import(".prisma/client").$Enums.CancellationPolicy;
            cancellationHours: number;
            depositPercent: Prisma.Decimal;
            avgRating: Prisma.Decimal;
            totalReviews: number;
            approvedAt: Date | null;
            approvedBy: string | null;
            rejectionReason: string | null;
        })[];
        totalItems: number;
    }>;
    /**
     * List hotels for public search
     */
    listPublic(query: any): Promise<{
        items: ({
            address: {
                city: string;
                district: string;
                fullAddress: string | null;
            } | null;
            images: {
                id: string;
                createdAt: Date;
                sortOrder: number;
                hotelId: string;
                fileId: string | null;
                imageUrl: string | null;
                caption: string | null;
                isCover: boolean;
                uploadedBy: string | null;
            }[];
            hotelAmenities: ({
                amenity: {
                    id: string;
                    name: string;
                    icon: string | null;
                };
            } & {
                hotelId: string;
                amenityId: string;
            })[];
        } & {
            id: string;
            status: import(".prisma/client").$Enums.HotelStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            ownerId: string;
            totalRooms: number;
            slug: string;
            propertyType: import(".prisma/client").$Enums.PropertyType;
            starRating: number | null;
            isFeatured: boolean;
            checkInTime: string;
            checkOutTime: string;
            minBookingHours: number | null;
            cancellationPolicy: import(".prisma/client").$Enums.CancellationPolicy;
            cancellationHours: number;
            depositPercent: Prisma.Decimal;
            avgRating: Prisma.Decimal;
            totalReviews: number;
            approvedAt: Date | null;
            approvedBy: string | null;
            rejectionReason: string | null;
        })[];
        totalItems: number;
        page: any;
        limit: any;
    }>;
    /**
     * Submit hotel for review (draft → pending)
     */
    submitForReview(hotelId: string, ownerId: string): Promise<{
        address: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            city: string;
            district: string;
            province: string;
            hotelId: string;
            addressLine: string;
            ward: string | null;
            country: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            fullAddress: string | null;
        } | null;
        images: {
            id: string;
            createdAt: Date;
            sortOrder: number;
            hotelId: string;
            fileId: string | null;
            imageUrl: string | null;
            caption: string | null;
            isCover: boolean;
            uploadedBy: string | null;
        }[];
        owner: {
            id: string;
            email: string;
            username: string;
            avatar: string | null;
        };
        videos: {
            id: string;
            createdAt: Date;
            title: string | null;
            sortOrder: number;
            hotelId: string;
            fileId: string | null;
            uploadedBy: string | null;
            videoUrl: string | null;
            duration: number | null;
        }[];
        roomTypes: ({
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
                basePrice: Prisma.Decimal;
                minHours: number | null;
                maxHours: number | null;
                extraHourPrice: Prisma.Decimal | null;
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
            roomSizeSqm: Prisma.Decimal | null;
            totalUnits: number;
        })[];
        hotelAmenities: ({
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
            hotelId: string;
            amenityId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.HotelStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        ownerId: string;
        totalRooms: number;
        slug: string;
        propertyType: import(".prisma/client").$Enums.PropertyType;
        starRating: number | null;
        isFeatured: boolean;
        checkInTime: string;
        checkOutTime: string;
        minBookingHours: number | null;
        cancellationPolicy: import(".prisma/client").$Enums.CancellationPolicy;
        cancellationHours: number;
        depositPercent: Prisma.Decimal;
        avgRating: Prisma.Decimal;
        totalReviews: number;
        approvedAt: Date | null;
        approvedBy: string | null;
        rejectionReason: string | null;
    }>;
    /**
     * Delete hotel (Partner - only if draft/rejected)
     */
    delete(hotelId: string, ownerId: string): Promise<boolean>;
    /**
     * Upload images for a hotel
     */
    addImages(hotelId: string, ownerId: string, files: Express.Multer.File[]): Promise<{
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
        hotelId: string;
        fileId: string | null;
        imageUrl: string | null;
        caption: string | null;
        isCover: boolean;
        uploadedBy: string | null;
    }[]>;
    /**
     * Remove a hotel image
     */
    removeImage(hotelId: string, imageId: string, ownerId: string): Promise<boolean>;
    /**
     * Upload video for a hotel
     */
    addVideo(hotelId: string, ownerId: string, file: Express.Multer.File, title?: string): Promise<{
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
        title: string | null;
        sortOrder: number;
        hotelId: string;
        fileId: string | null;
        uploadedBy: string | null;
        videoUrl: string | null;
        duration: number | null;
    }>;
    /**
     * Remove a hotel video
     */
    removeVideo(hotelId: string, videoId: string, ownerId: string): Promise<boolean>;
}
export declare const hotelService: HotelService;
//# sourceMappingURL=hotel.service.d.ts.map