import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  CreditCard,
  Gift,
  Star,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { styles } from "./styles";
import { useVoucherCollect } from "@/src/customer/context/VoucherCollectContext";

// Map iconKey string → Lucide component
const ICON_MAP: Record<string, React.ElementType> = {
  gift: Gift,
  creditCard: CreditCard,
  star: Star,
  calendar: Calendar,
};

interface Props {
  isWebLayout: boolean;
  surface: string;
  textColor: string;
  mutedColor: string;
  data?: any[];
}

export default function CustomerRewards({
  isWebLayout,
  surface,
  textColor,
  mutedColor,
  data = [],
}: Props) {
  const router = useRouter();
  const { isCollected, collect } = useVoucherCollect();
  const [collectingId, setCollectingId] = useState<string | null>(null);
  const [localCollected, setLocalCollected] = useState<Set<string>>(new Set());

  const scrollRef = useRef<ScrollView | null>(null);
  const [scrollX, setScrollX] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  if (!data || data.length === 0) return null;

  const handleCollect = async (reward: any) => {
    try {
      setCollectingId(reward.id);
      const code = reward.collectInfo?.code || reward.code;

      // Add to local state immediately for instant UI feedback
      setLocalCollected((prev) => new Set([...prev, code]));

      // Then call collect which will sync to server
      await collect({
        offerId: reward.id,
        ...reward.collectInfo,
      });

      if (Platform.OS !== "web") {
        Alert.alert("Đã thu thập!", `Mã ${code} đã được lưu vào ví của bạn.`);
      }
    } catch (error) {
      console.error("Failed to collect offer", error);
      const code = reward.collectInfo?.code || reward.code;
      setLocalCollected((prev) => {
        const updated = new Set(prev);
        updated.delete(code);
        return updated;
      });
      if (Platform.OS !== "web") {
        Alert.alert("Lỗi", "Không thể thu thập voucher. Vui lòng thử lại.");
      }
    } finally {
      setCollectingId(null);
    }
  };

  const handleUseNow = () => {
    router.push("/customer/search" as any);
  };

  const getCollectedStatus = (rewardCode: string) => {
    return localCollected.has(rewardCode) || isCollected(rewardCode);
  };

  // Khoảng scroll mỗi lần bấm trái / phải
  const scrollStep = useMemo(() => {
    return isWebLayout ? 360 : 300;
  }, [isWebLayout]);

  const maxScrollX = Math.max(0, contentWidth - containerWidth);
  const canScrollLeft = scrollX > 5;
  const canScrollRight = scrollX < maxScrollX - 5;

  const handleScrollLeft = () => {
    const nextX = Math.max(0, scrollX - scrollStep);
    scrollRef.current?.scrollTo({ x: nextX, animated: true });
  };

  const handleScrollRight = () => {
    const nextX = Math.min(maxScrollX, scrollX + scrollStep);
    scrollRef.current?.scrollTo({ x: nextX, animated: true });
  };

  return (
    <View style={{ position: "relative" }}>
      {/* Nút trái */}
      <Pressable
        onPress={handleScrollLeft}
        disabled={!canScrollLeft}
        style={{
          position: "absolute",
          left: 6,
          top: "50%",
          transform: [{ translateY: -22 }],
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: canScrollLeft
            ? "rgba(0,0,0,0.55)"
            : "rgba(0,0,0,0.18)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <ChevronLeft size={20} color="#fff" strokeWidth={2.4} />
      </Pressable>

      {/* Nút phải */}
      <Pressable
        onPress={handleScrollRight}
        disabled={!canScrollRight}
        style={{
          position: "absolute",
          right: 6,
          top: "50%",
          transform: [{ translateY: -22 }],
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: canScrollRight
            ? "rgba(0,0,0,0.55)"
            : "rgba(0,0,0,0.18)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <ChevronRight size={20} color="#fff" strokeWidth={2.4} />
      </Pressable>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        onContentSizeChange={(w) => setContentWidth(w)}
        onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
        contentContainerStyle={[
          styles.customerRewards,
          isWebLayout && styles.webCustomerRewards,
          {
            paddingHorizontal: 52, // chừa chỗ để nút trái/phải không đè sát card
          },
        ]}
      >
        {data.map((reward) => {
          const { id, iconKey, title, subtitle, color, bg } = reward;
          const rewardCode = reward.collectInfo?.code || reward.code;
          const Icon = ICON_MAP[iconKey] ?? Gift;
          const collected = getCollectedStatus(rewardCode);
          const isLoading = collectingId === id;

          return (
            <Pressable
              key={id}
              style={[
                styles.rewardCard,
                isWebLayout && styles.webRewardCard,
                { backgroundColor: surface },
              ]}
              onPress={collected ? handleUseNow : () => handleCollect(reward)}
              disabled={isLoading}
            >
              <View style={[styles.rewardStripe, { backgroundColor: color }]} />
              <View style={[styles.rewardIcon, { backgroundColor: bg }]}>
                <Icon size={24} color={color} strokeWidth={1.8} />
              </View>

              <View style={styles.rewardCopy}>
                <Text style={[styles.rewardTitle, { color: textColor }]}>
                  {title}
                </Text>
                <Text
                  style={[styles.rewardSubtitle, { color: mutedColor }]}
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              </View>

              <View
                style={[
                  styles.rewardAction,
                  { backgroundColor: collected ? "#34a370" : color },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.rewardActionText}>
                    {collected ? "Dùng ngay" : "Thu thập"}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
