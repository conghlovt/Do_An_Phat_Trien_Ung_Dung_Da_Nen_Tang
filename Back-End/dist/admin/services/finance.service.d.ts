export declare const financeService: {
    getFinanceRecords: () => Promise<{
        id: string;
        status: string;
        createdAt: Date;
        month: string;
        totalRevenue: number;
        platformFee: number;
        partnerNet: number;
    }[]>;
    getStats: () => Promise<{
        totalUsers: number;
        totalProperties: number;
        totalBookings: number;
        pendingReviews: number;
        totalRevenue: number;
        trends: {
            revenue: number;
            bookings: number;
            users: number;
            partners: number;
        };
    }>;
    getNotifications: () => Promise<({
        id: string;
        type: string;
        title: string;
        message: string;
        tab: string;
        createdAt: Date;
    } | {
        id: string;
        type: string;
        title: string;
        message: string;
        tab: string;
    })[]>;
};
//# sourceMappingURL=finance.service.d.ts.map