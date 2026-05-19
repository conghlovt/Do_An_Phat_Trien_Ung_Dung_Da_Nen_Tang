import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  FlatList, Modal, Dimensions, Platform, useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/src/customer/shared/theme/ThemeContext';
import { useCustomerBack } from '@/src/customer/shared/navigation/useCustomerBack';
import {
  ChevronLeft, Clock, Zap, ChevronRight, CreditCard,
  AlertCircle, X, Users, LayoutGrid, ChevronDown, ChevronUp,
  Wifi, Wind, Tv, Bath, Coffee,
} from 'lucide-react-native';
import ImageWithFallback from '@/src/customer/shared/ui/ImageWithFallback';
import { hotelsApi, Room } from '@/src/customer/features/hotels/api/hotels.api';

const { width: SCREEN_W } = Dimensions.get('window');
const PRIMARY = '#85c2a4';
const GREEN = '#22c55e';

function getBookingDurationLabel(bookingType?: string, value?: string) {
  const fallback = bookingType === 'Theo ngày' ? '1' : '2';
  const duration = value || fallback;
  return bookingType === 'Theo ngày' ? `${duration} ngày` : `${duration} giờ`;
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi size={12} color="#6b7280" />,
  'Điều hòa': <Wind size={12} color="#6b7280" />,
  TV: <Tv size={12} color="#6b7280" />,
  'Bồn tắm': <Bath size={12} color="#6b7280" />,
  'Cà phê': <Coffee size={12} color="#6b7280" />,
};

