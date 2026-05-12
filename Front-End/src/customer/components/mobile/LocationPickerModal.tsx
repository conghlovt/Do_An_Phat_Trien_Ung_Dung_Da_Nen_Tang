import React, { useState, useCallback, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, MapPin, Search, Navigation, ChevronRight } from 'lucide-react-native';
import { useLocationContext, Province, PROVINCES } from '@/src/customer/utils/LocationContext';

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
}

// Dữ liệu quận/huyện của Hà Nội (mẫu)
const DISTRICTS_BY_PROVINCE: Record<string, Array<{ name: string; count: number }>> = {
  '01': [
    { name: 'Ba Đình', count: 810 },
    { name: 'Ba Vì', count: 46 },
    { name: 'Bắc Từ Liêm', count: 80 },
    { name: 'Cầu Giấy', count: 549 },
    { name: 'Chương Mỹ', count: 2 },
    { name: 'Đông Anh', count: 24 },
    { name: 'Đống Đa', count: 268 },
    { name: 'Gia Lâm', count: 205 },
    { name: 'Hà Đông', count: 115 },
    { name: 'Hai Bà Trưng', count: 256 },
    { name: 'Hoài Đức', count: 27 },
    { name: 'Hoàn Kiếm', count: 1970 },
    { name: 'Hoàng Mai', count: 79 },
    { name: 'Long Biên', count: 108 },
    { name: 'Mê Linh', count: 3 },
    { name: 'Mỹ Đức', count: 1 },
    { name: 'Nam Từ Liêm', count: 56 },
    { name: 'Sóc Sơn', count: 8 },
    { name: 'Tây Hồ', count: 89 },
    { name: 'Thạch Thất', count: 5 },
    { name: 'Thanh Oai', count: 3 },
    { name: 'Thanh Trì', count: 12 },
    { name: 'Thanh Xuân', count: 145 },
    { name: 'Thường Tín', count: 4 },
    { name: 'Ứng Hòa', count: 2 },
  ],
  '79': [
    { name: 'Bình Thạnh', count: 284 },
    { name: 'Quận 1', count: 892 },
    { name: 'Quận 2', count: 156 },
    { name: 'Quận 3', count: 445 },
    { name: 'Quận 4', count: 112 },
    { name: 'Quận 5', count: 234 },
    { name: 'Quận 6', count: 89 },
    { name: 'Quận 7', count: 198 },
    { name: 'Quận 8', count: 67 },
    { name: 'Quận 9', count: 145 },
    { name: 'Quận 10', count: 178 },
    { name: 'Quận 11', count: 123 },
    { name: 'Quận 12', count: 89 },
    { name: 'Gò Vấp', count: 112 },
    { name: 'Phú Nhuận', count: 134 },
    { name: 'Tân Bình', count: 267 },
    { name: 'Tân Phú', count: 178 },
  ],
};

