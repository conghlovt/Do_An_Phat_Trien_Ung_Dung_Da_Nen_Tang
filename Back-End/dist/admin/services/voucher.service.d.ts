export declare const voucherService: {
    getAllVouchers: (options: {
        q?: string;
        page?: number;
        limit?: number;
    }) => Promise<{
        vouchers: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    createVoucher: (data: any) => Promise<any>;
    updateVoucher: (id: string, data: any) => Promise<any>;
    deleteVoucher: (id: string) => Promise<void>;
};
//# sourceMappingURL=voucher.service.d.ts.map