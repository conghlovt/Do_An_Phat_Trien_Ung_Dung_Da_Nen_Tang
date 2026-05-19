import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Dimensions, Animated, Modal, FlatList, Platform, useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/src/customer/shared/theme/ThemeContext';
import { useCustomerBack } from '@/src/customer/shared/navigation/useCustomerBack';
import {
  ChevronLeft, MessageCircle, Heart, Share2,
  Star, Flame, MapPin, Phone, Clock, ChevronRight,
  Shield, X, Wifi, Wind, Tv, Bath, Coffee, Car,
} from 'lucide-react-native';
import ImageWithFallback from '@/src/customer/shared/ui/ImageWithFallback';
import { hotelsApi, Hotel } from '@/src/customer/features/hotels/api/hotels.api';
import { viewedHotelsStorage } from '@/src/customer/features/hotels/utils/viewedHotels';
import { getParamNumber, getParamText } from '@/src/customer/shared/navigation/routeParams';
import { enrichHotel, HOTEL_REVIEWS, SUGGESTED_HOTELS } from '@/src/customer/features/hotels/utils/hotelDetailData';

const { width: SCREEN_W } = Dimensions.get('window');
const PRIMARY = '#85c2a4';
const PRIMARY_DARK = '#599373';
const PRIMARY_LIGHT = '#e8f6ed';
const STAR_COLOR = '#facc15';

function getBookingDurationLabel(bookingType: string, value: number) {
  return bookingType === 'Theo ngày' ? `${value} ngày` : `${value} giờ`;
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi size={14} color={PRIMARY} />,
  'Điều hòa': <Wind size={14} color={PRIMARY} />,
  TV: <Tv size={14} color={PRIMARY} />,
  'Bồn tắm': <Bath size={14} color={PRIMARY} />,
  'Cà phê': <Coffee size={14} color={PRIMARY} />,
  'Bãi đỗ xe': <Car size={14} color={PRIMARY} />,
};

