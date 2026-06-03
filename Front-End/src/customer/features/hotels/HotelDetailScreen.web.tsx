import { styles } from '@/src/customer/styles/hotels/hotelDetail.styles';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, Pressable, ScrollView,
  Dimensions, Animated, useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { useCustomerBack } from '@/src/customer/navigation/useCustomerBack';
import {
  ChevronLeft, MessageCircle, Heart,
  Star, Flame, MapPin, Phone, Mail, Clock, ChevronRight,
} from 'lucide-react-native';
import { AmenityIcon } from '@/src/customer/components/common/AmenityIcon';
import ImageGalleryViewer from '@/src/customer/components/common/ImageGalleryViewer';
import ImageWithFallback from '@/src/customer/components/common/ImageWithFallback';
import { useCustomerHotelsStore } from '@/src/customer/services/hotels/hotels.store';
import { viewedHotelsApi } from '@/src/customer/utils/hotels/viewedHotels';
import { getParamNumber, getParamText } from '@/src/customer/navigation/routeParams';
import { enrichHotel } from '@/src/customer/utils/hotels/hotelDetailData';

const { width: SCREEN_W } = Dimensions.get('window');
const PRIMARY = '#85c2a4';
const PRIMARY_DARK = '#85c2a4';
const STAR_COLOR = '#facc15';
const WEB_DETAIL_HORIZONTAL_GUTTER = 64;

function getBookingDurationLabel(bookingType: string, value: number) {
  return bookingType === 'Theo ngày' ? `${value} ngày` : `${value} giờ`;
}

