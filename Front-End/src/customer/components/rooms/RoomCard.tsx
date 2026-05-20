import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  AlertCircle,
  Check,
  ChevronRight,
  CreditCard,
  Zap,
} from 'lucide-react-native';
import ImageWithFallback from '@/src/customer/components/ImageWithFallback';
import { ROOM_LIST_PRIMARY } from '@/src/customer/constants/roomList';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import type { Room } from '@/src/customer/api/hotels.api';
import {
  formatRoomPrice,
  getRoomAmenityText,
  getRoomFeatureText,
} from '@/src/customer/utils/roomDisplay';
import { roomListStyles as styles } from './roomList.styles';

interface RoomCardProps {
  room: Room;
  onBook: () => void;
  onDetail: () => void;
  isWebLayout: boolean;
  imageWidth: number;
}

export default function RoomCard({
  room,
  onBook,
  onDetail,
  isWebLayout,
  imageWidth,
}: RoomCardProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const { currentTheme } = useThemeContext();
  const hasFlashPrice = room.flashSale;
  const displayPrice = hasFlashPrice ? room.price : room.originalPrice;
  const featureText = getRoomFeatureText(room);
  const amenityText = getRoomAmenityText(room);

  return (
    <View style={[styles.roomCard, isWebLayout && styles.webRoomCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
      <View style={styles.roomImageWrap}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={e => setImgIndex(Math.round(e.nativeEvent.contentOffset.x / imageWidth))}
        >
          {room.images.map((img, index) => (
            <ImageWithFallback
              key={`${img}-${index}`}
              uri={img}
              style={{ width: imageWidth, height: isWebLayout ? 240 : 200 }}
              alt={room.name}
            />
          ))}
        </ScrollView>

        {room.images.length > 1 && (
          <View style={styles.imgDots}>
            {room.images.map((_, index) => (
              <View key={index} style={[styles.imgDot, index === imgIndex && styles.imgDotActive]} />
            ))}
          </View>
        )}

        {hasFlashPrice && (
          <View style={styles.flashBadge}>
            <Zap size={10} color="#fff" fill="#fff" />
            <Text style={styles.flashBadgeText}>Flash Sale</Text>
          </View>
        )}
      </View>

      <View style={styles.roomBody}>
        <Text style={[styles.roomName, { color: currentTheme.text }]}>{room.name}</Text>
        {!!featureText && (
          <Text style={[styles.roomDescription, { color: currentTheme.textSecondary }]}>{featureText}</Text>
        )}
        <Text style={[styles.roomAmenityLine, { color: currentTheme.textSecondary }]}>{amenityText}</Text>

        {room.remainingRooms <= 4 && (
          <Text style={styles.stockWarning}>Chỉ còn {room.remainingRooms} phòng</Text>
        )}

        <View style={[styles.roomDivider, { backgroundColor: currentTheme.border }]} />

        <View style={styles.bookingActionRow}>
          <View style={styles.priceBlock}>
            <View style={styles.priceRow}>
              <Text style={[styles.salePrice, { color: currentTheme.text }]}>{formatRoomPrice(displayPrice)}</Text>
              {hasFlashPrice && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{room.discountPercent}%</Text>
                </View>
              )}
            </View>
            {hasFlashPrice && (
              <Text style={styles.originalPrice}>{formatRoomPrice(room.originalPrice)}</Text>
            )}
          </View>
          <Pressable style={styles.bookBtn} onPress={onBook}>
            <Text style={styles.bookBtnText}>Đặt phòng</Text>
          </Pressable>
        </View>

        <View style={styles.benefitsBox}>
          <View style={styles.benefitRow}>
            <Check size={16} color="#374151" />
            <Text style={styles.benefitText}>Tất cả phương thức thanh toán</Text>
          </View>
          <View style={styles.benefitRow}>
            <CreditCard size={16} color="#374151" />
            <Text style={styles.benefitText}>Thanh toán linh hoạt và xác nhận nhanh</Text>
          </View>
          <View style={styles.benefitRow}>
            <Zap size={16} color="#374151" />
            <Text style={styles.benefitText}>Nhận ưu đãi hấp dẫn khi hoàn thành nhận phòng</Text>
          </View>
        </View>

        <Pressable style={styles.policyRow} onPress={onDetail}>
          <AlertCircle size={17} color="#374151" />
          <Text style={[styles.policyText, { color: currentTheme.textSecondary }]}>Chính sách hủy phòng</Text>
          <Text style={styles.detailLink}>Chi tiết phòng</Text>
          <ChevronRight size={17} color={ROOM_LIST_PRIMARY} />
        </Pressable>
      </View>
    </View>
  );
}
