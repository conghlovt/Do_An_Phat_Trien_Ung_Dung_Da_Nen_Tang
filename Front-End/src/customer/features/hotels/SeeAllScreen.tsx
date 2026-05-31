import { styles } from '@/src/customer/styles/hotels/seeAll.styles';
import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, Pressable, FlatList,
  Platform, useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { useCustomerBack } from '@/src/customer/navigation/useCustomerBack';
import { ChevronLeft, Zap } from 'lucide-react-native';
import HotelListCard from '@/src/customer/features/hotels/HotelListCard';
import HotelResultsSection from '@/src/customer/features/hotels/HotelResultsSection';
import { useCustomerHotelsStore } from '@/src/customer/services/hotels/hotels.store';
import { applyHotelListFilters } from '@/src/customer/utils/hotels/hotelListFilters';
import { FLASH_SALE_TABS, SECTION_TAG_MAP } from '@/src/customer/utils/hotels/hotelSections';
import {
  DEFAULT_MAX_PRICE,
  DEFAULT_MIN_PRICE,
  type NearMeSortOption,
} from '@/src/customer/constants/hotels/hotelFilters';
import { BOOKING_TYPES } from '@/src/customer/utils/booking/booking';
import type { BookingType, HotelPropertyType } from '@/src/customer/types/hotels';
import { getPriceFilterBounds } from '@/src/customer/utils/hotels/priceFilters';

const VIEWED_SECTION = 'Khách sạn đã xem';