export default function RoomListScreen() {
  const router = useRouter();
  const goBack = useCustomerBack('/customer/dashboard');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentTheme } = useThemeContext();
  const params = useLocalSearchParams<{
    hotelId: string;
    hotelName: string;
    bookingType: string;
    checkIn: string;
    checkOut: string;
    hours: string;
  }>();

  const hotelId = Number(params.hotelId) || 1;
  const [activeTab, setActiveTab] = useState<'all' | 'flash'>('all');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const isWebLayout = Platform.OS === 'web' && width >= 768;
  const webImageWidth = Math.min(Math.max(width - 380, 640), 1116);
  const durationLabel = getBookingDurationLabel(params.bookingType, params.hours);

  useEffect(() => {
    setLoading(true);
    hotelsApi.getRooms(hotelId, {
      bookingType: params.bookingType as any,
    })
      .then(({ data }) => setRooms(data))
      .finally(() => setLoading(false));
  }, [hotelId, params.bookingType]);

  const displayedRooms = activeTab === 'flash' ? rooms.filter(r => r.flashSale) : rooms;

  const toggleExpand = (id: string) => {
    setExpandedRooms(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <View style={[styles.container, isWebLayout && styles.webContainer, { paddingTop: isWebLayout ? 0 : insets.top, backgroundColor: currentTheme.background }]}>
      {/* Header */}
      <View style={[styles.header, isWebLayout && styles.webHeader, { backgroundColor: currentTheme.card, borderBottomColor: currentTheme.border }]}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <ChevronLeft size={24} color={currentTheme.text} />
        </Pressable>
        <Text style={[styles.title, { color: currentTheme.text }]}>Danh sách phòng</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Booking Info Card */}
      <View style={[styles.bookingCard, isWebLayout && styles.webPanel, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
        <View style={styles.bookingRow}>
          <Clock size={15} color={PRIMARY} />
          <Text style={[styles.bookingType, { color: currentTheme.text }]}>{params.bookingType || 'Theo giờ'} | {durationLabel}</Text>
          <Pressable
            onPress={() => router.push({
              pathname: '/customer/booking-calendar' as any,
              params: {
                hotelId: String(hotelId),
                hotelName: params.hotelName,
                bookingType: params.bookingType,
                returnTo: 'room-list',
              },
            })}
          >
            <Text style={styles.changeBtn}>Thay đổi</Text>
          </Pressable>
        </View>
        <View style={[styles.bookingDivider, { backgroundColor: currentTheme.border }]} />
        <View style={styles.checkRow}>
          <View>
            <Text style={[styles.checkLabel, { color: currentTheme.textSecondary }]}>Nhận phòng</Text>
            <Text style={[styles.checkTime, { color: currentTheme.text }]}>{params.checkIn}</Text>
          </View>
          <ChevronRight size={16} color="#9ca3af" />
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.checkLabel, { color: currentTheme.textSecondary }]}>Trả phòng</Text>
            <Text style={[styles.checkTime, { color: currentTheme.text }]}>{params.checkOut}</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, isWebLayout && styles.webTabs, { backgroundColor: currentTheme.card, borderBottomColor: currentTheme.border }]}>
        <Pressable
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, { color: currentTheme.textSecondary }, activeTab === 'all' && styles.tabTextActive]}>Tất cả</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'flash' && styles.tabActive]}
          onPress={() => setActiveTab('flash')}
        >
          <View style={styles.tabInner}>
            <Zap size={12} color={activeTab === 'flash' ? PRIMARY : '#6b7280'} fill={activeTab === 'flash' ? PRIMARY : 'none'} />
            <Text style={[styles.tabText, { color: currentTheme.textSecondary }, activeTab === 'flash' && styles.tabTextActive]}>Flash Sale</Text>
          </View>
        </Pressable>
      </View>

      {/* Room List */}
      {loading ? (
        <ScrollView contentContainerStyle={[styles.listContent, isWebLayout && styles.webList]}>
          {[1, 2, 3].map(i => <View key={i} style={[styles.skeletonCard, { backgroundColor: currentTheme.card }]} />)}
        </ScrollView>
      ) : (
        <FlatList
          data={displayedRooms}
          keyExtractor={r => String(r.id)}
          contentContainerStyle={[styles.listContent, isWebLayout && styles.webList]}
          showsVerticalScrollIndicator={isWebLayout}
          renderItem={({ item: room }) => (
            <RoomCard
              room={room}
              expanded={expandedRooms.has(room.id)}
              onToggleExpand={() => toggleExpand(room.id)}
              onBook={() => setSelectedRoom(room)}
              onDetail={() => setSelectedRoom(room)}
              isWebLayout={isWebLayout}
              imageWidth={isWebLayout ? webImageWidth : SCREEN_W - 32}
            />
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>Không có phòng nào phù hợp.</Text>
          }
        />
      )}

      {/* Room Detail Modal */}
      {selectedRoom && (
        <RoomDetailModal
          room={selectedRoom}
          bookingType={params.bookingType}
          checkIn={params.checkIn}
          checkOut={params.checkOut}
          hours={params.hours}
          hotelName={params.hotelName}
          onClose={() => setSelectedRoom(null)}
          onBook={() => {
            setSelectedRoom(null);
            router.push({
              pathname: '/customer/booking-confirm' as any,
              params: {
                hotelId: String(hotelId),
                hotelName: params.hotelName,
                roomId: String(selectedRoom.id),
                roomName: selectedRoom.name,
                price: String(selectedRoom.flashSale ? selectedRoom.price : selectedRoom.originalPrice),
                bookingType: params.bookingType,
                checkIn: params.checkIn,
                checkOut: params.checkOut,
              },
            });
          }}
          insets={insets}
          isWebLayout={isWebLayout}
          imageWidth={isWebLayout ? webImageWidth : SCREEN_W}
        />
      )}
    </View>
  );
}

// ─── Room Card ────────────────────────────────────────────────────────────────

