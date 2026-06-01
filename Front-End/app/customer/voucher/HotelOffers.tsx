import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Alert,
  Platform,
} from "react-native";
import { Sparkles } from "lucide-react-native";
import { useRouter } from "expo-router";
import { styles } from "./styles";
import { useVoucherCollect } from "@/src/customer/context/VoucherCollectContext";

interface Props {
  isWebLayout: boolean;
  isDarkMode: boolean;
  surface: string;
  softSurface: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  data?: any[];
}

export default function HotelOffers({
  isWebLayout,
  isDarkMode,
  surface,
  softSurface,
  textColor,
  mutedColor,
  borderColor,
  data = [],
}: Props) {
  const router = useRouter();
  const { isCollected, collect } = useVoucherCollect();

  const handleCollect = (offer: any) => {
    collect({
      offerId: offer.id,
      code: offer.collectInfo.code,
      name: offer.collectInfo.name,
      discountLabel: offer.collectInfo.discountLabel,
      accentColor: offer.collectInfo.accentColor,
      hotelName: offer.collectInfo.hotelName,
    });
    if (Platform.OS !== "web") {
      Alert.alert(
        "Đã thu thập!",
        `Mã ${offer.collectInfo.code} đã được lưu. Tìm "${offer.title}" để đặt phòng với ưu đãi này.`,
      );
    }
  };

  const handleUseNow = (offer: any) => {
    // Chuyển sang màn tìm kiếm với keyword là tên khách sạn
    router.push({
      pathname: "/customer/search" as any,
      params: { q: offer.collectInfo.hotelName || offer.title },
    });
  };

  return (
    <>
      <View style={styles.sectionHeader}>
        <View
          style={[
            styles.sectionIcon,
            {
              backgroundColor: isDarkMode ? "rgba(133,194,164,0.2)" : "#d7f2e7",
            },
          ]}
        >
          <Sparkles size={18} color="#5eb58e" strokeWidth={2} />
        </View>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Dành riêng cho bạn
        </Text>
      </View>

      {data && data.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.hotelList,
            isWebLayout && styles.webHotelList,
          ]}
        >
          {data.map((offer) => {
            const collected = isCollected(offer.collectInfo.code);
            return (
              <Pressable
                key={offer.id}
                style={[
                  styles.hotelCard,
                  isWebLayout && styles.webHotelCard,
                  { backgroundColor: surface },
                ]}
              >
                <View style={styles.hotelImageWrap}>
                  <Image
                    source={{ uri: offer.image }}
                    style={styles.hotelImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.hotelContent}>
                  <Text
                    style={[styles.hotelTitle, { color: textColor }]}
                    numberOfLines={1}
                  >
                    {offer.collectInfo.hotelName || offer.title}
                  </Text>
                  <View style={styles.hotelBenefitRow}>
                    <Text style={styles.hotelBenefit}>{offer.benefit}</Text>
                    {!!offer.oldPrice && (
                      <Text style={styles.hotelOldPrice}>{offer.oldPrice}</Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.hotelNote,
                      { backgroundColor: softSurface, borderColor },
                    ]}
                  >
                    <Text
                      style={[styles.hotelNoteText, { color: mutedColor }]}
                      numberOfLines={1}
                    >
                      {offer.note}
                    </Text>
                  </View>

                  {/* Thu thập / Dùng ngay button */}
                  {collected ? (
                    <Pressable
                      style={styles.useNowButton}
                      onPress={() => handleUseNow(offer)}
                    >
                      <Text style={styles.useNowButtonText}>✓ Dùng ngay</Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      style={styles.collectButtonMuted}
                      onPress={() => handleCollect(offer)}
                    >
                      <Text style={styles.collectButtonMutedText}>
                        Thu thập
                      </Text>
                    </Pressable>
                  )}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <View style={{ backgroundColor: softSurface, padding: 16 }}>
          <Text style={[{ color: mutedColor }]}>Hiện chưa có voucher</Text>
        </View>
      )}
    </>
  );
}