export default function SeeAllScreen() {
  const goBack = useCustomerBack('/customer/dashboard');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentTheme } = useThemeContext();
  const params = useLocalSearchParams<{ section: string; tab?: string }>();
  const sectionTitle = params.section || 'Khách sạn';
  const isFlashSale = sectionTitle === 'Flash Sale';
  const isViewedSection = sectionTitle === VIEWED_SECTION;
  const isWebLayout = Platform.OS === 'web' && width >= 768;
  const initialBookingType = BOOKING_TYPES.find(type => type === params.tab);

  const [activeTab, setActiveTab] = useState<BookingType | undefined>(
    initialBookingType ?? (isFlashSale ? 'Theo giờ' : undefined),
  );
  const [selectedBookingType, setSelectedBookingType] = useState<BookingType | undefined>(
    initialBookingType ?? 'Theo giờ',
  );
  const {
    hotels,
    hotelsLoading: loading,
    clearHotels,
    fetchHotels,
    fetchViewedHotels,
  } = useCustomerHotelsStore();
  const [selectedSort, setSelectedSort] = useState<NearMeSortOption>('relevant');
  const [selectedHotelTypes, setSelectedHotelTypes] = useState<HotelPropertyType[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | undefined>();
  const [selectedCleanlinessRating, setSelectedCleanlinessRating] = useState<number | undefined>();
  const [minPrice, setMinPrice] = useState(DEFAULT_MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);

  const [countdown, setCountdown] = useState({ h: 2, m: 37, s: 14 });

  useEffect(() => {
    if (!isFlashSale) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 0; m = 0; s = 0; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFlashSale]);

  useEffect(() => {
    if (isViewedSection) {
      void fetchViewedHotels();

      return () => clearHotels();
    }

    const tag = isFlashSale ? activeTab : SECTION_TAG_MAP[sectionTitle];
    const apiSort = selectedSort === 'distance' ? 'relevant' : selectedSort;
    void fetchHotels({
      tag,
      sort: apiSort,
      limit: 30,
      roomAmenities: selectedAmenities.join(',') || undefined,
    });

    return () => clearHotels();
  }, [
    activeTab,
    selectedSort,
    sectionTitle,
    isViewedSection,
    isFlashSale,
    selectedAmenities,
    fetchHotels,
    fetchViewedHotels,
    clearHotels,
  ]);

  const handleBookingTypeSelect = (type: BookingType) => {
    setSelectedBookingType(type);
    if (isFlashSale && FLASH_SALE_TABS.includes(type)) {
      setActiveTab(type);
    }
  };

  const resetFilters = () => {
    setSelectedHotelTypes([]);
    setSelectedAmenities([]);
    setSelectedRating(undefined);
    setSelectedCleanlinessRating(undefined);
    setMinPrice(DEFAULT_MIN_PRICE);
    setMaxPrice(DEFAULT_MAX_PRICE);
  };

  const activeFilterCount =
    selectedHotelTypes.length +
    selectedAmenities.length +
    (selectedRating ? 1 : 0) +
    (selectedCleanlinessRating ? 1 : 0) +
    (minPrice !== DEFAULT_MIN_PRICE || maxPrice !== DEFAULT_MAX_PRICE ? 1 : 0);
  const appliedPriceBounds = useMemo(() => getPriceFilterBounds(minPrice, maxPrice), [minPrice, maxPrice]);

  const filteredHotels = useMemo(() => applyHotelListFilters(hotels, {
    maxPrice: appliedPriceBounds.maxPrice,
    minCleanlinessRating: selectedCleanlinessRating,
    minPrice: appliedPriceBounds.minPrice,
    minRating: selectedRating,
    selectedAmenities,
    selectedBookingTypes: selectedBookingType ? [selectedBookingType] : [],
    selectedHotelTypes,
    sort: selectedSort === 'distance' ? 'relevant' : selectedSort,
  }), [appliedPriceBounds, hotels, selectedAmenities, selectedBookingType, selectedCleanlinessRating, selectedHotelTypes, selectedRating, selectedSort]);

  const pad = (n: number) => String(n).padStart(2, '0');

  const renderHotelList = () => (
    <FlatList
      style={isWebLayout && styles.webListWrap}
      data={loading ? Array(3).fill(null) : filteredHotels}
      keyExtractor={(item, i) => (item ? String(item.id) : `skeleton-${i}`)}
      contentContainerStyle={[styles.list, isWebLayout && styles.webList]}
      showsVerticalScrollIndicator={isWebLayout}
      renderItem={({ item }) =>
        loading ? (
          <View style={[styles.skeleton, { backgroundColor: currentTheme.card }]} />
        ) : (
          <HotelListCard hotel={item} bookingType={selectedBookingType} isFlashSale={isFlashSale} />
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
      <View style={[styles.gradientBg, isWebLayout && styles.webGradientBg]} />

      <View style={[styles.header, isWebLayout && styles.webHeader]}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <ChevronLeft size={26} color={currentTheme.text} />
        </Pressable>
        <View style={styles.titleWrap}>
          {isFlashSale && <Zap size={20} color="#eab308" fill="#eab308" />}
          <Text style={[styles.title, { color: currentTheme.text }]}>{sectionTitle}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {isFlashSale && (
        <View style={[styles.flashControlRow, isWebLayout && styles.webFlashControlRow]}>
          <View style={styles.tabBar}>
            {FLASH_SALE_TABS.map(tab => (
              <Pressable
                key={tab}
                style={[styles.tabBtn, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }, activeTab === tab && styles.tabBtnActive]}
                onPress={() => {
                  setActiveTab(tab);
                  setSelectedBookingType(tab);
                }}
              >
                <Text style={[styles.tabText, { color: currentTheme.textSecondary }, activeTab === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.countdownBar}>
            <Text style={styles.countdownLabel}>Kết thúc sau</Text>
            <View style={styles.countdownTimer}>
              <View style={styles.timeUnit}><Text style={styles.timeNum}>{pad(countdown.h)}</Text></View>
              <Text style={styles.timeSep}>:</Text>
              <View style={styles.timeUnit}><Text style={styles.timeNum}>{pad(countdown.m)}</Text></View>
              <Text style={styles.timeSep}>:</Text>
              <View style={styles.timeUnit}><Text style={styles.timeNum}>{pad(countdown.s)}</Text></View>
            </View>
          </View>
        </View>
      )}

      <HotelResultsSection
        activeFilterCount={activeFilterCount}
        collectionTitle={sectionTitle}
        filteredCount={filteredHotels.length}
        loading={loading}
        maxPrice={maxPrice}
        minPrice={minPrice}
        onBookingTypeChange={handleBookingTypeSelect}
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
        showBookingType={!isFlashSale}
        showCollectionTitle={false}
        styles={styles}
      />
    </View>
  );
}