function RoomCard({
  room, expanded, onToggleExpand, onBook, onDetail, isWebLayout, imageWidth,
}: {
  room: Room;
  expanded: boolean;
  onToggleExpand: () => void;
  onBook: () => void;
  onDetail: () => void;
  isWebLayout: boolean;
  imageWidth: number;
}) {
  const [imgIndex, setImgIndex] = useState(0);
  const { currentTheme } = useThemeContext();
  const flashPrice = room.flashSale;

  return (
    <View style={[styles.roomCard, isWebLayout && styles.webRoomCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
      {/* Image Slider */}
      <View style={styles.roomImageWrap}>
        <ScrollView
          horizontal pagingEnabled showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={e => setImgIndex(Math.round(e.nativeEvent.contentOffset.x / imageWidth))}
        >
          {room.images.map((img, i) => (
            <ImageWithFallback
              key={i} uri={img}
              style={{ width: imageWidth, height: isWebLayout ? 240 : 200 }}
              alt={room.name}
            />
          ))}
        </ScrollView>
        {room.images.length > 1 && (
          <View style={styles.imgDots}>
            {room.images.map((_, i) => (
              <View key={i} style={[styles.imgDot, i === imgIndex && styles.imgDotActive]} />
            ))}
          </View>
        )}
        {flashPrice && (
          <View style={styles.flashBadge}>
            <Zap size={10} color="#fff" fill="#fff" />
            <Text style={styles.flashBadgeText}>Flash Sale</Text>
          </View>
        )}
      </View>

      {/* Room Info */}
      <View style={styles.roomBody}>
        <Text style={[styles.roomName, { color: currentTheme.text }]}>{room.name}</Text>
        <View style={styles.roomMeta}>
          <View style={styles.metaItem}>
            <LayoutGrid size={12} color="#6b7280" />
            <Text style={[styles.metaText, { color: currentTheme.textSecondary }]}>{room.area}m²</Text>
          </View>
          <View style={styles.metaItem}>
            <Users size={12} color="#6b7280" />
            <Text style={[styles.metaText, { color: currentTheme.textSecondary }]}>{room.beds}</Text>
          </View>
        </View>

        {/* Stock warning */}
        {room.remainingRooms <= 4 && (
          <Text style={styles.stockWarning}>Chỉ còn {room.remainingRooms} phòng</Text>
        )}

        {/* Flash Sale Price */}
        {flashPrice && (
          <View style={styles.priceBlock}>
            <View style={styles.priceRow}>
              <Text style={[styles.salePrice, { color: currentTheme.text }]}>{room.price.toLocaleString('vi-VN')}đ</Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{room.discountPercent}%</Text>
              </View>
            </View>
            <Text style={styles.originalPrice}>{room.originalPrice.toLocaleString('vi-VN')}đ</Text>
          </View>
        )}

        {/* First book button (Flash Sale) */}
        {flashPrice && (
          <>
            <Pressable style={styles.bookBtn} onPress={onBook}>
              <Text style={styles.bookBtnText}>Đặt phòng</Text>
            </Pressable>
            <View style={styles.paymentRow}>
              <CreditCard size={13} color="#374151" />
              <Text style={[styles.paymentText, { color: currentTheme.textSecondary }]}>Thanh toán trả trước</Text>
            </View>
            <Pressable style={styles.policyRow} onPress={onDetail}>
              <AlertCircle size={13} color="#374151" />
              <Text style={[styles.policyText, { color: currentTheme.textSecondary }]}>Chính sách hủy phòng</Text>
              <Text style={styles.detailLink}>Chi tiết phòng</Text>
              <ChevronRight size={13} color={PRIMARY} />
            </Pressable>
          </>
        )}

        {/* Collapse/Expand for full price */}
        {!expanded ? null : (
          <View style={[styles.altPriceBlock, { borderTopColor: currentTheme.border }]}>
            <View style={styles.altPriceRow}>
              <Text style={styles.stockWarning}>Chỉ còn {room.remainingRooms} phòng</Text>
              <Pressable style={styles.bookBtnSecondary} onPress={onBook}>
                <Text style={styles.bookBtnText}>Đặt phòng</Text>
              </Pressable>
            </View>
            <Text style={[styles.originalPriceStandalone, { color: currentTheme.text }]}>{room.originalPrice.toLocaleString('vi-VN')}đ</Text>
            <View style={styles.paymentRow}>
              <View style={styles.checkIcon}><Text style={{ color: '#fff', fontSize: 9 }}>✓</Text></View>
              <Text style={[styles.paymentText, { color: currentTheme.textSecondary }]}>Tất cả phương thức thanh toán</Text>
            </View>
            <Pressable style={styles.policyRow} onPress={onDetail}>
              <AlertCircle size={13} color="#374151" />
              <Text style={[styles.policyText, { color: currentTheme.textSecondary }]}>Chính sách hủy phòng</Text>
              <Text style={styles.detailLink}>Chi tiết phòng</Text>
              <ChevronRight size={13} color={PRIMARY} />
            </Pressable>
          </View>
        )}

        <Pressable style={styles.collapseRow} onPress={onToggleExpand}>
          <Text style={styles.collapseText}>{expanded ? 'Thu gọn' : 'Xem thêm'}</Text>
          {expanded ? <ChevronUp size={14} color={PRIMARY} /> : <ChevronDown size={14} color={PRIMARY} />}
        </Pressable>
      </View>
    </View>
  );
}

// ─── Room Detail Modal ────────────────────────────────────────────────────────

function RoomDetailModal({
  room, bookingType, checkIn, checkOut, hours, hotelName,
  onClose, onBook, insets, isWebLayout, imageWidth,
}: {
  room: Room;
  bookingType?: string;
  checkIn?: string;
  checkOut?: string;
  hours?: string;
  hotelName?: string;
  onClose: () => void;
  onBook: () => void;
  insets: { bottom: number; top: number };
  isWebLayout: boolean;
  imageWidth: number;
}) {
  const { currentTheme } = useThemeContext();
  const durationLabel = getBookingDurationLabel(bookingType, hours);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalContainer, isWebLayout && styles.webModalContainer, { paddingTop: isWebLayout ? 0 : insets.top, backgroundColor: currentTheme.background }]}>
        {/* Modal Header */}
        <View style={[styles.modalHeader, isWebLayout && styles.webModalHeader, { backgroundColor: currentTheme.card, borderBottomColor: currentTheme.border }]}>
          <Pressable onPress={onClose}><X size={24} color={currentTheme.text} /></Pressable>
          <Text style={[styles.modalTitle, { color: currentTheme.text }]}>Chi tiết phòng</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={isWebLayout} contentContainerStyle={[styles.modalScrollContent, isWebLayout && styles.webModalScrollContent]}>
          {/* Room Images */}
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {room.images.map((img, i) => (
              <ImageWithFallback key={i} uri={img} style={{ width: imageWidth, height: isWebLayout ? 320 : 260 }} alt={room.name} />
            ))}
          </ScrollView>

          <View style={[styles.modalBody, isWebLayout && styles.webModalBody]}>
            {/* Room Name & Info */}
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

            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <View style={styles.amenitiesBlock}>
                <Text style={[styles.modalSectionTitle, { color: currentTheme.text }]}>Tiện nghi phòng</Text>
                <View style={styles.amenitiesRow}>
                  {room.amenities.map(a => (
                    <View key={a} style={styles.amenityChip}>
                      {AMENITY_ICONS[a] || <Wifi size={12} color="#6b7280" />}
                      <Text style={[styles.amenityChipText, { color: currentTheme.textSecondary }]}>{a}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Booking Detail */}
            <View style={[styles.bookingDetailCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
              <View style={styles.bookingDetailRow}>
                <Clock size={14} color={PRIMARY} />
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

            {/* Price Options */}
            <Text style={[styles.modalSectionTitle, { color: currentTheme.text }]}>Chọn giá</Text>

            {/* Flash Sale Option */}
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

            {/* Standard Option */}
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

            {/* Cancellation */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  webContainer: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  webHeader: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingTop: 18,
    paddingBottom: 18,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#111827' },

  // Booking Card
  bookingCard: {
    margin: 12, borderRadius: 14, borderWidth: 1, borderColor: '#fde8d8',
    backgroundColor: '#fff8f5', padding: 14, gap: 10,
  },
  webPanel: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    marginHorizontal: 0,
    marginTop: 18,
    marginBottom: 12,
    paddingHorizontal: 18,
  },
  bookingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bookingType: { flex: 1, fontSize: 14, fontWeight: '600', color: '#374151' },
  changeBtn: { color: PRIMARY, fontSize: 13, fontWeight: '700' },
  bookingDivider: { height: 1, backgroundColor: '#fde8d8' },
  checkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  checkLabel: { fontSize: 11, color: '#9ca3af', marginBottom: 2 },
  checkTime: { fontSize: 15, fontWeight: '700', color: '#111827' },

  // Tabs
  tabs: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
    paddingHorizontal: 12,
  },
  webTabs: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 32,
    borderRadius: 14,
    borderWidth: 1,
  },
  tab: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: PRIMARY },
  tabInner: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tabText: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  tabTextActive: { color: PRIMARY, fontWeight: '700' },

  // Room Card
  roomCard: {
    borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#f3f4f6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
    shadowRadius: 8, elevation: 2,
  },
  webRoomCard: {
    alignSelf: 'center',
    width: '100%',
  },
  roomImageWrap: { position: 'relative' },
  roomImage: { height: 200 },
  imgDots: { position: 'absolute', bottom: 8, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 4 },
  imgDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  imgDotActive: { backgroundColor: '#fff', width: 14 },
  flashBadge: {
    position: 'absolute', top: 10, left: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: PRIMARY, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  flashBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  roomBody: { padding: 14 },
  roomName: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 8 },
  roomMeta: { flexDirection: 'row', gap: 14, marginBottom: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#6b7280' },
  metaTextLg: { fontSize: 14, color: '#6b7280' },
  stockWarning: { color: PRIMARY, fontSize: 12, fontWeight: '600', marginBottom: 8 },

  // Price
  priceBlock: { marginBottom: 10 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  salePrice: { fontSize: 22, fontWeight: '800', color: '#111827' },
  discountBadge: { backgroundColor: GREEN, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  discountText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  originalPrice: { fontSize: 13, color: '#9ca3af', textDecorationLine: 'line-through' },
  originalPriceStandalone: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },

  bookBtn: {
    backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', marginBottom: 10,
  },
  bookBtnSecondary: {
    backgroundColor: PRIMARY, borderRadius: 12, paddingVertical: 12,
    paddingHorizontal: 18, alignItems: 'center',
  },
  bookBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  paymentText: { fontSize: 13, color: '#374151' },
  paymentTextSm: { fontSize: 12, color: '#6b7280' },
  policyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  policyText: { fontSize: 13, color: '#374151', flex: 1 },
  detailLink: { color: PRIMARY, fontSize: 13, fontWeight: '600' },
  checkIcon: {
    width: 14, height: 14, borderRadius: 7, backgroundColor: '#22c55e',
    alignItems: 'center', justifyContent: 'center',
  },

  // Alt price
  altPriceBlock: { borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12, marginTop: 4 },
  altPriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  collapseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 12 },
  collapseText: { color: PRIMARY, fontSize: 13, fontWeight: '600' },

  skeletonCard: { height: 300, backgroundColor: '#f3f4f6', borderRadius: 16 },
  listContent: { padding: 16, gap: 16 },
  webList: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingTop: 18,
    paddingBottom: 52,
  },
  emptyText: { textAlign: 'center', color: '#9ca3af', marginTop: 40, fontSize: 14 },

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  webModalContainer: {
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  webModalHeader: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingTop: 18,
    paddingBottom: 18,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  modalImage: { height: 260 },
  modalBody: { padding: 16 },
  modalScrollContent: { paddingBottom: 120 },
  webModalScrollContent: {
    alignItems: 'center',
    paddingBottom: 64,
  },
  webModalBody: {
    width: '100%',
    maxWidth: 1180,
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  modalRoomName: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 10 },
  modalSectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },

  // Amenities
  amenitiesBlock: { marginVertical: 14 },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#f9fafb', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7,
    borderWidth: 1, borderColor: '#f3f4f6',
  },
  amenityChipText: { fontSize: 12, color: '#374151' },

  // Booking detail card
  bookingDetailCard: {
    borderRadius: 14, borderWidth: 1, borderColor: '#fde8d8',
    backgroundColor: '#fff8f5', padding: 14, marginBottom: 20, gap: 10,
  },
  bookingDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bookingDetailType: { fontSize: 14, fontWeight: '600', color: '#374151' },
  checkDetailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  checkLabelSm: { fontSize: 11, color: '#9ca3af', marginBottom: 2 },
  checkTimeSm: { fontSize: 14, fontWeight: '700', color: '#111827' },

  // Price option
  priceOption: {
    borderRadius: 14, borderWidth: 1, borderColor: '#f3f4f6',
    padding: 14, marginBottom: 12, gap: 10,
  },
  priceOptionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  flashTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: PRIMARY, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
  },
  flashTagText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  remainingText: { color: PRIMARY, fontSize: 12, fontWeight: '600' },
  priceOptionBody: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  salePriceLg: { fontSize: 20, fontWeight: '800', color: '#111827' },
  originalPriceSm: { fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through', marginBottom: 4 },
  bookBtnModal: {
    backgroundColor: PRIMARY, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 18,
    alignItems: 'center',
  },

  cancelSection: { paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f9fafb' },
  cancelText: { fontSize: 14, color: '#6b7280', lineHeight: 22 },
});