export default function HotelDetailScreen() {
  const router = useRouter();
  const goBack = useCustomerBack('/customer/dashboard');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentTheme } = useThemeContext();
  const isWebLayout = width >= 768;
  const galleryWidth = isWebLayout ? width - WEB_DETAIL_HORIZONTAL_GUTTER : SCREEN_W;
  const params = useLocalSearchParams<{
    id?: string;
    bookingType?: string;
    checkIn?: string;
    checkOut?: string;
    hours?: string;
  }>();
  const hotelId = getParamText(params.id) || '';

  const {
    clearCurrentHotel,
    currentHotel,
    fetchHotel,
    hotelDetailLoading: loading,
  } = useCustomerHotelsStore();
  const [currentImage, setCurrentImage] = useState(0);
  const [galleryViewerIndex, setGalleryViewerIndex] = useState(0);
  const [showGalleryViewer, setShowGalleryViewer] = useState(false);
  const [liked, setLiked] = useState(false);
  const galleryRef = useRef<ScrollView>(null);
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
    if (hotelId) {
      void fetchHotel(hotelId);
    }
    return () => clearCurrentHotel();
  }, [clearCurrentHotel, fetchHotel, hotelId]);

  const hotel = useMemo(() => currentHotel ? enrichHotel(currentHotel) : null, [currentHotel]);

  useEffect(() => {
    if (hotel) {
      viewedHotelsApi.add(hotel).catch(() => {});
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

  const images: string[] = hotel.images?.length ? hotel.images : [hotel.image].filter(Boolean);
  const updateGalleryIndex = (offsetX: number) => {
    const nextIndex = Math.min(images.length - 1, Math.max(0, Math.round(offsetX / galleryWidth)));
    setCurrentImage(prev => (prev === nextIndex ? prev : nextIndex));
  };

  const openGalleryViewer = (index: number) => {
    const safeIndex = Math.min(images.length - 1, Math.max(0, index));
    setGalleryViewerIndex(safeIndex);
    setShowGalleryViewer(true);
  };

  const selectGalleryImage = (index: number) => {
    const safeIndex = Math.min(images.length - 1, Math.max(0, index));
    setCurrentImage(safeIndex);
    galleryRef.current?.scrollTo({ x: safeIndex * galleryWidth, animated: true });
  };

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
          <Pressable style={[styles.iconBtn, { backgroundColor: currentTheme.card }]} onPress={() => setLiked(l => !l)}>
            <Heart size={22} color={liked ? '#ef4444' : currentTheme.text} fill={liked ? '#ef4444' : 'none'} />
          </Pressable>

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
            ref={galleryRef}
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onScroll={e => updateGalleryIndex(e.nativeEvent.contentOffset.x)}
            onMomentumScrollEnd={e => updateGalleryIndex(e.nativeEvent.contentOffset.x)}
            scrollEventThrottle={16}
          >
            {images.map((img: string, i: number) => (
              <Pressable key={`${img}-${i}`} onPress={() => openGalleryViewer(i)}>
                <ImageWithFallback uri={img} style={[styles.galleryImage, isWebLayout && styles.webGalleryImage, { width: galleryWidth }]} alt={hotel.name} />
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>{images.length} ảnh</Text>
          </View>
          <View style={styles.dots}>
            {images.map((_: string, i: number) => (
              <View key={i} style={[styles.dot, currentImage === i && styles.dotActive]} />
            ))}
          </View>
          {/* Thumbnails */}
          <View style={styles.thumbnailRow}>
            {images.slice(0, 3).map((img: string, i: number) => (
              <Pressable
                key={`${img}-${i}`}
                style={[styles.thumbnailButton, currentImage === i && styles.thumbnailButtonActive]}
                onPress={() => selectGalleryImage(i)}
              >
                <ImageWithFallback uri={img} style={styles.thumbnail} alt="" />
              </Pressable>
            ))}
            {images.length > 3 && (
              <Pressable style={styles.thumbnailMore} onPress={() => openGalleryViewer(3)}>
                <Text style={styles.thumbnailMoreText}>+{images.length - 3}</Text>
              </Pressable>
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

        {/* Rating Summary */}
        <View style={[styles.section, { backgroundColor: currentTheme.card }]}>
          <View style={styles.ratingSummary}>
            <Text style={[styles.bigScore, { color: currentTheme.text }]}>{hotel.rating}</Text>
            <View>
              <View style={{ flexDirection: 'row', gap: 3, marginBottom: 4 }}>
                {[1,2,3,4,5].map(i => (
                  <Star
                    key={i}
                    size={16}
                    color={STAR_COLOR}
                    fill={i <= Math.round(hotel.rating) ? STAR_COLOR : 'none'}
                  />
                ))}
              </View>
              <Text style={[styles.ratingLabel, { color: currentTheme.text }]}>Tuyệt vời</Text>
              <Text style={[styles.ratingSubLabel, { color: currentTheme.textSecondary }]}>{hotel.reviews} đánh giá</Text>
            </View>
          </View>
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
          {hotel.email && (
            <Pressable style={styles.phoneRow}>
              <Mail size={14} color={PRIMARY} />
              <Text style={styles.phoneText}>{hotel.email}</Text>
            </Pressable>
          )}
        </View>

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
        <View style={[styles.sectionDivider, { backgroundColor: currentTheme.card, borderTopColor: currentTheme.border }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Tiện nghi</Text>
            <View style={styles.amenitiesGrid}>
              {hotel.amenities.map((a: string) => (
                <View key={a} style={styles.amenityItem}>
                  <AmenityIcon name={a} size={14} color={PRIMARY} />
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
              pathname: '/customer/booking/calendar' as any,
              params: {
                hotelId: String(hotelId),
                hotelName: hotel.name,
                hotelAddress: hotel.address,
                hotelImage: images[0] || hotel.image,
                bookingType,
                returnTo: 'hotel-detail',
              },
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
              pathname: '/customer/hotels/rooms' as any,
              params: {
                hotelId: String(hotelId),
                hotelName: hotel.name,
                hotelAddress: hotel.address,
                hotelImage: images[0] || hotel.image,
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

      <ImageGalleryViewer
        visible={showGalleryViewer}
        images={images}
        initialIndex={galleryViewerIndex}
        title={hotel.name}
        onClose={() => setShowGalleryViewer(false)}
      />
    </View>
  );
}