export default function HotelDetailScreen() {
  const router = useRouter();
  const goBack = useCustomerBack('/customer/dashboard');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentTheme } = useThemeContext();
  const isWebLayout = Platform.OS === 'web' && width >= 768;
  const galleryWidth = isWebLayout ? Math.min(Math.max(width - 380, 720), 1180) : SCREEN_W;
  const params = useLocalSearchParams<{
    id?: string;
    bookingType?: string;
    checkIn?: string;
    checkOut?: string;
    hours?: string;
    name?: string;
    rating?: string;
    reviews?: string;
    location?: string;
    district?: string;
    discount?: string;
    price?: string;
    priceValue?: string;
    unit?: string;
    oldPrice?: string;
    image?: string;
    badge?: string;
  }>();
  const hotelId = getParamText(params.id) || '1';

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Booking state from previous screen
  const bookingType = getParamText(params.bookingType) || 'Theo giờ';
  const now = new Date();
  const defaultCheckIn = `17:30, ${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}`;
  const defaultCheckOut = `19:30, ${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}`;
  const checkIn = getParamText(params.checkIn) || defaultCheckIn;
  const checkOut = getParamText(params.checkOut) || defaultCheckOut;
  const hours = getParamNumber(params.hours, 2);
  const durationLabel = getBookingDurationLabel(bookingType, hours);

  useEffect(() => {
    hotelsApi.getById(hotelId)
      .then(({ data }) => setHotel(enrichHotel(data)))
      .catch(() => {
        const mockHotel: Hotel = {
          id: hotelId,
          name: getParamText(params.name) || 'Min Hotel',
          rating: getParamNumber(params.rating, 4.9),
          reviews: getParamNumber(params.reviews, 4773),
          location: getParamText(params.location) || 'Nhân Chính, Thanh Xuân',
          district: getParamText(params.district) || getParamText(params.location) || 'Thanh Xuân',
          discount: getParamText(params.discount) || 'Mã giảm 28K',
          price: getParamText(params.price) || '199.999đ',
          priceValue: getParamNumber(params.priceValue, 199999),
          unit: getParamText(params.unit) || '/ 2 giờ',
          oldPrice: getParamText(params.oldPrice) || '300.000đ',
          image: getParamText(params.image) || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
          badge: getParamText(params.badge) || 'Nổi bật',
          tags: [getParamText(params.discount) || 'Flash Sale'],
        };
        setHotel(enrichHotel(mockHotel));
      })
      .finally(() => setLoading(false));
  }, [
    hotelId,
    params.badge,
    params.discount,
    params.district,
    params.image,
    params.location,
    params.name,
    params.oldPrice,
    params.price,
    params.priceValue,
    params.rating,
    params.reviews,
    params.unit,
  ]);

  useEffect(() => {
    if (hotel) {
      viewedHotelsStorage.add(hotel);
    }
  }, [hotel]);

  const headerOpacity = scrollY.interpolate({ inputRange: [180, 220], outputRange: [0, 1], extrapolate: 'clamp' });

  if (loading || !hotel) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: currentTheme.background }]}>
        <View style={[styles.skeleton, { backgroundColor: currentTheme.card }]} />
      </View>
    );
  }

  const images = hotel.images || [hotel.image];

  return (
    <View style={[styles.container, isWebLayout && styles.webContainer, { backgroundColor: currentTheme.background }]}>
      {/* Floating transparent header */}
      <View style={[styles.floatingHeader, isWebLayout && styles.webFloatingHeader, { paddingTop: isWebLayout ? 8 : insets.top + 8, backgroundColor: currentTheme.card }]}>
        <View style={isWebLayout && styles.webHeaderSide}>
          <Pressable onPress={goBack} style={[styles.iconBtn, { backgroundColor: currentTheme.card }]}>
            <ChevronLeft size={24} color={currentTheme.text} />
          </Pressable>
        </View>
        <Animated.View style={[styles.headerTitle, { opacity: headerOpacity }]}>
          <Text style={[styles.headerTitleText, { color: currentTheme.text }]} numberOfLines={1}>{hotel.name}</Text>
        </Animated.View>
        <View style={[styles.iconRow, isWebLayout && styles.webHeaderSideRight]}>
          <Pressable style={[styles.iconBtn, { backgroundColor: currentTheme.card }]}><MessageCircle size={22} color={currentTheme.text} /></Pressable>
          <Pressable style={[styles.iconBtn, { backgroundColor: currentTheme.card }]} onPress={() => setLiked(l => !l)}>
            <Heart size={22} color={liked ? '#ef4444' : currentTheme.text} fill={liked ? '#ef4444' : 'none'} />
          </Pressable>
          <Pressable style={[styles.iconBtn, { backgroundColor: currentTheme.card }]}><Share2 size={22} color={currentTheme.text} /></Pressable>
        </View>
      </View>

      <Animated.ScrollView
        style={isWebLayout && styles.webScroll}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.scrollContent, isWebLayout && styles.webScrollContent]}
      >
        {/* Image Gallery */}
        <View style={[styles.galleryContainer, isWebLayout && styles.webGalleryContainer]}>
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => setCurrentImage(Math.round(e.nativeEvent.contentOffset.x / galleryWidth))}
          >
            {images.map((img, i) => (
              <ImageWithFallback key={i} uri={img} style={[styles.galleryImage, isWebLayout && styles.webGalleryImage, { width: galleryWidth }]} alt={hotel.name} />
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

        <View style={isWebLayout && styles.webContent}>
        {/* Info Section */}
        <View style={[styles.infoCard, { backgroundColor: currentTheme.card }]}>
          {/* Rating & Badge */}
          <View style={styles.ratingRow}>
            <Star size={18} color={STAR_COLOR} fill={STAR_COLOR} />
            <Text style={[styles.ratingScore, { color: currentTheme.text }]}>{hotel.rating}</Text>
            <Text style={[styles.ratingCount, { color: currentTheme.textSecondary }]}>({hotel.reviews})</Text>
            {hotel.badge && (
              <View style={styles.badge}>
                <Flame size={12} color={PRIMARY_DARK} />
                <Text style={styles.badgeText}>{hotel.badge}</Text>
              </View>
            )}
          </View>

          <Text style={[styles.hotelName, { color: currentTheme.text }]}>{hotel.name}</Text>

          <View style={styles.addressRow}>
            <MapPin size={13} color="#6b7280" />
            <Text style={[styles.addressText, { color: currentTheme.textSecondary }]} numberOfLines={2}>{hotel.address}</Text>
          </View>
          <Pressable style={styles.mapBtn}>
            <Text style={styles.mapBtnText}>Xem bản đồ</Text>
            <ChevronRight size={14} color={PRIMARY} />
          </Pressable>
        </View>

        {/* Member Perks */}
        <View style={[styles.perksCard, isWebLayout && styles.webPerksCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          <View style={styles.perkRow}>
            <View style={styles.perkIcon}><Text>🎫</Text></View>
            <Text style={[styles.perkText, { color: currentTheme.textSecondary }]}>Nhận <Text style={styles.perkHighlight}>1 tem</Text> khi hoàn thành đặt phòng</Text>
          </View>
          <View style={styles.perkRow}>
            <View style={styles.perkIcon}><Text>🏷️</Text></View>
            <Text style={[styles.perkText, { color: currentTheme.textSecondary }]}>Nhiều mã ưu đãi hấp dẫn dành cho thành viên đăng ký</Text>
          </View>
        </View>

        {/* Rating Summary */}
        <View style={[styles.section, { backgroundColor: currentTheme.card }]}>
          <View style={styles.ratingSummary}>
            <Text style={[styles.bigScore, { color: currentTheme.text }]}>{hotel.rating}</Text>
            <View>
              <Text style={[styles.ratingLabel, { color: currentTheme.text }]}>Tuyệt vời</Text>
              <Text style={[styles.ratingSubLabel, { color: currentTheme.textSecondary }]}>{hotel.reviews} đánh giá</Text>
            </View>
          </View>
          {/* Review cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {HOTEL_REVIEWS.map(r => (
              <View key={r.id} style={[styles.reviewCard, { backgroundColor: currentTheme.background }]}>
                <View style={styles.reviewHeader}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>👤</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.reviewName, { color: currentTheme.text }]}>{r.name}</Text>
                    <Text style={[styles.reviewTag, { color: currentTheme.textSecondary }]}>{r.tag}</Text>
                  </View>
                  <View style={styles.reviewStars}>
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={12} color={STAR_COLOR} fill={STAR_COLOR} />
                    ))}
                  </View>
                </View>
                <Text style={[styles.reviewText, { color: currentTheme.textSecondary }]}>{r.text}</Text>
              </View>
            ))}
          </ScrollView>
          <Pressable style={styles.viewAllBtn} onPress={() => setShowAllReviews(true)}>
            <Text style={styles.viewAllText}>Xem tất cả</Text>
            <ChevronRight size={14} color={PRIMARY} />
          </Pressable>
        </View>

        {/* Hotel Info */}
        <View style={[styles.sectionDivider, { backgroundColor: currentTheme.card, borderTopColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Giới thiệu</Text>
          <Text style={[styles.descText, { color: currentTheme.textSecondary }]}>{hotel.description}</Text>
          {hotel.phone && (
            <Pressable style={styles.phoneRow}>
              <Phone size={14} color={PRIMARY} />
              <Text style={styles.phoneText}>{hotel.phone}</Text>
            </Pressable>
          )}
        </View>

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
        <View style={[styles.sectionDivider, { backgroundColor: currentTheme.card, borderTopColor: currentTheme.border }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Tiện nghi</Text>
            <View style={styles.amenitiesGrid}>
              {hotel.amenities.map(a => (
                <View key={a} style={styles.amenityItem}>
                  {AMENITY_ICONS[a] || <Shield size={14} color={PRIMARY} />}
                  <Text style={[styles.amenityText, { color: currentTheme.textSecondary }]}>{a}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Check-in/out Hours */}
        <View style={[styles.sectionDivider, { backgroundColor: currentTheme.card, borderTopColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Giờ nhận phòng/trả phòng</Text>
          <View style={styles.hoursTable}>
            <View style={styles.hoursRow}>
              <Text style={[styles.hoursLabel, { color: currentTheme.textSecondary }]}>Theo giờ</Text>
              <Text style={[styles.hoursValue, { color: currentTheme.text }]}>Từ 08:00 đến 22:00</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={[styles.hoursLabel, { color: currentTheme.textSecondary }]}>Qua đêm</Text>
              <Text style={[styles.hoursValue, { color: currentTheme.text }]}>Từ 22:00 đến 10:00</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={[styles.hoursLabel, { color: currentTheme.textSecondary }]}>Theo ngày</Text>
              <Text style={[styles.hoursValue, { color: currentTheme.text }]}>Từ 14:00 đến 12:00</Text>
            </View>
          </View>
        </View>

        {/* Cancellation Policy */}
        <View style={[styles.sectionDivider, { backgroundColor: currentTheme.card, borderTopColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Chính sách huỷ phòng</Text>
          <Text style={[styles.descText, { color: currentTheme.textSecondary }]}>Việc hủy phòng sẽ tuân theo quy định riêng của từng loại phòng và thời điểm đặt.</Text>
        </View>

        {/* Chat */}
        <View style={[styles.sectionDivider, { backgroundColor: currentTheme.card, borderTopColor: currentTheme.border }]}>
          <Text style={[styles.chatPrompt, { color: currentTheme.textSecondary }]}>Bạn có thắc mắc cần được giải đáp? Hãy nhắn tin cho khách sạn ngay để được hỗ trợ nhé!</Text>
          <Pressable style={styles.chatBtn}>
            <MessageCircle size={16} color="#fff" />
            <Text style={styles.chatBtnText}>Chat với khách sạn</Text>
          </Pressable>
        </View>

        {/* Suggestions */}
        <View style={[styles.sectionDivider, { backgroundColor: currentTheme.card, borderTopColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Gợi ý cho bạn</Text>
          <View style={styles.suggestRow}>
            {SUGGESTED_HOTELS.map(s => (
              <Pressable key={s.id} style={[styles.suggestCard, { backgroundColor: currentTheme.background }]}
                onPress={() => router.push({
                  pathname: '/customer/hotel-detail' as any,
                  params: {
                    id: String(s.id),
                    name: s.name,
                    rating: String(s.rating),
                    reviews: String(s.reviews),
                    location: s.location,
                    district: s.location,
                    discount: s.discount,
                    price: s.price,
                    unit: s.unit,
                    image: s.image,
                    badge: s.badge,
                  },
                })}>
                <ImageWithFallback uri={s.image} style={styles.suggestImage} alt={s.name} />
                <Text style={[styles.suggestName, { color: currentTheme.text }]} numberOfLines={1}>{s.name}</Text>
                <View style={styles.suggestMeta}>
                  <Star size={11} color={STAR_COLOR} fill={STAR_COLOR} />
                  <Text style={[styles.suggestRating, { color: currentTheme.text }]}>{s.rating}</Text>
                  <Text style={[styles.suggestReviews, { color: currentTheme.textSecondary }]}>({s.reviews}) • {s.location}</Text>
                </View>
                <View style={styles.suggestDiscount}>
                  <Text style={styles.suggestDiscountText}>{s.discount}</Text>
                </View>
                <Text style={styles.suggestPrice}>{s.price} <Text style={[styles.suggestUnit, { color: currentTheme.textSecondary }]}>{s.unit}</Text></Text>
              </Pressable>
            ))}
          </View>
        </View>
        </View>
      </Animated.ScrollView>

      {/* Bottom Bar */}
      <View style={[
        styles.bottomBar,
        isWebLayout && styles.webBottomBar,
        {
          paddingBottom: isWebLayout ? 12 : insets.bottom + 8,
          backgroundColor: currentTheme.card,
          borderTopColor: currentTheme.border,
        },
      ]}>
        <View style={[styles.bottomBarInner, isWebLayout && styles.webBottomBarInner]}>
          <Pressable style={styles.timeChip} onPress={() =>
            router.push({
              pathname: '/customer/booking-calendar' as any,
              params: { hotelId: String(hotelId), hotelName: hotel.name, bookingType, returnTo: 'hotel-detail' },
            })
          }>
            <Clock size={14} color={currentTheme.text} />
            <Text style={styles.timeText}>{durationLabel} | {checkIn} → {checkOut}</Text>
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
        <View style={[styles.reviewsModal, { paddingTop: insets.top, backgroundColor: currentTheme.background }]}>
          <View style={[styles.reviewsModalHeader, { backgroundColor: currentTheme.card, borderBottomColor: currentTheme.border }]}>
            <Text style={[styles.reviewsModalTitle, { color: currentTheme.text }]}>Đánh giá</Text>
            <Pressable onPress={() => setShowAllReviews(false)}><X size={24} color={currentTheme.text} /></Pressable>
          </View>
          <FlatList
            data={HOTEL_REVIEWS}
            keyExtractor={r => String(r.id)}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            renderItem={({ item: r }) => (
              <View style={[styles.reviewCardFull, { backgroundColor: currentTheme.card }]}>
                <View style={styles.reviewHeader}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>👤</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.reviewName, { color: currentTheme.text }]}>{r.name}</Text>
                    <Text style={[styles.reviewTag, { color: currentTheme.textSecondary }]}>{r.tag}</Text>
                  </View>
                  <View style={styles.reviewStars}>
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={14} color={STAR_COLOR} fill={STAR_COLOR} />
                    ))}
                  </View>
                </View>
                <Text style={[styles.reviewText, { color: currentTheme.textSecondary }]}>{r.text}</Text>
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
  webContainer: {
    overflow: 'hidden',
  },
  loadingContainer: { flex: 1, backgroundColor: '#f3f4f6' },
  skeleton: { flex: 1, backgroundColor: '#e5e7eb' },
  scrollContent: { paddingBottom: 120 },
  webScroll: {
    flex: 1,
  },
  webScrollContent: {
    paddingBottom: 120,
    alignItems: 'center',
  },

  floatingHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  webFloatingHeader: {
    width: 'calc(100% - 64px)' as any,
    maxWidth: 1180,
    alignSelf: 'center',
    marginLeft: 'auto' as any,
    marginRight: 'auto' as any,
    borderRadius: 16,
    marginTop: 12,
    paddingHorizontal: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 6,
  },
  headerTitle: { flex: 1, alignItems: 'center' },
  headerTitleText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)' },
  iconRow: { flexDirection: 'row', gap: 4 },
  webHeaderSide: {
    width: 132,
    alignItems: 'flex-start',
  },
  webHeaderSideRight: {
    width: 132,
    justifyContent: 'flex-end',
  },

  // Gallery
  galleryContainer: { position: 'relative' },
  webGalleryContainer: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    marginTop: 52,
    borderRadius: 18,
    overflow: 'hidden',
  },
  galleryImage: { width: SCREEN_W, height: 240 },
  webGalleryImage: { height: 320 },
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
  webContent: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingTop: 18,
    paddingHorizontal: 0,
  },
  infoCard: { padding: 16 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  ratingScore: { fontSize: 15, fontWeight: '700', color: '#111827' },
  ratingCount: { fontSize: 13, color: '#6b7280' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(133,194,164,0.18)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(133,194,164,0.35)',
    marginLeft: 'auto',
  },
  badgeText: { color: PRIMARY_DARK, fontSize: 12, fontWeight: '700' },
  hotelName: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  addressText: { fontSize: 13, color: '#6b7280', flex: 1, lineHeight: 20 },
  mapBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  mapBtnText: { color: PRIMARY, fontSize: 13, fontWeight: '600' },

  // Perks
  perksCard: { marginHorizontal: 16, marginBottom: 16, borderRadius: 14, borderWidth: 1, borderColor: '#f3f4f6', padding: 14, gap: 10 },
  webPerksCard: {
    marginHorizontal: 0,
  },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  perkIcon: { width: 28, alignItems: 'center' },
  perkText: { fontSize: 13, color: '#374151', flex: 1 },
  perkHighlight: { color: PRIMARY_DARK, fontWeight: '700' },

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
    borderWidth: 1, borderColor: PRIMARY, borderRadius: 12,
    paddingVertical: 14, backgroundColor: PRIMARY,
  },
  chatBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Suggestions
  suggestRow: { flexDirection: 'row', gap: 12 },
  suggestCard: { flex: 1, borderRadius: 14, overflow: 'hidden', backgroundColor: '#f9fafb', borderWidth: 1, borderColor: 'rgba(133,194,164,0.25)' },
  suggestImage: { width: '100%', height: 120 },
  suggestName: { fontSize: 14, fontWeight: '700', color: '#111827', padding: 8, paddingBottom: 4 },
  suggestMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, marginBottom: 6 },
  suggestRating: { fontSize: 11, fontWeight: '700', color: '#374151' },
  suggestReviews: { fontSize: 10, color: '#6b7280' },
  suggestDiscount: {
    marginHorizontal: 8, marginBottom: 6, backgroundColor: 'rgba(133,194,164,0.16)',
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(133,194,164,0.32)',
  },
  suggestDiscountText: { fontSize: 10, color: PRIMARY_DARK, fontWeight: '700' },
  suggestPrice: { fontSize: 15, fontWeight: '700', color: PRIMARY_DARK, paddingHorizontal: 8, paddingBottom: 10 },
  suggestUnit: { fontSize: 11, color: '#6b7280', fontWeight: '400' },

  // Bottom Bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0',
    paddingTop: 12, paddingHorizontal: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 12,
  },
  webBottomBar: {
    paddingHorizontal: 32,
    paddingTop: 12,
  },
  bottomBarInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  webBottomBarInner: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
  },
  timeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: PRIMARY_LIGHT, borderRadius: 12, borderWidth: 2, borderColor: PRIMARY,
    paddingHorizontal: 12, paddingVertical: 10, flex: 1,
  },
  timeText: { fontSize: 12, color: '#0d5e3d', fontWeight: '600', flex: 1 },
  priceArea: { alignItems: 'flex-end', minWidth: 60 },
  oldPriceBottom: { fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through', fontWeight: '500' },
  priceBottom: { fontSize: 18, fontWeight: '800', color: PRIMARY_DARK },
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
