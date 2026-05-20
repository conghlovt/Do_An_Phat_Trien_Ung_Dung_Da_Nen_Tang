import React from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Star, Tag, Zap } from 'lucide-react-native';
import ImageWithFallback from '@/src/customer/components/ImageWithFallback';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import type { Hotel } from '@/src/customer/types/hotels.types';

const PRIMARY_DARK = '#599373';

interface HotelListCardProps {
  hotel: Hotel;
  isFlashSale?: boolean;
}

export default function HotelListCard({ hotel, isFlashSale = false }: HotelListCardProps) {
  const router = useRouter();
  const { currentTheme } = useThemeContext();
  const { width } = useWindowDimensions();
  const isWebLayout = Platform.OS === 'web' && width >= 768;

  return (
    <Pressable
      style={[styles.hotelCard, isWebLayout && styles.webHotelCard, { backgroundColor: currentTheme.card, borderColor: 'rgba(133,194,164,0.28)' }]}
      onPress={() => router.push({
        pathname: '/customer/hotel-detail' as any,
        params: {
          id: String(hotel.id),
          name: hotel.name,
          rating: String(hotel.rating),
          reviews: String(hotel.reviews),
          location: hotel.location,
          discount: hotel.discount,
          price: hotel.price,
          unit: hotel.unit,
          oldPrice: hotel.oldPrice || '',
          image: hotel.image,
          badge: hotel.badge || '',
        },
      })}
    >
      <View style={[styles.hotelImageWrap, isWebLayout && styles.webHotelImageWrap]}>
        <ImageWithFallback uri={hotel.image} style={styles.hotelImage} />
        {isFlashSale && (
          <View style={styles.flashBadge}>
            <Zap size={10} color="#fff" fill="#fff" />
            <Text style={styles.flashBadgeText}>Flash</Text>
          </View>
        )}
        {!!hotel.badge && !isFlashSale && (
          <View style={styles.hotBadge}>
            <Text style={styles.hotBadgeText}>{hotel.badge}</Text>
          </View>
        )}
      </View>
      <View style={styles.hotelInfo}>
        <Text style={[styles.hotelName, isWebLayout && styles.webHotelName, { color: currentTheme.text }]} numberOfLines={2}>
          {hotel.name}
        </Text>
        <View style={styles.hotelMeta}>
          <Star size={12} color="#facc15" fill="#facc15" />
          <Text style={[styles.hotelRating, { color: currentTheme.textSecondary }]}>{hotel.rating}</Text>
          <Text style={styles.hotelReviews}>({hotel.reviews}) • {hotel.location}</Text>
        </View>
        <View style={styles.hotelTag}>
          <Tag size={10} color={PRIMARY_DARK} />
          <Text style={styles.hotelTagText}>{hotel.discount}</Text>
        </View>
        <View style={styles.hotelPriceSpacer} />
        <View style={styles.hotelPriceBlock}>
          {!!hotel.oldPrice && <Text style={styles.oldPrice}>{hotel.oldPrice}</Text>}
          <View style={styles.hotelPriceRow}>
            <Text style={[styles.hotelPrice, isWebLayout && styles.webHotelPrice]}>{hotel.price}</Text>
            <Text style={styles.hotelUnit}>{hotel.unit}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hotelCard: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    marginBottom: 12,
  },
  webHotelCard: {
    minHeight: 150,
    borderRadius: 18,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
  },
  hotelImageWrap: { width: 110, height: 110, position: 'relative' },
  webHotelImageWrap: { width: 190, height: 150 },
  hotelImage: { width: '100%', height: '100%' },
  flashBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#eab308',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  flashBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  hotBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#ff5a5f',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  hotBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  hotelInfo: { flex: 1, padding: 12, justifyContent: 'flex-start' },
  hotelName: { fontSize: 14, fontWeight: '700', marginBottom: 4, lineHeight: 20 },
  webHotelName: { fontSize: 17, marginBottom: 8 },
  hotelMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  hotelRating: { fontSize: 12, fontWeight: '700' },
  hotelReviews: { fontSize: 11, color: '#6b7280', flex: 1 },
  hotelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(133,194,164,0.18)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(133,194,164,0.35)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  hotelTagText: { fontSize: 10, fontWeight: '700', color: PRIMARY_DARK },
  hotelPriceSpacer: { flex: 1 },
  hotelPriceBlock: {},
  oldPrice: { fontSize: 11, color: '#9ca3af', textDecorationLine: 'line-through', marginBottom: 2 },
  hotelPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  hotelPrice: { fontSize: 16, fontWeight: '700', color: PRIMARY_DARK },
  webHotelPrice: { fontSize: 20 },
  hotelUnit: { fontSize: 11, color: '#6b7280' },
});
