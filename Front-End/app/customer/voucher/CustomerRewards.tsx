import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { CreditCard, Gift, Star, Calendar } from "lucide-react-native";
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

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.customerRewards,
        isWebLayout && styles.webCustomerRewards,
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
  );
}
