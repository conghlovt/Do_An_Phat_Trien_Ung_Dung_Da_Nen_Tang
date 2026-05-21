import React, { useCallback, useEffect, useState } from 'react';
import { Platform, View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import ImageWithFallback from '@/src/customer/components/ImageWithFallback';
import { hotelsApi, Hotel } from '@/src/customer/api/hotels.api';
import { viewedHotelsStorage, ViewedHotel } from '@/src/customer/utils/viewedHotels';

const FALLBACK_VIEWED_IMAGES = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
];

const FALLBACK_RECOMMENDED_IMAGES = [
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=500',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500',
];

function getImagesFromHotels(hotels: (ViewedHotel | Hotel)[], fallback: string[]) {
  const images = hotels.flatMap((hotel) => hotel.images?.length ? hotel.images : [hotel.image]).filter(Boolean);
  return images.length ? images : fallback;
}

export default function ExploreMoreSection() {
  const router = useRouter();
  const { currentTheme } = useThemeContext();
  const { width } = useWindowDimensions();
  const isWebLayout = Platform.OS === 'web' && width >= 768;
  const [viewedHotels, setViewedHotels] = useState<ViewedHotel[]>([]);
  const [recommendedHotels, setRecommendedHotels] = useState<Hotel[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      viewedHotelsStorage.getAll().then((hotels) => {
        if (isActive) {
          setViewedHotels(hotels);
        }
      });

      return () => {
        isActive = false;
      };
    }, []),
  );

  useEffect(() => {
    let isActive = true;

    hotelsApi.getAll({ tag: 'Gợi ý', limit: 4 })
      .then(({ data }) => {
        if (isActive) {
          setRecommendedHotels(data);
        }
      })
      .catch(() => {
        if (isActive) {
          setRecommendedHotels([]);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const viewedImages = getImagesFromHotels(viewedHotels, FALLBACK_VIEWED_IMAGES);
  const recommendedImages = getImagesFromHotels(recommendedHotels, FALLBACK_RECOMMENDED_IMAGES);

  return (
    <View style={[styles.container, isWebLayout && styles.webContainer]}>
      <Text style={[styles.title, isWebLayout && styles.webTitle, { color: currentTheme.text }]}>Khám phá nhiều hơn</Text>

      <View style={[styles.grid, isWebLayout && styles.webGrid]}>
        <Pressable
          style={[
            styles.tile,
            isWebLayout && styles.webTile,
            { backgroundColor: isWebLayout ? currentTheme.card : 'transparent', borderColor: currentTheme.border },
          ]}
          onPress={() => router.push({
            pathname: '/customer/see-all' as any,
            params: { section: 'Khách sạn đã xem' },
          })}
        >
          <ImageWithFallback uri={viewedImages[0]} style={[styles.mainImage, isWebLayout && styles.webImage]} alt="Khách sạn đã xem" />
          <Text style={[styles.tileTitle, isWebLayout && styles.webTileTitle, { color: currentTheme.text }]} numberOfLines={2}>Khách sạn đã xem</Text>
          <Text style={[styles.tileSubtitle, isWebLayout && styles.webTileSubtitle, { color: currentTheme.textSecondary }]}>Riêng tư</Text>
        </Pressable>

        <Pressable
          style={[
            styles.tile,
            isWebLayout && styles.webTile,
            { backgroundColor: isWebLayout ? currentTheme.card : 'transparent', borderColor: currentTheme.border },
          ]}
          onPress={() => router.push({
            pathname: '/customer/see-all' as any,
            params: { section: 'Gợi ý cho bạn' },
          })}
        >
          <View style={[styles.mosaic, isWebLayout && styles.webImage]}>
            {recommendedImages.slice(0, 4).map((image, index) => (
              <ImageWithFallback key={`${image}-${index}`} uri={image} style={styles.mosaicImage} alt="Gợi ý cho bạn" />
            ))}
          </View>
          <Text style={[styles.tileTitle, isWebLayout && styles.webTileTitle, { color: currentTheme.text }]} numberOfLines={2}>Gợi ý cho bạn</Text>
          <Text style={[styles.tileSubtitle, isWebLayout && styles.webTileSubtitle, { color: currentTheme.textSecondary }]}>Được chọn lọc</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8, marginBottom: 24, paddingHorizontal: 16 },
  webContainer: {
    marginTop: 0,
    paddingHorizontal: 0,
  },
  title: { fontSize: 34, fontWeight: '800', lineHeight: 42, marginBottom: 26 },
  webTitle: {
    fontSize: 30,
    lineHeight: 38,
    marginBottom: 18,
  },
  grid: {
    flexDirection: 'row',
    gap: 18,
  },
  webGrid: {
    gap: 18,
  },
  tile: {
    flex: 1,
    minWidth: 0,
  },
  webTile: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
  },
  mainImage: {
    width: '100%',
    aspectRatio: 1.08,
    borderRadius: 18,
    marginBottom: 16,
  },
  webImage: {
    aspectRatio: 1.45,
    borderRadius: 14,
  },
  mosaic: {
    width: '100%',
    aspectRatio: 1.08,
    borderRadius: 18,
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  mosaicImage: {
    width: '50%',
    height: '50%',
    borderWidth: 1,
    borderColor: '#fff',
  },
  tileTitle: {
    fontSize: 23,
    fontWeight: '700',
    lineHeight: 30,
  },
  webTileTitle: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '800',
  },
  tileSubtitle: {
    fontSize: 17,
    lineHeight: 24,
    marginTop: 4,
  },
  webTileSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});
