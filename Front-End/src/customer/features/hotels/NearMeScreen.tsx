import { styles } from '@/src/customer/styles/hotels/nearMe.styles';
import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, Pressable,
  FlatList, Platform, useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { useCustomerBack } from '@/src/customer/navigation/useCustomerBack';
import { ChevronLeft } from 'lucide-react-native';
import HotelListCard from '@/src/customer/features/hotels/HotelListCard';
import HotelResultsSection from '@/src/customer/features/hotels/HotelResultsSection';
import { useCustomerHotelsStore } from '@/src/customer/services/hotels/hotels.store';
import { applyHotelListFilters } from '@/src/customer/utils/hotels/hotelListFilters';
import {
  DEFAULT_MAX_PRICE,
  DEFAULT_MIN_PRICE,
  type NearMeSortOption,
} from '@/src/customer/constants/hotels/hotelFilters';
import { getPriceFilterBounds } from '@/src/customer/utils/hotels/priceFilters';
import type { BookingType, HotelPropertyType } from '@/src/customer/types/hotels';

const isBookingType = (value: unknown): value is BookingType =>
  value === 'Theo giờ' || value === 'Qua đêm' || value === 'Theo ngày';

export default function NearMeScreen() {
  const goBack = useCustomerBack('/customer/dashboard');
  const insets = useSafeAreaInsets();
  const { currentTheme } = useThemeContext();
  const params = useLocalSearchParams<{ bookingType: string; title: string; lock: string; keyword?: string }>();
  const { width } = useWindowDimensions();
  const isWebLayout = Platform.OS === 'web' && width >= 768;
  const searchKeyword = params.keyword?.trim() ?? '';
  const initialBookingType = isBookingType(params.bookingType) ? params.bookingType : 'Theo giờ';

  const [selectedSort, setSelectedSort] = useState<NearMeSortOption>('relevant');
  const [selectedBookingType, setSelectedBookingType] = useState<BookingType>(initialBookingType);
  const lockBookingType = params.lock === '1';

  const { hotels, hotelsLoading: loading, fetchHotels } = useCustomerHotelsStore();

  // Filter states
  const [selectedHotelTypes, setSelectedHotelTypes] = useState<HotelPropertyType[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | undefined>();
  const [selectedCleanlinessRating, setSelectedCleanlinessRating] = useState<number | undefined>();
  const [minPrice, setMinPrice] = useState(DEFAULT_MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);

  useEffect(() => {
    const apiSort: 'relevant' | 'rating' | 'price-asc' | 'price-desc' =
      selectedSort === 'distance' ? 'relevant' : selectedSort;
    void fetchHotels({
      keyword: searchKeyword || undefined,
      sort: apiSort,
      tag: selectedBookingType,
      limit: 20,
      roomAmenities: selectedAmenities.join(',') || undefined,
    });
  }, [fetchHotels, searchKeyword, selectedSort, selectedBookingType, selectedAmenities]);

  const activeFilterCount =
    selectedHotelTypes.length +
    selectedAmenities.length +
    (selectedRating ? 1 : 0) +
    (selectedCleanlinessRating ? 1 : 0) +
    (minPrice !== DEFAULT_MIN_PRICE || maxPrice !== DEFAULT_MAX_PRICE ? 1 : 0);
  const appliedPriceBounds = useMemo(() => getPriceFilterBounds(minPrice, maxPrice), [minPrice, maxPrice]);
  const resetFilters = () => {
    setSelectedHotelTypes([]);
    setSelectedAmenities([]);
    setSelectedRating(undefined);
    setSelectedCleanlinessRating(undefined);
    setMinPrice(DEFAULT_MIN_PRICE);
    setMaxPrice(DEFAULT_MAX_PRICE);
  };

  const filteredHotels = useMemo(() => applyHotelListFilters(hotels, {
    maxPrice: appliedPriceBounds.maxPrice,
    minCleanlinessRating: selectedCleanlinessRating,
    minPrice: appliedPriceBounds.minPrice,
    minRating: selectedRating,
    selectedAmenities,
    selectedHotelTypes,
    sort: selectedSort === 'distance' ? 'relevant' : selectedSort,
  }), [appliedPriceBounds, hotels, selectedAmenities, selectedCleanlinessRating, selectedHotelTypes, selectedRating, selectedSort]);

  const renderHotelList = () => (
    <FlatList
      style={isWebLayout && styles.webListWrap}
      data={loading ? Array(3).fill(null) : filteredHotels}
      keyExtractor={(_, i) => i.toString()}
      contentContainerStyle={[styles.list, isWebLayout && styles.webList]}
      showsVerticalScrollIndicator={isWebLayout}
      renderItem={({ item }) =>
        loading ? (
          <View style={[styles.skeleton, { backgroundColor: currentTheme.card }]} />
        ) : (
          <HotelListCard hotel={item} />
        )
      }
      ListEmptyComponent={
        !loading ? (
          <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>Không tìm thấy khách sạn phù hợp.</Text>
        ) : null
      }
    />
  );

  return (
    <View style={[styles.container, isWebLayout && styles.webContainer, { backgroundColor: currentTheme.background, paddingTop: isWebLayout ? 0 : insets.top }]}>
      {/* Gradient BG */}
      <View style={[styles.gradientBg, isWebLayout && styles.webGradientBg]} />

      {/* Header */}
      <View style={[styles.header, isWebLayout && styles.webHeader]}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <ChevronLeft size={26} color={currentTheme.text} />
        </Pressable>
        <Text style={[styles.title, { color: currentTheme.text }]}>{params.title || 'Gần tôi'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <HotelResultsSection
        activeFilterCount={activeFilterCount}
        collectionTitle={searchKeyword ? `Kết quả "${searchKeyword}"` : params.title || `Bộ sưu tập ${selectedBookingType}`}
        filteredCount={filteredHotels.length}
        loading={loading}
        maxPrice={maxPrice}
        minPrice={minPrice}
        onBookingTypeChange={setSelectedBookingType}
        onCleanlinessRatingChange={setSelectedCleanlinessRating}
        onMaxPriceChange={setMaxPrice}
        onMinPriceChange={setMinPrice}
        onRatingChange={setSelectedRating}
        onResetFilters={resetFilters}
        onSortChange={setSelectedSort}
        renderHotelList={renderHotelList}
        selectedAmenities={selectedAmenities}
        selectedBookingType={selectedBookingType}
        selectedCleanlinessRating={selectedCleanlinessRating}
        selectedHotelTypes={selectedHotelTypes}
        selectedRating={selectedRating}
        selectedSort={selectedSort}
        setSelectedAmenities={setSelectedAmenities}
        setSelectedHotelTypes={setSelectedHotelTypes}
        showBookingType={!lockBookingType}
        showCollectionTitle={false}
        styles={styles}
      />
    </View>
  );
}
