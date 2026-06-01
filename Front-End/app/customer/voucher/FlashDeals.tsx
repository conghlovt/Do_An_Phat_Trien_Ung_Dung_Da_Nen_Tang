import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Clock } from "lucide-react-native";
import { useRouter } from "expo-router";
import { styles } from "./styles";
import { useVoucherCollect } from "@/src/customer/context/VoucherCollectContext";

interface Props {
  isWebLayout: boolean;
  isDarkMode: boolean;
  textColor: string;
  data?: any[];
}

export default function FlashDeals({
  isWebLayout,
  isDarkMode,
  textColor,
  data = [],
}: Props) {
  const router = useRouter();
  const { isCollected, collect } = useVoucherCollect();

  if (!data || data.length === 0) return null;

  const handleCollect = (deal: any) => {
    collect({
      offerId: deal.id,
      ...deal.collectInfo,
    });
    if (Platform.OS !== "web") {
      Alert.alert(
        "Đã thu thập!",
        `Mã ${deal.collectInfo.code} đã được lưu vào ví của bạn.`,
      );
    }
  };

  const handleUseNow = () => {
    // Chuyển đến màn hình tìm kiếm khách sạn
    router.push("/customer/search" as any);
  };

  return (
    <>
      <View
        style={[styles.sectionHeader, isWebLayout && styles.webSectionHeader]}
      >
        <View
          style={[
            styles.sectionIcon,
            {
              backgroundColor: isDarkMode ? "rgba(255,91,24,0.18)" : "#fff1e8",
            },
          ]}
        >
          <Clock size={18} color="#ff5b18" strokeWidth={2} />
        </View>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Hot time deals
        </Text>
        <Pressable
          style={[
            styles.statusPill,
            {
              backgroundColor: isDarkMode ? "rgba(255,91,24,0.16)" : "#fff7ed",
            },
          ]}
        >
          <Text style={styles.statusPillText}>Đang mở</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.flashList,
          isWebLayout && styles.webFlashList,
        ]}
      >
        {data.map((deal) => {
          const collected = isCollected(deal.collectInfo.code);
          return (
            <Pressable
              key={deal.id}
              style={[
                styles.flashCard,
                isWebLayout && styles.webFlashCard,
                { backgroundColor: deal.color },
              ]}
            >
              <View
                style={[
                  styles.flashBubble,
                  { backgroundColor: deal.collectInfo.accentColor },
                ]}
              />
              <View
                style={[
                  styles.flashBubbleSmall,
                  { backgroundColor: deal.collectInfo.accentColor },
                ]}
              />
              <Text style={styles.flashLabel}>
                {deal.collectInfo.discountLabel}
              </Text>
              <Text style={styles.flashTitle} numberOfLines={1}>
                {deal.title}
              </Text>
              <Text style={styles.flashSubtitle}>{deal.subtitle}</Text>

              {collected ? (
                /* Đã thu thập → hiển thị "Dùng ngay" */
                <Pressable style={styles.flashButton} onPress={handleUseNow}>
                  <Text style={styles.flashButtonText}>✓ Dùng ngay</Text>
                </Pressable>
              ) : (
                /* Chưa thu thập → hiển thị "Thu thập" */
                <Pressable
                  style={styles.flashButton}
                  onPress={() => handleCollect(deal)}
                >
                  <Text style={styles.flashButtonText}>Thu thập</Text>
                </Pressable>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </>
  );
}
