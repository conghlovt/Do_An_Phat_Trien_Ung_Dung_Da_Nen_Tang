export declare class InventoryService {
    /**
     * Get room inventory calendar data for a hotel
     * Returns room types with their inventory & pricing for a date range
     */
    getCalendar(hotelId: string, ownerId: string, startDate: string, endDate: string): Promise<{
        id: string;
        name: string;
        totalUnits: number;
        status: import(".prisma/client").$Enums.RoomTypeStatus;
        inventory: Record<string, any>;
        pricing: Record<string, number>;
    }[]>;
    /**
     * Update inventory for a specific room type on a specific date
     */
    updateInventory(hotelId: string, roomTypeId: string, ownerId: string, date: string, data: {
        totalRooms?: number;
        isClosed?: boolean;
    }): Promise<{
        id: string;
        updatedAt: Date;
        totalRooms: number;
        date: Date;
        roomTypeId: string;
        bookedRooms: number;
        isClosed: boolean;
    }>;
}
export declare const inventoryService: InventoryService;
//# sourceMappingURL=inventory.service.d.ts.map