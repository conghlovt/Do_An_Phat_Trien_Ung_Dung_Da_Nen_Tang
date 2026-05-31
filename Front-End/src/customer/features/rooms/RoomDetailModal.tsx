import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import {
  Bath,
  ChevronRight,
  Clock,
  Coffee,
  CreditCard,
  LayoutGrid,
  Tv,
  Users,
  Wifi,
  Wind,
  X,
  Zap,
} from 'lucide-react-native';
import ImageWithFallback from '@/src/customer/components/common/ImageWithFallback';
import { ROOM_LIST_PRIMARY } from '@/src/customer/constants/rooms/roomList';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import type { Room } from '@/src/customer/services/hotels/hotels.api';
import { getBookingDurationLabel } from '@/src/customer/utils/rooms/roomDisplay';
import { roomListStyles as styles } from '@/src/customer/styles/rooms/roomList.styles';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi size={12} color="#6b7280" />,
  'Điều hòa': <Wind size={12} color="#6b7280" />,
  TV: <Tv size={12} color="#6b7280" />,
  'Bồn tắm': <Bath size={12} color="#6b7280" />,
  'Cà phê': <Coffee size={12} color="#6b7280" />,
};

interface RoomDetailModalProps {
  room: Room;
  bookingType?: string;
  checkIn?: string;
  checkOut?: string;
  hours?: string;
  onClose: () => void;
  onBook: () => void;
  insets: { bottom: number; top: number };
  isWebLayout: boolean;
  imageWidth: number;
}

export default function RoomDetailModal({
  room,
  bookingType,
  checkIn,
  checkOut,
  hours,
  onClose,
  onBook,
  insets,
  isWebLayout,
  imageWidth,
}: RoomDetailModalProps) {
  const { currentTheme } = useThemeContext();
  const durationLabel = getBookingDurationLabel(bookingType, hours);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalContainer, isWebLayout && styles.webModalContainer, { paddingTop: isWebLayout ? 0 : insets.top, backgroundColor: currentTheme.background }]}>
        <View style={[styles.modalHeader, isWebLayout && styles.webModalHeader, { backgroundColor: currentTheme.card, borderBottomColor: currentTheme.border }]}>
          <Pressable onPress={onClose}><X size={24} color={currentTheme.text} /></Pressable>
          <Text style={[styles.modalTitle, { color: currentTheme.text }]}>Chi tiết phòng</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={isWebLayout} contentContainerStyle={[styles.modalScrollContent, isWebLayout && styles.webModalScrollContent]}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {room.images.map((img, index) => (
              <ImageWithFallback
                key={`${img}-${index}`}
                uri={img}
                style={{ width: imageWidth, height: isWebLayout ? 320 : 260 }}
                alt={room.name}
              />
            ))}
          </ScrollView>

          <View style={[styles.modalBody, isWebLayout && styles.webModalBody]}>
            <Text style={[styles.modalRoomName, { color: currentTheme.text }]}>{room.name}</Text>
            <View style={styles.roomMeta}>
              <View style={styles.metaItem}>
                <LayoutGrid size={14} color="#6b7280" />
                <Text style={[styles.metaTextLg, { color: currentTheme.textSecondary }]}>{room.area}m²</Text>
              </View>
              <View style={styles.metaItem}>
                <Users size={14} color="#6b7280" />
                <Text style={[styles.metaTextLg, { color: currentTheme.textSecondary }]}>{room.beds}</Text>
              </View>
            </View>

            {room.amenities && room.amenities.length > 0 && (
              <View style={styles.amenitiesBlock}>
                <Text style={[styles.modalSectionTitle, { color: currentTheme.text }]}>Tiện nghi phòng</Text>
                <View style={styles.amenitiesRow}>
                  {room.amenities.map(amenity => (
                    <View key={amenity} style={styles.amenityChip}>
                      {AMENITY_ICONS[amenity] || <Wifi size={12} color="#6b7280" />}
                      <Text style={[styles.amenityChipText, { color: currentTheme.textSecondary }]}>{amenity}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={[styles.bookingDetailCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
              <View style={styles.bookingDetailRow}>
                <Clock size={14} color={ROOM_LIST_PRIMARY} />
                <Text style={[styles.bookingDetailType, { color: currentTheme.text }]}>{bookingType} | {durationLabel}</Text>
              </View>
              <View style={styles.checkDetailRow}>
                <View>
                  <Text style={[styles.checkLabelSm, { color: currentTheme.textSecondary }]}>Nhận phòng</Text>
                  <Text style={[styles.checkTimeSm, { color: currentTheme.text }]}>{checkIn}</Text>
                </View>
                <ChevronRight size={14} color="#9ca3af" />
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.checkLabelSm, { color: currentTheme.textSecondary }]}>Trả phòng</Text>
                  <Text style={[styles.checkTimeSm, { color: currentTheme.text }]}>{checkOut}</Text>
                </View>
              </View>
            </View>

            <Text style={[styles.modalSectionTitle, { color: currentTheme.text }]}>Chọn giá</Text>

            {room.flashSale && (
              <View style={[styles.priceOption, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
                <View style={styles.priceOptionHeader}>
                  <View style={styles.flashTag}>
                    <Zap size={11} color="#fff" fill="#fff" />
                    <Text style={styles.flashTagText}>Flash Sale</Text>
                  </View>
                  <Text style={styles.remainingText}>Chỉ còn {room.remainingRooms} phòng</Text>
                </View>
                <View style={styles.priceOptionBody}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={[styles.salePriceLg, { color: currentTheme.text }]}>{room.price.toLocaleString('vi-VN')}đ</Text>
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{room.discountPercent}%</Text>
                      </View>
                    </View>
                    <Text style={styles.originalPriceSm}>{room.originalPrice.toLocaleString('vi-VN')}đ</Text>
                    <View style={styles.paymentRow}>
                      <CreditCard size={12} color="#6b7280" />
                      <Text style={[styles.paymentTextSm, { color: currentTheme.textSecondary }]}>Thanh toán trả trước</Text>
                    </View>
                  </View>
                  <Pressable style={styles.bookBtnModal} onPress={onBook}>
                    <Text style={styles.bookBtnText}>Đặt phòng</Text>
                  </Pressable>
                </View>
              </View>
            )}

            <View style={[styles.priceOption, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
              <View style={styles.priceOptionHeader}>
                <Text style={styles.remainingText}>Chỉ còn {room.remainingRooms} phòng</Text>
              </View>
              <View style={styles.priceOptionBody}>
                <View>
                  <Text style={[styles.salePriceLg, { color: currentTheme.text }]}>{room.originalPrice.toLocaleString('vi-VN')}đ</Text>
                  <View style={styles.paymentRow}>
                    <View style={styles.checkIcon}><Text style={{ color: '#fff', fontSize: 9 }}>✓</Text></View>
                    <Text style={[styles.paymentTextSm, { color: currentTheme.textSecondary }]}>Tất cả phương thức thanh toán</Text>
                  </View>
                </View>
                <Pressable style={styles.bookBtnModal} onPress={onBook}>
                  <Text style={styles.bookBtnText}>Đặt phòng</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.cancelSection}>
              <Text style={[styles.modalSectionTitle, { color: currentTheme.text }]}>Chính sách hủy phòng</Text>
              <Text style={[styles.cancelText, { color: currentTheme.textSecondary }]}>Việc hủy phòng sẽ tuân theo quy định riêng của từng loại phòng và thời điểm đặt.</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
