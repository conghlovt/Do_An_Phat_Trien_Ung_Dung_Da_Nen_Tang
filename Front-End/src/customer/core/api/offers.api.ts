import apiInstance from "@/src/customer/core/api/api.instance";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface VoucherWalletItem {
  id: string;
  code: string;
  name: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrderValue?: number | null;
  maxDiscount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  isUsable: boolean;
  hotel?: { id: string; name: string; slug?: string } | null;
  display: {
    title: string;
    subtitle?: string;
    expiryText: string;
    discountText: string;
    minOrderText?: string;
    badgeText: string;
    iconKey: string;
    gradient: {
      colors: string[];
      start: { x: number; y: number };
      end: { x: number; y: number };
    };
    accentColor: string;
  };
}

export interface WalletResponse {
  data: {
    vouchers: VoucherWalletItem[];
    voucherCount: number;
  };
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const offersApi = {
  /**
   * GET /api/customer/offers
   * Lấy danh sách ưu đãi theo nhóm (flashDeals, customerRewards, nearbyOffers, hotelOffers)
   */
  getOffers: async () => {
    const res = await apiInstance.get("/api/customer/offers");
    return res.data;
  },

  /**
   * GET /api/customer/offers/wallet
   * Lấy danh sách voucher mà user đã thu thập (wallet).
   */
  getWallet: async (): Promise<WalletResponse> => {
    const res = await apiInstance.get<WalletResponse>(
      "/api/customer/offers/wallet",
    );
    return res.data;
  },

  /**
   * POST /api/customer/offers/:offerId/collect
   * Thu thập một voucher vào wallet của user.
   */
  collectOffer: async (
    offerId: string,
  ): Promise<{ success: boolean; message: string }> => {
    const res = await apiInstance.post<{ success: boolean; message: string }>(
      `/api/customer/offers/${offerId}/collect`,
    );
    return res.data;
  },
};
