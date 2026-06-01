/**
 * VoucherCollectContext
 *
 * Quản lý danh sách voucher mà user "Thu thập" trong màn Ưu đãi.
 * Các voucher này sẽ được hiển thị trên màn booking (booking-confirm)
 * để user có thể chọn áp dụng mà không cần nhập code thủ công.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";
import { offersApi } from "@/src/customer/core/api/offers.api";

export interface CollectedOffer {
  /** ID nội bộ của offer */
  offerId: string;
  /** Mã voucher dùng để so sánh và gọi API validate */
  code: string;
  /** Tên hiển thị */
  name: string;
  /** % hoặc số tiền giảm – chỉ dùng để hiển thị */
  discountLabel: string;
  /** Màu accent */
  accentColor: string;
  /** Thông tin khách sạn áp dụng (nếu có) */
  hotelId?: string;
  hotelSlug?: string;
  hotelName?: string;
}

interface VoucherCollectCtx {
  collected: CollectedOffer[];
  isCollected: (offerCode: string) => boolean;
  collect: (offer: CollectedOffer) => void;
  uncollect: (offerCode: string) => void;
  syncWallet: () => Promise<void>;
}

const VoucherCollectContext = createContext<VoucherCollectCtx>({
  collected: [],
  isCollected: () => false,
  collect: () => {},
  uncollect: () => {},
  syncWallet: async () => {},
});

export function VoucherCollectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collected, setCollected] = useState<CollectedOffer[]>([]);

  const syncWallet = useCallback(async () => {
    try {
      const wallet = await offersApi.getWallet();
      console.log("✅ Wallet sync response:", wallet);
      const offersFromWallet: CollectedOffer[] = wallet.data.vouchers.map(
        (v) => ({
          offerId: v.id,
          code: v.code,
          name: v.name,
          discountLabel: v.display.title,
          accentColor: v.display.accentColor,
          hotelId: v.hotel?.id,
          hotelSlug: v.hotel?.slug,
          hotelName: v.hotel?.name,
        }),
      );
      console.log("✅ Mapped collected offers:", offersFromWallet);
      setCollected(offersFromWallet);
    } catch (error) {
      console.error("❌ Failed to sync wallet", error);
    }
  }, []);

  // Load wallet từ server khi provider mount
  useEffect(() => {
    console.log("🔄 VoucherCollectProvider mounting - syncing wallet...");
    syncWallet();
  }, [syncWallet]);

  // Check nếu một offer đã được collect bằng code (không phải ID)
  const isCollected = useCallback(
    (offerCode: string) => collected.some((c) => c.code === offerCode),
    [collected],
  );

  const collect = useCallback(async (offer: CollectedOffer) => {
    // Optimistically add to local state first so UI is responsive
    setCollected((prev) => {
      if (prev.some((c) => c.code === offer.code)) return prev;
      return [...prev, offer];
    });
    // Then sync to server (best-effort)
    try {
      await offersApi.collectOffer(offer.offerId);
    } catch (error) {
      console.log("Failed to sync collect offer to server", error);
      // Rollback if failed
      setCollected((prev) => prev.filter((c) => c.code !== offer.code));
    }
  }, []);

  const uncollect = useCallback((offerCode: string) => {
    setCollected((prev) => prev.filter((c) => c.code !== offerCode));
  }, []);

  return (
    <VoucherCollectContext.Provider
      value={{ collected, isCollected, collect, uncollect, syncWallet }}
    >
      {children}
    </VoucherCollectContext.Provider>
  );
}

export function useVoucherCollect() {
  return useContext(VoucherCollectContext);
}
