export declare const bookingService: {
    getAllBookings: (options: {
        q?: string;
    }) => Promise<any[]>;
    updateBookingStatus: (id: string, status: string) => Promise<any>;
    deleteBooking: (id: string) => Promise<void>;
};
//# sourceMappingURL=booking.service.d.ts.map