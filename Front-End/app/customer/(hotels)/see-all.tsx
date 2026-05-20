import { styles } from '@/src/customer/components/hotels/seeAll.styles';
import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, Pressable, FlatList, TextInput, Modal,
  Platform, ScrollView, useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { useCustomerBack } from '@/src/customer/navigation/useCustomerBack';
import {
  ChevronLeft, SlidersHorizontal, ArrowDownUp,
  Zap, X,
} from 'lucide-react-native';
import HotelListCard from '@/src/customer/components/hotels/HotelListCard';
import { useCustomerHotelsStore } from '@/src/customer/store/hotels.store';
import { viewedHotelsStorage } from '@/src/customer/utils/viewedHotels';
import {
  applyHotelListFilters,
  HOTEL_AMENITY_FILTERS,
  HOTEL_FILTER_TYPES,
  SORT_OPTIONS,
  type SortOption,
} from '@/src/customer/utils/hotelListFilters';
import { FLASH_SALE_TABS, SECTION_TAG_MAP } from '@/src/customer/utils/hotelSections';
import {
  CUSTOMER_PRIMARY_DARK as PRIMARY_DARK,
  DEFAULT_MAX_PRICE,
  DEFAULT_MIN_PRICE,
} from '@/src/customer/constants/hotelFilters';

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

  const [activeTab, setActiveTab] = useState(params.tab || (isFlashSale ? 'Theo giờ' : undefined));
  const {
    hotels,
    hotelsLoading: loading,
    clearHotels,
    fetchHotels,
    fetchViewedHotels,
  } = useCustomerHotelsStore();
  const [selectedSort, setSelectedSort] = useState<SortOption>('relevant');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedHotelTypes, setSelectedHotelTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [minPrice, setMinPrice] = useState(DEFAULT_MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
  // Applied filter values (chỉ gửi API sau khi bấm "Áp dụng")
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | undefined>(undefined);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | undefined>(undefined);

  // Countdown state for Flash Sale
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
      viewedHotelsStorage.getAll()
        .then((viewedHotels) => fetchViewedHotels(viewedHotels));

      return () => clearHotels();
    }

    const tag = isFlashSale ? activeTab : SECTION_TAG_MAP[sectionTitle];
    void fetchHotels({
      tag,
      sort: selectedSort,
      limit: 30,
      minPrice: appliedMinPrice,
      maxPrice: appliedMaxPrice,
      roomAmenities: selectedAmenities.join(',') || undefined,
    });

    return () => clearHotels();
  }, [activeTab, selectedSort, sectionTitle, appliedMinPrice, appliedMaxPrice, isViewedSection, isFlashSale, selectedAmenities, fetchHotels, fetchViewedHotels, clearHotels]);

  const filteredHotels = useMemo(() => applyHotelListFilters(hotels, {
    maxPrice: appliedMaxPrice,
    minPrice: appliedMinPrice,
    selectedAmenities,
    selectedHotelTypes,
    sort: selectedSort,
  }), [appliedMaxPrice, appliedMinPrice, hotels, selectedAmenities, selectedHotelTypes, selectedSort]);

  const pad = (n: number) => String(n).padStart(2, '0');

  const toggleHotelType = (type: string) => {
    if (type === 'Tất cả') {
      setSelectedHotelTypes([]);
      return;
    }

    setSelectedHotelTypes(prev => prev.includes(type) ? [] : [type]);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(item => item !== amenity) : [...prev, amenity],
    );
  };

  const selectedSortLabel = SORT_OPTIONS.find(option => option.id === selectedSort)?.label || 'Phù hợp nhất';
  const activeFilterCount = selectedHotelTypes.length + selectedAmenities.length + (appliedMinPrice !== undefined || appliedMaxPrice !== undefined ? 1 : 0);
  const visibleAmenities = showAllAmenities ? HOTEL_AMENITY_FILTERS : HOTEL_AMENITY_FILTERS.slice(0, 10);

  return (
    <View style={[styles.container, isWebLayout && styles.webContainer, { backgroundColor: currentTheme.background, paddingTop: isWebLayout ? 0 : insets.top }]}>
      {/* Green gradient bg */}
      <View style={styles.gradientBg} />

      {/* Header */}
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

      {/* Flash Sale countdown */}
      {isFlashSale && (
        <View style={[styles.countdownBar, isWebLayout && styles.webSection]}>
          <Text style={styles.countdownLabel}>Kết thúc sau</Text>
          <View style={styles.countdownTimer}>
            <View style={styles.timeUnit}><Text style={styles.timeNum}>{pad(countdown.h)}</Text></View>
            <Text style={styles.timeSep}>:</Text>
            <View style={styles.timeUnit}><Text style={styles.timeNum}>{pad(countdown.m)}</Text></View>
            <Text style={styles.timeSep}>:</Text>
            <View style={styles.timeUnit}><Text style={styles.timeNum}>{pad(countdown.s)}</Text></View>
          </View>
        </View>
      )}

      {/* Flash Sale tabs */}
      {isFlashSale && (
        <View style={[styles.tabBar, isWebLayout && styles.webSection]}>
          {FLASH_SALE_TABS.map(tab => (
            <Pressable
              key={tab}
              style={[styles.tabBtn, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: currentTheme.textSecondary }, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Filter Bar */}
      <View style={[styles.filterBar, isWebLayout && styles.webFilterBar]}>
        {isWebLayout && (
          <View style={styles.filterTitleWrap}>
            <Text style={[styles.filterPanelTitle, { color: currentTheme.text }]}>Bộ lọc & sắp xếp</Text>
            <Text style={styles.filterPanelSubtitle}>Tinh chỉnh kết quả khách sạn</Text>
          </View>
        )}
        <Pressable style={[styles.filterChip, !isWebLayout && styles.mobileFilterChip, { backgroundColor: currentTheme.card }]} onPress={() => setShowSortModal(true)}>
          <View style={styles.filterIconBadge}>
            <ArrowDownUp size={16} color={PRIMARY_DARK} />
          </View>
          <View style={styles.filterTextWrap}>
            <Text style={styles.filterChipLabel}>Sắp xếp</Text>
            <Text style={[styles.filterChipValue, { color: currentTheme.text }]} numberOfLines={1}>{selectedSortLabel}</Text>
          </View>
        </Pressable>
        <Pressable style={[styles.filterChip, !isWebLayout && styles.mobileFilterChip, activeFilterCount > 0 && styles.filterChipActive, { backgroundColor: currentTheme.card }]} onPress={() => setShowFilterModal(true)}>
          <View style={styles.filterIconBadge}>
            <SlidersHorizontal size={16} color={PRIMARY_DARK} />
          </View>
          <View style={styles.filterTextWrap}>
            <Text style={styles.filterChipLabel}>Bộ lọc</Text>
            <Text style={[styles.filterChipValue, { color: currentTheme.text }]}>{activeFilterCount > 0 ? `${activeFilterCount} đang chọn` : 'Chưa áp dụng'}</Text>
          </View>
          {activeFilterCount > 0 && (
            <View style={styles.filterCountBadge}>
              <Text style={styles.filterCountText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
        {isWebLayout && (
          <>
            <View style={{ flex: 1 }} />
            <Text style={styles.countText}>{loading ? '...' : `${filteredHotels.length} khách sạn`}</Text>
          </>
        )}
      </View>

      {/* Hotel List */}
      <FlatList
        data={loading ? Array(5).fill(null) : filteredHotels}
        keyExtractor={(item, i) => (item ? String(item.id) : `skeleton-${i}`)}
        contentContainerStyle={[styles.list, isWebLayout && styles.webList]}
        showsVerticalScrollIndicator={isWebLayout}
        renderItem={({ item }) =>
          loading ? (
            <View style={[styles.skeleton, { backgroundColor: currentTheme.card }]} />
          ) : (
            <HotelListCard hotel={item} isFlashSale={isFlashSale} />
          )
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>Không tìm thấy khách sạn phù hợp.</Text>
            </View>
          ) : null
        }
      />

      {/* Sort Modal */}
      <Modal visible={showSortModal} transparent animationType="slide" onRequestClose={() => setShowSortModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowSortModal(false)} />
        <View style={[styles.sheet, { backgroundColor: currentTheme.card, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.sheetHandle, { backgroundColor: currentTheme.border }]} />
          <Text style={[styles.sheetTitle, { color: currentTheme.text }]}>Sắp xếp theo</Text>
          {SORT_OPTIONS.map(opt => (
            <Pressable
              key={opt.id}
              style={[styles.sheetRow, { borderBottomColor: currentTheme.border }]}
              onPress={() => { setSelectedSort(opt.id); setShowSortModal(false); }}
            >
              <Text style={[styles.sheetRowText, { color: currentTheme.textSecondary }, selectedSort === opt.id && { color: PRIMARY_DARK, fontWeight: '600' }]}>
                {opt.label}
              </Text>
              {selectedSort === opt.id && <View style={styles.radioFilled} />}
            </Pressable>
          ))}
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="slide" onRequestClose={() => setShowFilterModal(false)}>
        <View style={[styles.filterModal, { backgroundColor: currentTheme.background }]}>
          <View style={[styles.filterHeader, { paddingTop: insets.top + 8, backgroundColor: currentTheme.card, borderBottomColor: currentTheme.border }]}>
            <Text style={[styles.filterTitle, { color: currentTheme.text }]}>Lọc khách sạn</Text>
            <Pressable onPress={() => setShowFilterModal(false)}>
              <X size={24} color={currentTheme.text} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
            <Text style={[styles.filterSection, { color: currentTheme.text }]}>Loại khách sạn</Text>
            <View style={styles.chipRow}>
              {HOTEL_FILTER_TYPES.map(type => {
                const active = type === 'Tất cả' ? selectedHotelTypes.length === 0 : selectedHotelTypes.includes(type);
                return (
                  <Pressable
                    key={type}
                    style={[styles.chip, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }, active && styles.chipActive]}
                    onPress={() => toggleHotelType(type)}
                  >
                    <Text style={[styles.chipText, { color: currentTheme.textSecondary }, active && styles.chipTextActive]}>{type}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={[styles.filterSection, { color: currentTheme.text }]}>Khoảng giá (VND)</Text>
            <View style={styles.priceRow}>
              <View style={[styles.priceInput, { borderColor: currentTheme.border }]}>
                <Text style={styles.priceLabel}>Từ</Text>
                <TextInput style={[styles.priceField, { color: currentTheme.text }]} value={minPrice} onChangeText={setMinPrice} keyboardType="numeric" placeholderTextColor={currentTheme.iconInactive} />
              </View>
              <Text style={{ color: currentTheme.iconInactive }}>—</Text>
              <View style={[styles.priceInput, { borderColor: currentTheme.border }]}>
                <Text style={styles.priceLabel}>Đến</Text>
                <TextInput style={[styles.priceField, { color: currentTheme.text }]} value={maxPrice} onChangeText={setMaxPrice} keyboardType="numeric" placeholderTextColor={currentTheme.iconInactive} />
              </View>
            </View>

            <Text style={[styles.filterSection, { color: currentTheme.text }]}>Tiện ích phòng</Text>
            <View style={styles.amenityList}>
              {visibleAmenities.map((amenity) => {
                const active = selectedAmenities.includes(amenity);
                return (
                  <Pressable key={amenity} style={styles.amenityRow} onPress={() => toggleAmenity(amenity)}>
                    <View style={[styles.checkbox, active && styles.checkboxActive]}>
                      {active && <Text style={styles.checkboxMark}>✓</Text>}
                    </View>
                    <Text style={[styles.amenityText, { color: currentTheme.text }]}>{amenity}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable style={styles.toggleAmenitiesBtn} onPress={() => setShowAllAmenities(value => !value)}>
              <Text style={styles.toggleAmenitiesText}>{showAllAmenities ? '^ Thu gọn' : 'Xem tất cả'}</Text>
            </Pressable>
          </ScrollView>
          <View style={[styles.filterFooter, { borderTopColor: currentTheme.border, paddingBottom: insets.bottom + 16 }]}>
            <Pressable
              style={[styles.resetBtn, { borderColor: currentTheme.border }]}
              onPress={() => {
                setSelectedHotelTypes([]);
                setSelectedAmenities([]);
                setMinPrice(DEFAULT_MIN_PRICE);
                setMaxPrice(DEFAULT_MAX_PRICE);
                setAppliedMinPrice(undefined);
                setAppliedMaxPrice(undefined);
              }}
            >
              <Text style={[styles.resetBtnText, { color: currentTheme.text }]}>Đặt lại</Text>
            </Pressable>
            <Pressable
              style={styles.applyBtn}
              onPress={() => {
                const min = Number(minPrice);
                const max = Number(maxPrice);
                setAppliedMinPrice(min > 0 ? min : undefined);
                setAppliedMaxPrice(max > 0 ? max : undefined);
                setShowFilterModal(false);
              }}
            >
              <Text style={styles.applyBtnText}>Áp dụng</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
