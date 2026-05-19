import React, { useState, useCallback, useEffect } from 'react';
import {
  Platform,
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, MapPin, Search, Navigation, ChevronDown, ChevronRight } from 'lucide-react-native';
import { useLocationContext, Province } from '@/src/customer/features/location/context/LocationContext';
import { STAYHUB_COLOR, styles } from './LocationPickerModal.styles';

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
}

const normalizeSearch = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const WEB_INPUT_RESET = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null;

export default function LocationPickerModal({ visible, onClose }: LocationPickerModalProps) {
  const insets = useSafeAreaInsets();
  const { selectedProvince, setSelectedProvince, provinces, isLoading, detectLocation } =
    useLocationContext();

  const [query, setQuery] = useState('');
  const [activeProvince, setActiveProvince] = useState<Province>(selectedProvince);
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setActiveProvince(selectedProvince);
      setExpandedDistrict(null);
    }
  }, [selectedProvince, visible]);

  const filteredProvinces = query.trim()
    ? provinces.filter((p) =>
        normalizeSearch(p.name).includes(normalizeSearch(query))
      )
    : provinces;

  const districts = activeProvince.districts ?? [];

  const handleProvincePress = useCallback((province: Province) => {
    setActiveProvince(province);
    setExpandedDistrict(null);
  }, []);

  const handleSelectDistrict = useCallback(
    (districtName: string) => {
      setSelectedProvince({
        ...activeProvince,
        selectedDistrict: districtName,
        selectedWard: undefined,
      });
      onClose();
    },
    [activeProvince, setSelectedProvince, onClose]
  );

  const handleDistrictPress = useCallback(
    (districtName: string, hasWards: boolean) => {
      if (!hasWards) {
        handleSelectDistrict(districtName);
        return;
      }

      setExpandedDistrict((current) => current === districtName ? null : districtName);
    },
    [handleSelectDistrict]
  );

  const handleWardPress = useCallback(
    (districtName: string, wardName: string) => {
      setSelectedProvince({
        ...activeProvince,
        selectedDistrict: districtName,
        selectedWard: wardName,
      });
      onClose();
    },
    [activeProvince, setSelectedProvince, onClose],
  );

  const handleSelectProvince = useCallback(() => {
    setSelectedProvince({
      ...activeProvince,
      selectedDistrict: undefined,
      selectedWard: undefined,
    });
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
            <MapPin size={14} color={STAYHUB_COLOR} />
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
            style={[styles.searchInput, WEB_INPUT_RESET]}
            placeholder="Tìm tỉnh thành..."
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
            selectionColor={STAYHUB_COLOR}
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
              districts.map(district => {
                const isExpanded = expandedDistrict === district.name;
                const hasWards = district.wards.length > 0;

                return (
                  <View key={district.name}>
                    <Pressable
                      style={styles.districtItem}
                      onPress={() => handleDistrictPress(district.name, hasWards)}
                    >
                      <Text style={styles.districtText}>{district.name}</Text>
                      <View style={styles.countWithIcon}>
                        <Text style={styles.districtCount}>({district.count})</Text>
                        {hasWards ? (
                          isExpanded ? (
                            <ChevronDown size={16} color="#9ca3af" />
                          ) : (
                            <ChevronRight size={16} color="#9ca3af" />
                          )
                        ) : null}
                      </View>
                    </Pressable>

                    {isExpanded ? (
                      <View style={styles.wardList}>
                        <Pressable
                          style={styles.wardItem}
                          onPress={() => handleSelectDistrict(district.name)}
                        >
                          <Text style={styles.wardAll}>Tất cả {district.name}</Text>
                          <Text style={styles.districtCount}>({district.count})</Text>
                        </Pressable>
                        {district.wards.map((ward) => (
                          <Pressable
                            key={`${district.name}-${ward.name}`}
                            style={styles.wardItem}
                            onPress={() => handleWardPress(district.name, ward.name)}
                          >
                            <Text style={styles.wardText}>{ward.name}</Text>
                            <Text style={styles.districtCount}>({ward.count})</Text>
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                  </View>
                );
              })
            ) : (
              <View style={styles.noDistricts}>
                <Text style={styles.noDistrictsText}>
                  Chưa có khách sạn hoặc homestay trong khu vực này.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
