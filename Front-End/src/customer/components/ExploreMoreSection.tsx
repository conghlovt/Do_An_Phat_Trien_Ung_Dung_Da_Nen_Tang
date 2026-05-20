import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
    <View style={styles.container}>
      <Text style={[styles.title, { color: currentTheme.text }]}>Khám phá nhiều hơn</Text>

      <View style={styles.grid}>
        <Pressable
          style={styles.tile}
          onPress={() => router.push({
            pathname: '/customer/see-all' as any,
            params: { section: 'Khách sạn đã xem' },
          })}
        >
          <ImageWithFallback uri={viewedImages[0]} style={styles.mainImage} alt="Khách sạn đã xem" />
          <Text style={[styles.tileTitle, { color: currentTheme.text }]} numberOfLines={2}>Khách sạn đã xem</Text>
          <Text style={[styles.tileSubtitle, { color: currentTheme.textSecondary }]}>Riêng tư</Text>
        </Pressable>

        <Pressable
          style={styles.tile}
          onPress={() => router.push({
            pathname: '/customer/see-all' as any,
            params: { section: 'Gợi ý cho bạn' },
          })}
        >
          <View style={styles.mosaic}>
            {recommendedImages.slice(0, 4).map((image, index) => (
              <ImageWithFallback key={`${image}-${index}`} uri={image} style={styles.mosaicImage} alt="Gợi ý cho bạn" />
            ))}
          </View>
          <Text style={[styles.tileTitle, { color: currentTheme.text }]} numberOfLines={2}>Gợi ý cho bạn</Text>
          <Text style={[styles.tileSubtitle, { color: currentTheme.textSecondary }]}>Được chọn lọc</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8, marginBottom: 24, paddingHorizontal: 16 },
  title: { fontSize: 34, fontWeight: '800', lineHeight: 42, marginBottom: 26 },
  grid: {
    flexDirection: 'row',
    gap: 18,
  },
  tile: {
    flex: 1,
    minWidth: 0,
  },
  mainImage: {
    width: '100%',
    aspectRatio: 1.08,
    borderRadius: 18,
    marginBottom: 16,
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
  tileSubtitle: {
    fontSize: 17,
    lineHeight: 24,
    marginTop: 4,
  },
});
