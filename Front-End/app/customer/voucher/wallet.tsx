import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Copy, Ticket, WalletCards } from "lucide-react-native";
import { useThemeContext } from "@/src/customer/theme/ThemeContext";
import { useVoucherCollect } from "@/src/customer/context/VoucherCollectContext";

const PRIMARY = "#85c2a4";
const MUTED = "#8390ae";

export default function VoucherWalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentTheme, isDarkMode } = useThemeContext();
  const { width } = useWindowDimensions();
  const { collected: collectedOffers } = useVoucherCollect();
  const isWebLayout = Platform.OS === "web" && width >= 768;
  const [activeTab, setActiveTab] = useState<"newSaved" | "used" | "history">(
    "newSaved",
  );

  // Simple filtering - show collected offers from context
  
const visibleVouchers = useMemo(() => {
  if (activeTab === "newSaved") {
    return [...collectedOffers].reverse();
  } else if (activeTab === "used") {
    // TODO: Show used vouchers from backend
    return [];
  } else if (activeTab === "history") {
    // TODO: Show expired vouchers from backend
    return [];
  }
  return [];
}, [activeTab, collectedOffers]);

  return (
    <View
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <View
        style={[
          styles.header,
          isWebLayout && styles.webHeader,
          {
            paddingTop: isWebLayout ? 24 : insets.top + 18,
            backgroundColor: isDarkMode ? "#1f3a31" : PRIMARY,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={22} color="#ffffff" strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.headerTitle}>Ví voucher của tôi</Text>
      </View>

      <View style={[styles.contentWrap, isWebLayout && styles.webContentWrap]}>
        <View style={styles.tabs}>
          {[
            { key: "newSaved" as const, label: "Mới & Đã lưu" },
            { key: "used" as const, label: "Đã dùng" },
            { key: "history" as const, label: "Lịch sử" },
          ].map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tabButton, active && styles.tabButtonActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={isWebLayout}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 32 },
          ]}
        >
          {visibleVouchers.length === 0 ? (
            <View
              style={[styles.emptyCard, { backgroundColor: currentTheme.card }]}
            >
              <WalletCards size={30} color={PRIMARY} />
              <Text style={[styles.emptyTitle, { color: currentTheme.text }]}>
                {activeTab === "newSaved"
                  ? "Chưa có voucher"
                  : activeTab === "used"
                    ? "Chưa dùng voucher nào"
                    : "Không có lịch sử"}
              </Text>
              <Text
                style={[
                  styles.emptyText,
                  { color: currentTheme.textSecondary },
                ]}
              >
                {activeTab === "newSaved"
                  ? "Bấm 'Thu thập' trên màn ưu đãi để lưu voucher."
                  : activeTab === "used"
                    ? "Voucher đã dùng sẽ xuất hiện tại đây."
                    : "Lịch sử vouchers của bạn sẽ xuất hiện tại đây."}
              </Text>
            </View>
          ) : (
            visibleVouchers.map((offer) => (
              <View
                key={offer.offerId}
                style={[
                  styles.voucherCard,
                  { backgroundColor: currentTheme.card },
                ]}
              >
                <View
                  style={[
                    styles.voucherStripe,
                    { backgroundColor: offer.accentColor },
                  ]}
                />
                <View
                  style={[
                    styles.voucherIcon,
                    {
                      backgroundColor: isDarkMode
                        ? "rgba(133,194,164,0.18)"
                        : "#dff4ea",
                    },
                  ]}
                >
                  <Ticket size={26} color={offer.accentColor} strokeWidth={2} />
                </View>
                <View style={styles.voucherBody}>
                  <Text
                    style={[styles.voucherTitle, { color: currentTheme.text }]}
                    numberOfLines={2}
                  >
                    {offer.name}
                  </Text>
                  <Text
                    style={[
                      styles.voucherCode,
                      { color: currentTheme.textSecondary },
                    ]}
                  >
                    Mã: {offer.code}
                  </Text>
                  {offer.hotelName && (
                    <Text
                      style={[
                        styles.voucherHotel,
                        { color: currentTheme.textSecondary },
                      ]}
                    >
                      Tại: {offer.hotelName}
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.voucherDiscount,
                      { color: offer.accentColor },
                    ]}
                  >
                    {offer.discountLabel}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    minHeight: 126,
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  webHeader: {
    borderRadius: 24,
    marginHorizontal: 32,
    marginTop: 28,
    minHeight: 112,
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 23,
    fontWeight: "900",
  },
  contentWrap: {
    flex: 1,
  },
  webContentWrap: {
    width: "100%",
    maxWidth: 1040,
    alignSelf: "center",
  },
  tabs: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  tabButton: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: "#eef2f1",
  },
  tabButtonActive: {
    backgroundColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 4,
  },
  tabText: {
    color: "#607086",
    fontSize: 15,
    fontWeight: "800",
  },
  tabTextActive: {
    color: "#ffffff",
  },
  listContent: {
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  voucherCard: {
    minHeight: 100,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    overflow: "hidden",
    shadowColor: "#17233d",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  voucherStripe: {
    position: "absolute",
    left: 0,
    top: 16,
    bottom: 16,
    width: 5,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  voucherIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  voucherBody: {
    flex: 1,
    minWidth: 0,
  },
  voucherTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  voucherCode: {
    fontSize: 12,
    marginBottom: 2,
  },
  voucherHotel: {
    fontSize: 12,
    marginBottom: 4,
  },
  voucherDiscount: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6,
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    marginTop: 36,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "900",
  },
  emptyText: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
});
