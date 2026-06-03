import React from "react";
import { View, Text, Pressable } from "react-native";
import { Bell, ChevronRight, CreditCard } from "lucide-react-native";
import { useRouter } from "expo-router";
import { styles } from "./styles";

interface Props {
  paddingTop: number;
  isWebLayout: boolean;
  isDarkMode?: boolean;
  voucherCount?: number; // TODO: nhận từ API GET /users/me/wallet
  onVoucherPress?: () => void;
}

export default function HeroSection({
  paddingTop,
  isWebLayout,
  isDarkMode = false,
  voucherCount = 12,
  onVoucherPress,
}: Props) {
  const router = useRouter();

  const cards = [
    {
      Icon: CreditCard,
      label: "Ví voucher",
      value: voucherCount.toString(),
      badge: "Mới",
      bg: "#d7efe5",
      color: "#5cae8c",
    },
  ];

  return (
    <View
      style={[
        styles.hero,
        isWebLayout && styles.webHero,
        {
          paddingTop,
          backgroundColor: isDarkMode ? "#1f3a31" : "#85c2a4",
        },
      ]}
    >
      {/* Top row */}
      <View style={styles.heroTop}>
        <View>
          <Text style={styles.brandText}>STAYHUB</Text>
          <Text style={styles.heroTitle}>Ưu đãi</Text>
        </View>

        <View style={styles.heroActions}>
          <Pressable
            style={styles.heroIconButton}
            onPress={() => router.push("/customer/messages/notifications")}
          >
            <Bell size={20} color="#ffffff" strokeWidth={2} />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>
      </View>

      {/* Summary cards */}
      <View
        style={[styles.summaryCards, isWebLayout && styles.webSummaryCards]}
      >
        {cards.map(({ Icon, label, value, badge, bg, color }) => (
          <Pressable
            key={label}
            onPress={label === "Ví voucher" ? onVoucherPress : undefined}
            style={[styles.summaryCard, isWebLayout && styles.webSummaryCard]}
          >
            <View style={[styles.summaryIcon, { backgroundColor: bg }]}>
              <Icon size={22} color={color} strokeWidth={1.8} />
            </View>

            <View style={styles.summaryCopy}>
              <Text style={styles.summaryLabel}>{label}</Text>
              <View style={styles.summaryValueRow}>
                <Text
                  style={styles.summaryValue}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  {value}
                </Text>

                {badge && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>{badge}</Text>
                  </View>
                )}
              </View>
            </View>

            <ChevronRight size={18} color="#c4cfdd" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
