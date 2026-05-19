export declare const propertyService: {
    getProperties: (options: {
        q?: string;
    }) => Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PropertyStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        address: string;
        city: string;
        type: string;
        images: string[];
        amenities: string[];
        ownerId: string;
    }[]>;
    updateProperty: (id: string, data: any) => Promise<{
        owner: {
            email: string;
            username: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.PropertyStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        address: string;
        city: string;
        type: string;
        images: string[];
        amenities: string[];
        ownerId: string;
    }>;
    deleteProperty: (id: string) => Promise<void>;
};
//# sourceMappingURL=property.service.d.ts.map