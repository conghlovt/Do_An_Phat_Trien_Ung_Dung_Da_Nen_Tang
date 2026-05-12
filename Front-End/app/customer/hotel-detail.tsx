import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Dimensions, Animated, Modal, FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/src/customer/utils/ThemeContext';
import {
  ChevronLeft, MessageCircle, Heart, Share2,
  Star, Flame, MapPin, Phone, Clock, ChevronRight,
  Shield, X, Wifi, Wind, Tv, Bath, Coffee, Car,
} from 'lucide-react-native';
import ImageWithFallback from '@/src/customer/components/figma/ImageWithFallback';
import { hotelsApi, Hotel } from '@/src/customer/api/hotels.api';

const { width: SCREEN_W } = Dimensions.get('window');
const PRIMARY = '#85c2a4';
const PRIMARY_LIGHT = '#e8f6ed';
const STAR_COLOR = '#facc15';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi size={14} color={PRIMARY} />,
  'Điều hòa': <Wind size={14} color={PRIMARY} />,
  TV: <Tv size={14} color={PRIMARY} />,
  'Bồn tắm': <Bath size={14} color={PRIMARY} />,
  'Cà phê': <Coffee size={14} color={PRIMARY} />,
  'Bãi đỗ xe': <Car size={14} color={PRIMARY} />,
};

// Mock hotel detail enricher
function enrichHotel(hotel: Hotel): Hotel {
  return {
    ...hotel,
    images: [
      hotel.image,
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    ],
    phone: '0845 795 656',
    address: 'Căn hộ số 30-N7B, Khu đô thị Trung Hòa-Nhân Chính, phường Nhân Chính, quận Thanh Xuân, Hà Nội',
    description: 'Mọi vấn đề liên quan đến khách sạn, quý khách vui lòng gọi điện theo số hotline của chúng tôi.',
    amenities: ['WiFi', 'Điều hòa', 'TV', 'Bồn tắm', 'Cà phê'],
    checkInHour: { start: '08:00', end: '22:00' },
    checkInOvernight: { start: '22:00', end: '10:00' },
    checkInDay: { start: '14:00', end: '12:00' },
  };
}

const MOCK_REVIEWS = [
  { id: 1, name: 'Ninh', tag: 'ALL ROOM', rating: 5, text: 'Phòng sạch sẽ, thơm tho' },
  { id: 2, name: 'An', tag: 'LOVE ROOM', rating: 5, text: 'Phòng đẹp, nhân viên thân thiện, sẽ quay lại' },
  { id: 3, name: 'Minh', tag: 'ALL ROOM', rating: 4, text: 'Giá tốt, vị trí thuận tiện' },
];

const SUGGESTED = [
  {
    id: 10, name: 'Vy House Hotel', rating: 4.9, reviews: 1153,
    location: 'Thanh Xuân', price: '250.000đ', unit: '/ 2 giờ',
    discount: 'Mã giảm 28K',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400',
  },
  {
    id: 11, name: 'Lavie Hotel', rating: 4.9, reviews: 1307,
    location: 'Thanh Xuân', price: '199.000đ', unit: '/ 2 giờ',
    discount: 'Flash Sale',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400',
  },
];

