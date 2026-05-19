export declare class AmenityService {
    /**
     * List all active amenities, grouped by category
     */
    listAll(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        category: import(".prisma/client").$Enums.AmenityCategory;
        isActive: boolean;
        slug: string;
        icon: string | null;
    }[]>;
}
export declare const amenityService: AmenityService;
//# sourceMappingURL=amenity.service.d.ts.map