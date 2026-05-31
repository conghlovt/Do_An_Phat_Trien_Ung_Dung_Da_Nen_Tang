import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Star, Flame, Tag, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import ImageWithFallback from '@/src/customer/components/common/ImageWithFallback';
import { useFavoritesContext } from '@/src/customer/context/FavoritesContext';

const PRIMARY_DARK = '#85c2a4';

export interface HotelCardProps {
  id: number | string;
  name: string;
  rating: number;
  reviews: number;
  location: string;
  discount: string;
  price: string;
  unit: string;
  oldPrice?: string;
  image: string;
  badge?: string;
  bookingType?: string;
}

export default function HotelCard(props: HotelCardProps) {
  const { id, name, rating, reviews, location, discount, price, unit, oldPrice, image, badge, bookingType } = props;
  const router = useRouter();
  const { currentTheme, isDarkMode } = useThemeContext();
  const { isFavorite, toggleFavorite } = useFavoritesContext();

  const isFav = isFavorite(id);

  const handleFavoritePress = () => {
    toggleFavorite(props);
  };

  return (
    <Pressable style={[styles.card, { backgroundColor: currentTheme.card, borderColor: 'rgba(133,194,164,0.28)' }]} onPress={() => router.push({
        pathname: "/customer/hotels/[id]",
        params: {
          id: String(id),
          name,
          rating: String(rating),
          reviews: String(reviews),
          location,
          discount,
          price,
          unit,
          oldPrice: oldPrice || '',
          image,
          badge: badge || '',
          bookingType: bookingType || '',
        }
      })}>
      <View style={styles.imageWrap}>
        <ImageWithFallback uri={image} style={styles.image} alt={name} />
        
        <Pressable style={styles.heartBtn} onPress={handleFavoritePress}>
          <Heart size={20} color={isFav ? '#ef4444' : '#ffffff'} fill={isFav ? '#ef4444' : 'rgba(0,0,0,0.3)'} />
        </Pressable>

        {!!badge && (
          <View style={styles.badge}>
            <Flame size={12} color="#fff" fill="#fff" />
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={[styles.name, { color: currentTheme.text }]} numberOfLines={1}>{name}</Text>

        <View style={styles.metaRow}>
          <Star size={12} color="#facc15" fill="#facc15" />
          <Text style={[styles.rating, { color: currentTheme.textSecondary }]}>{rating}</Text>
          <Text style={[styles.reviews, { color: currentTheme.textSecondary }]} numberOfLines={1}>({reviews}) • {location}</Text>
        </View>

        <View style={[styles.discountBadge, { backgroundColor: isDarkMode ? 'rgba(133,194,164,0.24)' : 'rgba(133,194,164,0.18)' }]}>
          <Tag size={10} color={PRIMARY_DARK} fill="rgba(133,194,164,0.35)" />
          <Text style={styles.discount}>{discount}</Text>
        </View>

        <View style={styles.priceRow}>
          {oldPrice ? <Text style={[styles.oldPrice, { color: currentTheme.textSecondary }]}>{oldPrice}</Text> : null}
        </View>
        <View style={styles.priceMain}>
          <Text style={styles.price}>{price}</Text>
          <Text style={[styles.unit, { color: currentTheme.textSecondary }]}>{unit}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16, overflow: 'hidden', width: 220, height: 280,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
    shadowRadius: 8, elevation: 3, flexDirection: 'column', borderWidth: 1,
  },
  imageWrap: { width: '100%', height: 140, position: 'relative' },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute', bottom: 8, left: 8,
    backgroundColor: PRIMARY_DARK, flexDirection: 'row', alignItems: 'center',
    gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  heartBtn: {
    position: 'absolute', top: 8, right: 8,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  body: { padding: 12, flex: 1, justifyContent: 'space-between' },
  name: { fontSize: 15, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  rating: { fontSize: 11, fontWeight: '700' },
  reviews: { fontSize: 11, flex: 1 },
  discountBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    paddingHorizontal: 6, paddingVertical: 3,
    borderRadius: 6, marginTop: 8, borderWidth: 1, borderColor: 'rgba(133,194,164,0.35)',
  },
  discount: { fontSize: 10, fontWeight: '700', color: PRIMARY_DARK },
  priceRow: { flexDirection: 'row', gap: 4, marginTop: 'auto' },
  oldPrice: { fontSize: 11, textDecorationLine: 'line-through' },
  priceMain: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  price: { fontSize: 17, fontWeight: '700', color: PRIMARY_DARK },
  unit: { fontSize: 11 },
});