export default function HotelDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentTheme, isDarkMode } = useThemeContext();
  const params = useLocalSearchParams<{ id: string; bookingType?: string }>();
  const hotelId = params.id || '1';

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Booking state from previous screen
  const [bookingType] = useState(params.bookingType || 'Theo giờ');
  // Default: 2 hours, today 17:30
  const now = new Date();
  const defaultCheckIn = `17:30, ${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}`;
  const defaultCheckOut = `19:30, ${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}`;
  const [checkIn] = useState(defaultCheckIn);
  const [checkOut] = useState(defaultCheckOut);
  const [hours] = useState(2);

  useEffect(() => {
    hotelsApi.getById()
      .then(({ data }) => setHotel(enrichHotel(data)))
      .catch(() => {
        // Use mock hotel
        const mockHotel: Hotel = {
          id: hotelId, name: 'Min Hotel', rating: 4.9, reviews: 4773,
          location: 'Nhân Chính, Thanh Xuân', district: 'Thanh Xuân',
          discount: 'Mã giảm 28K', price: '199.999đ', priceValue: 199999,
          unit: '/ 2 giờ', oldPrice: '300.000đ',
          image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
          badge: 'Nổi bật', tags: ['Flash Sale'],
        };
        setHotel(enrichHotel(mockHotel));
      })
      .finally(() => setLoading(false));
  }, [hotelId]);

  const headerOpacity = scrollY.interpolate({ inputRange: [180, 220], outputRange: [0, 1], extrapolate: 'clamp' });

  if (loading || !hotel) {
    return <View style={styles.loadingContainer}><View style={styles.skeleton} /></View>;
  }

  const images = hotel.images || [hotel.image];

  return (
    <View style={styles.container}>
      {/* Floating transparent header */}
      <View style={[styles.floatingHeader, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <ChevronLeft size={24} color="#1f2937" />
        </Pressable>
        <Animated.View style={[styles.headerTitle, { opacity: headerOpacity }]}>
          <Text style={styles.headerTitleText} numberOfLines={1}>{hotel.name}</Text>
        </Animated.View>
        <View style={styles.iconRow}>
          <Pressable style={styles.iconBtn}><MessageCircle size={22} color="#1f2937" /></Pressable>
          <Pressable style={styles.iconBtn} onPress={() => setLiked(l => !l)}>
            <Heart size={22} color={liked ? '#ef4444' : '#1f2937'} fill={liked ? '#ef4444' : 'none'} />
          </Pressable>
          <Pressable style={styles.iconBtn}><Share2 size={22} color="#1f2937" /></Pressable>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Image Gallery */}
        <View style={styles.galleryContainer}>
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => setCurrentImage(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))}
          >
            {images.map((img, i) => (
              <ImageWithFallback key={i} uri={img} style={styles.galleryImage} alt={hotel.name} />
            ))}
          </ScrollView>
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>{images.length} ảnh</Text>
          </View>
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View key={i} style={[styles.dot, currentImage === i && styles.dotActive]} />
            ))}
          </View>
          {/* Thumbnails */}
          <View style={styles.thumbnailRow}>
            {images.slice(0, 3).map((img, i) => (
              <ImageWithFallback key={i} uri={img} style={styles.thumbnail} alt="" />
            ))}
            {images.length > 3 && (
              <View style={styles.thumbnailMore}>
                <Text style={styles.thumbnailMoreText}>+{images.length - 3}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoCard}>
          {/* Rating & Badge */}
          <View style={styles.ratingRow}>
            <Star size={18} color={STAR_COLOR} fill={STAR_COLOR} />
            <Text style={styles.ratingScore}>{hotel.rating}</Text>
            <Text style={styles.ratingCount}>({hotel.reviews})</Text>
            {hotel.badge && (
              <View style={styles.badge}>
                <Flame size={12} color={PRIMARY} />
                <Text style={styles.badgeText}>{hotel.badge}</Text>
              </View>
            )}
          </View>

          <Text style={styles.hotelName}>{hotel.name}</Text>

          <View style={styles.addressRow}>
            <MapPin size={13} color="#6b7280" />
            <Text style={styles.addressText} numberOfLines={2}>{hotel.address}</Text>
          </View>
          <Pressable style={styles.mapBtn}>
            <Text style={styles.mapBtnText}>Xem bản đồ</Text>
            <ChevronRight size={14} color={PRIMARY} />
          </Pressable>
        </View>

        {/* Member Perks */}
        <View style={styles.perksCard}>
          <View style={styles.perkRow}>
            <View style={styles.perkIcon}><Text>🎫</Text></View>
            <Text style={styles.perkText}>Nhận <Text style={styles.perkHighlight}>1 tem</Text> khi hoàn thành đặt phòng</Text>
          </View>
          <View style={styles.perkRow}>
            <View style={styles.perkIcon}><Text>🏷️</Text></View>
            <Text style={styles.perkText}>Nhiều mã ưu đãi hấp dẫn dành cho thành viên đăng ký</Text>
          </View>
        </View>

        {/* Rating Summary */}
        <View style={styles.section}>
          <View style={styles.ratingSummary}>
            <Text style={styles.bigScore}>{hotel.rating}</Text>
            <View>
              <Text style={styles.ratingLabel}>Tuyệt vời</Text>
              <Text style={styles.ratingSubLabel}>{hotel.reviews} đánh giá</Text>
            </View>
          </View>
          {/* Review cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {MOCK_REVIEWS.map(r => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>👤</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewName}>{r.name}</Text>
                    <Text style={styles.reviewTag}>{r.tag}</Text>
                  </View>
                  <View style={styles.reviewStars}>
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={12} color={STAR_COLOR} fill={STAR_COLOR} />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewText}>{r.text}</Text>
              </View>
            ))}
          </ScrollView>
          <Pressable style={styles.viewAllBtn} onPress={() => setShowAllReviews(true)}>
            <Text style={styles.viewAllText}>Xem tất cả</Text>
            <ChevronRight size={14} color={PRIMARY} />
          </Pressable>
        </View>

        {/* Hotel Info */}
        <View style={styles.sectionDivider}>
          <Text style={styles.sectionTitle}>Giới thiệu</Text>
          <Text style={styles.descText}>{hotel.description}</Text>
          {hotel.phone && (
            <Pressable style={styles.phoneRow}>
              <Phone size={14} color={PRIMARY} />
              <Text style={styles.phoneText}>{hotel.phone}</Text>
            </Pressable>
          )}
        </View>

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <View style={styles.sectionDivider}>
            <Text style={styles.sectionTitle}>Tiện nghi</Text>
            <View style={styles.amenitiesGrid}>
              {hotel.amenities.map(a => (
                <View key={a} style={styles.amenityItem}>
                  {AMENITY_ICONS[a] || <Shield size={14} color={PRIMARY} />}
                  <Text style={styles.amenityText}>{a}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Check-in/out Hours */}
        <View style={styles.sectionDivider}>
          <Text style={styles.sectionTitle}>Giờ nhận phòng/trả phòng</Text>
          <View style={styles.hoursTable}>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursLabel}>Theo giờ</Text>
              <Text style={styles.hoursValue}>Từ 08:00 đến 22:00</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursLabel}>Qua đêm</Text>
              <Text style={styles.hoursValue}>Từ 22:00 đến 10:00</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursLabel}>Theo ngày</Text>
              <Text style={styles.hoursValue}>Từ 14:00 đến 12:00</Text>
            </View>
          </View>
        </View>

        {/* Cancellation Policy */}
        <View style={styles.sectionDivider}>
          <Text style={styles.sectionTitle}>Chính sách huỷ phòng</Text>
          <Text style={styles.descText}>Việc hủy phòng sẽ tuân theo quy định riêng của từng loại phòng và thời điểm đặt.</Text>
        </View>

        {/* Chat */}
        <View style={styles.sectionDivider}>
          <Text style={styles.chatPrompt}>Bạn có thắc mắc cần được giải đáp? Hãy nhắn tin cho khách sạn ngay để được hỗ trợ nhé!</Text>
          <Pressable style={styles.chatBtn}>
            <MessageCircle size={16} color={PRIMARY} />
            <Text style={styles.chatBtnText}>Chat với khách sạn</Text>
          </Pressable>
        </View>

        {/* Suggestions */}
        <View style={styles.sectionDivider}>
          <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
          <View style={styles.suggestRow}>
            {SUGGESTED.map(s => (
              <Pressable key={s.id} style={styles.suggestCard}
                onPress={() => router.push({ pathname: '/customer/hotel-detail' as any, params: { id: String(s.id) } })}>
                <ImageWithFallback uri={s.image} style={styles.suggestImage} alt={s.name} />
                <Text style={styles.suggestName} numberOfLines={1}>{s.name}</Text>
                <View style={styles.suggestMeta}>
                  <Star size={11} color={STAR_COLOR} fill={STAR_COLOR} />
                  <Text style={styles.suggestRating}>{s.rating}</Text>
                  <Text style={styles.suggestReviews}>({s.reviews}) • {s.location}</Text>
                </View>
                <View style={styles.suggestDiscount}>
                  <Text style={styles.suggestDiscountText}>{s.discount}</Text>
                </View>
                <Text style={styles.suggestPrice}>{s.price} <Text style={styles.suggestUnit}>{s.unit}</Text></Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.bottomBarInner}>
          <Pressable style={styles.timeChip} onPress={() =>
            router.push({
              pathname: '/customer/booking-calendar' as any,
              params: { hotelId: String(hotelId), bookingType, returnTo: 'hotel-detail' },
            })
          }>
            <Clock size={14} color="#374151" />
            <Text style={styles.timeText}>{hours} giờ | {checkIn} → {checkOut}</Text>
          </Pressable>

          <View style={styles.priceArea}>
            <Text style={styles.oldPriceBottom}>{hotel.oldPrice}</Text>
            <Text style={styles.priceBottom}>{hotel.price}</Text>
          </View>

          <Pressable
            style={styles.bookBtn}
            onPress={() => router.push({
              pathname: '/customer/room-list' as any,
              params: {
                hotelId: String(hotelId),
                hotelName: hotel.name,
                bookingType,
                checkIn,
                checkOut,
                hours: String(hours),
              },
            })}
          >
            <Text style={styles.bookBtnText}>Chọn phòng</Text>
          </Pressable>
        </View>
      </View>

      {/* All Reviews Modal */}
      <Modal visible={showAllReviews} animationType="slide" onRequestClose={() => setShowAllReviews(false)}>
        <View style={[styles.reviewsModal, { paddingTop: insets.top }]}>
          <View style={styles.reviewsModalHeader}>
            <Text style={styles.reviewsModalTitle}>Đánh giá</Text>
            <Pressable onPress={() => setShowAllReviews(false)}><X size={24} color="#374151" /></Pressable>
          </View>
          <FlatList
            data={MOCK_REVIEWS}
            keyExtractor={r => String(r.id)}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            renderItem={({ item: r }) => (
              <View style={styles.reviewCardFull}>
                <View style={styles.reviewHeader}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>👤</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewName}>{r.name}</Text>
                    <Text style={styles.reviewTag}>{r.tag}</Text>
                  </View>
                  <View style={styles.reviewStars}>
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={14} color={STAR_COLOR} fill={STAR_COLOR} />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewText}>{r.text}</Text>
              </View>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, backgroundColor: '#f3f4f6' },
  skeleton: { flex: 1, backgroundColor: '#e5e7eb' },

  floatingHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  headerTitle: { flex: 1, alignItems: 'center' },
  headerTitleText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)' },
  iconRow: { flexDirection: 'row', gap: 4 },

  // Gallery
  galleryContainer: { position: 'relative' },
  galleryImage: { width: SCREEN_W, height: 240 },
  imageCounter: {
    position: 'absolute', bottom: 72, right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  imageCounterText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  dots: {
    position: 'absolute', bottom: 56, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff', width: 16 },
  thumbnailRow: {
    flexDirection: 'row', height: 54, gap: 2,
    backgroundColor: '#000',
  },
  thumbnail: { flex: 1, height: 54 },
  thumbnailMore: {
    flex: 1, height: 54, backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  thumbnailMoreText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Info
  infoCard: { padding: 16 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  ratingScore: { fontSize: 15, fontWeight: '700', color: '#111827' },
  ratingCount: { fontSize: 13, color: '#6b7280' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: PRIMARY_LIGHT, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    marginLeft: 'auto',
  },
  badgeText: { color: PRIMARY, fontSize: 12, fontWeight: '700' },
  hotelName: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  addressText: { fontSize: 13, color: '#6b7280', flex: 1, lineHeight: 20 },
  mapBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  mapBtnText: { color: PRIMARY, fontSize: 13, fontWeight: '600' },

  // Perks
  perksCard: { marginHorizontal: 16, marginBottom: 16, borderRadius: 14, borderWidth: 1, borderColor: '#f3f4f6', padding: 14, gap: 10 },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  perkIcon: { width: 28, alignItems: 'center' },
  perkText: { fontSize: 13, color: '#374151', flex: 1 },
  perkHighlight: { color: '#22c55e', fontWeight: '700' },

  // Sections
  section: { padding: 16 },
  sectionDivider: { padding: 16, borderTopWidth: 8, borderTopColor: '#f9fafb' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 12 },
  descText: { fontSize: 14, color: '#6b7280', lineHeight: 22 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  phoneText: { color: PRIMARY, fontSize: 14, fontWeight: '600' },

  // Rating
  ratingSummary: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bigScore: { fontSize: 48, fontWeight: '800', color: '#111827' },
  ratingLabel: { fontSize: 18, fontWeight: '700', color: '#111827' },
  ratingSubLabel: { fontSize: 13, color: '#6b7280' },
  reviewCard: {
    width: 220, backgroundColor: '#f9fafb', borderRadius: 14, padding: 14, marginRight: 10,
  },
  reviewCardFull: { backgroundColor: '#f9fafb', borderRadius: 14, padding: 14 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18 },
  reviewName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  reviewTag: { fontSize: 11, color: '#6b7280' },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewText: { fontSize: 13, color: '#374151', lineHeight: 20 },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12 },
  viewAllText: { color: PRIMARY, fontSize: 13, fontWeight: '600' },

  // Amenities
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityItem: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(133,194,164,0.1)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  amenityText: { fontSize: 13, color: '#374151' },

  // Hours
  hoursTable: { gap: 12 },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between' },
  hoursLabel: { fontSize: 14, color: '#374151' },
  hoursValue: { fontSize: 14, color: '#374151', fontWeight: '500' },

  // Chat
  chatPrompt: { fontSize: 14, color: '#374151', marginBottom: 12, lineHeight: 22 },
  chatBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: '#F97316', borderRadius: 12,
    paddingVertical: 14, backgroundColor: '#F97316',
  },
  chatBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Suggestions
  suggestRow: { flexDirection: 'row', gap: 12 },
  suggestCard: { flex: 1, borderRadius: 14, overflow: 'hidden', backgroundColor: '#f9fafb' },
  suggestImage: { width: '100%', height: 120 },
  suggestName: { fontSize: 14, fontWeight: '700', color: '#111827', padding: 8, paddingBottom: 4 },
  suggestMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, marginBottom: 6 },
  suggestRating: { fontSize: 11, fontWeight: '700', color: '#374151' },
  suggestReviews: { fontSize: 10, color: '#6b7280' },
  suggestDiscount: {
    marginHorizontal: 8, marginBottom: 6, backgroundColor: '#fff3ec',
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, alignSelf: 'flex-start',
  },
  suggestDiscountText: { fontSize: 10, color: PRIMARY, fontWeight: '700' },
  suggestPrice: { fontSize: 15, fontWeight: '700', color: '#111827', paddingHorizontal: 8, paddingBottom: 10 },
  suggestUnit: { fontSize: 11, color: '#6b7280', fontWeight: '400' },

  // Bottom Bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0',
    paddingTop: 12, paddingHorizontal: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 12,
  },
  bottomBarInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: PRIMARY_LIGHT, borderRadius: 12, borderWidth: 2, borderColor: PRIMARY,
    paddingHorizontal: 12, paddingVertical: 10, flex: 1,
  },
  timeText: { fontSize: 12, color: '#0d5e3d', fontWeight: '600', flex: 1 },
  priceArea: { alignItems: 'flex-end', minWidth: 60 },
  oldPriceBottom: { fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through', fontWeight: '500' },
  priceBottom: { fontSize: 18, fontWeight: '800', color: PRIMARY },
  bookBtn: {
    backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20,
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
  bookBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Reviews Modal
  reviewsModal: { flex: 1, backgroundColor: '#fff' },
  reviewsModalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  reviewsModalTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
});
