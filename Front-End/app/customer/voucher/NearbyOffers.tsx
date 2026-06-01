import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Clock, Coffee, MapPin, Tag, Timer, Ticket } from "lucide-react-native";
import { useRouter } from "expo-router";
import { styles } from "./styles";
import { useVoucherCollect } from "@/src/customer/context/VoucherCollectContext";

const ICON_MAP: Record<string, React.ElementType> = {
  tag: Tag,
  clock: Clock,
  coffee: Coffee,
  timer: Timer,
  ticket: Ticket,
};

interface Props {
  isWebLayout: boolean;
  isDarkMode: boolean;
  surface: string;
  textColor: string;
  mutedColor: string;
  data?: any[];
}

export default function NearbyOffers({
  isWebLayout,
  surface,
  textColor,
  mutedColor,
  data = [],
}: Props) {
  const router = useRouter();
  const { isCollected, collect } = useVoucherCollect();

  if (!data || data.length === 0) return null;

  const handleCollect = (offer: any) => {
    collect({
      offerId: offer.id,
      ...offer.collectInfo,
    });
    if (Platform.OS !== "web") {
      Alert.alert(
        "Đã thu thập!",
        `Mã ${offer.collectInfo.code} đã được lưu vào ví.`,
      );
    }
  };

  const handleUseNow = () => {
    router.push("/customer/search" as any);
  };

  return (
    <>
      <View style={styles.nearHeader}>
        <View style={styles.sectionTitleGroup}>
          <LinearGradient
            colors={["#2A6AA8", "#6F2DB0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MapPin size={22} color="#fff" strokeWidth={2.2} />
          </LinearGradient>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Gần bạn
          </Text>
        </View>
        <Pressable>
          <Text style={styles.changeLocationText}>Đổi vị trí</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.nearGrid,
          isWebLayout && styles.webNearGrid,
        ]}
      >
        {data.map((offer) => {
          const { id, iconKey, title, subtitle, color, bg } = offer;
          const Icon = ICON_MAP[iconKey] ?? Tag;
          const collected = isCollected(offer.collectInfo.code);

          return (
            <Pressable
              key={id}
              style={[
                styles.nearCard,
                isWebLayout && styles.webNearCard,
                { backgroundColor: surface },
              ]}
              onPress={collected ? handleUseNow : () => handleCollect(offer)}
            >
              <View style={[styles.nearIcon, { backgroundColor: bg }]}>
                <Icon size={24} color={color} strokeWidth={2} />
              </View>
              <Text style={[styles.nearTitle, { color: textColor }]}>
                {title}
              </Text>
              <Text style={[styles.nearSubtitle, { color: mutedColor }]}>
                {subtitle}
              </Text>
              {/* Thu thập / Dùng ngay badge */}
              <View
                style={[
                  styles.nearCollectBadge,
                  { backgroundColor: collected ? "#34a370" : color },
                ]}
              >
                <Text style={styles.nearCollectBadgeText}>
                  {collected ? "Dùng ngay" : "Thu thập"}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </>
  );
}