export default function LocationPickerModal({ visible, onClose }: LocationPickerModalProps) {
  const insets = useSafeAreaInsets();
  const { selectedProvince, setSelectedProvince, provinces, isLoading, detectLocation } =
    useLocationContext();

  const [query, setQuery] = useState('');
  const [activeProvince, setActiveProvince] = useState<Province>(selectedProvince);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const filteredProvinces = query.trim()
    ? provinces.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase())
      )
    : provinces;

  const districts = DISTRICTS_BY_PROVINCE[activeProvince.id] ?? [];

  const handleProvincePress = useCallback((province: Province) => {
    setActiveProvince(province);
  }, []);

  const handleDistrictPress = useCallback(
    (districtName: string) => {
      setSelectedProvince(activeProvince);
      onClose();
    },
    [activeProvince, setSelectedProvince, onClose]
  );

  const handleSelectProvince = useCallback(() => {
    setSelectedProvince(activeProvince);
    onClose();
  }, [activeProvince, setSelectedProvince, onClose]);

  const handleNearMe = useCallback(async () => {
    await detectLocation();
    onClose();
  }, [detectLocation, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top || 20 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onClose} hitSlop={12}>
            <X size={22} color="#374151" />
          </Pressable>
          <Text style={styles.headerTitle}>Vui lòng chọn khu vực</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Selected location + Near me */}
        <View style={styles.locationBar}>
          <View style={styles.currentLocation}>
            <MapPin size={14} color="#f97316" />
            <Text style={styles.currentLocationText} numberOfLines={1}>
              {activeProvince.name}
            </Text>
          </View>
          <Pressable
            style={[styles.nearMeBtn, isLoading && styles.nearMeBtnLoading]}
            onPress={handleNearMe}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size={14} color="#fff" />
            ) : (
              <Navigation size={14} color="#fff" />
            )}
            <Text style={styles.nearMeBtnText}>Gần tôi</Text>
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={16} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm tỉnh thành..."
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <X size={16} color="#9ca3af" />
            </Pressable>
          )}
        </View>

        {/* Two-column list */}
        <View style={styles.columns}>
          {/* Left: Province list */}
          <ScrollView
            style={styles.provinceList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {filteredProvinces.map(province => {
              const isActive = province.id === activeProvince.id;
              return (
                <Pressable
                  key={province.id}
                  style={[
                    styles.provinceItem,
                    isActive && styles.provinceItemActive,
                  ]}
                  onPress={() => handleProvincePress(province)}
                >
                  <Text
                    style={[
                      styles.provinceText,
                      isActive && styles.provinceTextActive,
                    ]}
                    numberOfLines={2}
                  >
                    {province.name}
                  </Text>
                  {isActive && (
                    <View style={styles.activeIndicator} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Right: District list */}
          <ScrollView
            style={styles.districtList}
            showsVerticalScrollIndicator={false}
          >
            {/* "Chọn cả tỉnh" option */}
            <Pressable
              style={styles.districtItem}
              onPress={handleSelectProvince}
            >
              <Text style={styles.districtAll}>
                Tất cả {activeProvince.name}
              </Text>
              {activeProvince.numberOfHotels !== undefined && (
                <Text style={styles.districtCount}>
                  ({activeProvince.numberOfHotels})
                </Text>
              )}
            </Pressable>

            {districts.length > 0 ? (
              districts.map(district => (
                <Pressable
                  key={district.name}
                  style={styles.districtItem}
                  onPress={() => handleDistrictPress(district.name)}
                >
                  <Text style={styles.districtText}>{district.name}</Text>
                  <Text style={styles.districtCount}>({district.count})</Text>
                </Pressable>
              ))
            ) : (
              <View style={styles.noDistricts}>
                <Text style={styles.noDistrictsText}>
                  Nhấn để chọn {activeProvince.name}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  /* Location bar */
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
  },
  currentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  currentLocationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f97316',
  },
  nearMeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#599373',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
  },
  nearMeBtnLoading: {
    opacity: 0.7,
  },
  nearMeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },

  /* Search */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    gap: 8,
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0,
  },

  /* Columns */
  columns: {
    flex: 1,
    flexDirection: 'row',
  },
  provinceList: {
    width: 130,
    backgroundColor: '#fafafa',
  },
  divider: {
    width: 1,
    backgroundColor: '#f3f4f6',
  },
  districtList: {
    flex: 1,
    backgroundColor: '#fff',
  },

  /* Province item */
  provinceItem: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    position: 'relative',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3f4f6',
  },
  provinceItemActive: {
    backgroundColor: '#fff',
  },
  provinceText: {
    fontSize: 13.5,
    color: '#6b7280',
    fontWeight: '500',
    lineHeight: 18,
  },
  provinceTextActive: {
    color: '#f97316',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
    backgroundColor: '#f97316',
  },

  /* District item */
  districtItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f9fafb',
  },
  districtAll: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#f97316',
  },
  districtText: {
    fontSize: 13.5,
    color: '#374151',
    fontWeight: '400',
    flex: 1,
  },
  districtCount: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  noDistricts: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  noDistrictsText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
