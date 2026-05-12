import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, ChevronDown, MessageCircle, Bell, Search } from 'lucide-react-native';
import { useLocationContext } from '@/src/customer/utils/LocationContext';
import { useThemeContext } from '@/src/customer/utils/ThemeContext';
import LocationPickerModal from './LocationPickerModal';

interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  isScrolled?: boolean;
}

export default function Header({ onOpenSearch, onOpenNotifications, isScrolled = false }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { selectedProvince, isLoading } = useLocationContext();
  const { currentTheme } = useThemeContext();
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  return (
    <>
      <View style={[
        styles.container,
        { paddingTop: insets.top + 8 },
        isScrolled 
          ? [styles.scrolled, { backgroundColor: currentTheme.card }] 
          : [styles.notScrolled, { backgroundColor: currentTheme.background }],
      ]}>
        {/* Location + Actions — hidden when scrolled */}
        {!isScrolled && (
          <View style={styles.topRow}>
            <View style={styles.brandBlock}>
              <Text style={styles.brand}>StayHub</Text>
              <Text style={[styles.subtitle, { color: currentTheme.textSecondary }]}>Khám phá khách sạn và ưu đãi tại</Text>

              {/* ← Nút chọn vị trí */}
              <Pressable
                style={styles.locationRow}
                onPress={() => setLocationModalVisible(true)}
                hitSlop={8}
              >
                {isLoading ? (
                  <ActivityIndicator size={14} color="#599373" />
                ) : (
                  <MapPin size={16} color={currentTheme.text} fill={currentTheme.text} />
                )}
                <Text style={[styles.location, { color: currentTheme.text }]} numberOfLines={1}>
                  {selectedProvince.name}
                </Text>
                <ChevronDown size={16} color={currentTheme.text} />
              </Pressable>
            </View>

            <View style={styles.actions}>
              <Pressable style={[styles.actionBtn, { backgroundColor: 'rgba(133,194,164,0.2)' }]}>
                <MessageCircle size={22} color={currentTheme.textSecondary} strokeWidth={1.5} />
              </Pressable>
              <Pressable style={[styles.actionBtn, { backgroundColor: 'rgba(133,194,164,0.2)' }]} onPress={onOpenNotifications}>
                <Bell size={22} color={currentTheme.textSecondary} strokeWidth={1.5} />
                <View style={styles.badge} />
              </Pressable>
            </View>
          </View>
        )}

        {/* Search row */}
        <View style={styles.searchRow}>
          <Pressable style={[styles.searchBar, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]} onPress={onOpenSearch}>
            <Search size={18} color="#85c2a4" />
            <Text style={[styles.searchPlaceholder, { color: currentTheme.textSecondary }]}>Tên khách sạn, hoặc quận...</Text>
          </Pressable>
          {isScrolled && (
            <View style={styles.actions}>
              <Pressable style={[styles.actionBtnSmall, { backgroundColor: currentTheme.background }]}>
                <MessageCircle size={20} color={currentTheme.textSecondary} strokeWidth={1.5} />
              </Pressable>
              <Pressable style={[styles.actionBtnSmall, { backgroundColor: currentTheme.background }]} onPress={onOpenNotifications}>
                <Bell size={20} color={currentTheme.textSecondary} strokeWidth={1.5} />
                <View style={styles.badgeSmall} />
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Modal chọn tỉnh/thành */}
      <LocationPickerModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 12 },
  scrolled: {},
  notScrolled: {
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  brandBlock: {
    flex: 1,
    marginRight: 12,
  },
  brand: { fontSize: 20, fontWeight: '800', color: '#599373', letterSpacing: -0.5 },
  subtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  location: {
    fontSize: 15,
    fontWeight: '700',
    maxWidth: 160,
  },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  actionBtnSmall: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444',
    borderWidth: 1.5, borderColor: '#fff',
  },
  badgeSmall: {
    position: 'absolute', top: 4, right: 4,
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444',
    borderWidth: 1.5, borderColor: '#fff',
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 99, paddingHorizontal: 16, paddingVertical: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05,
    shadowRadius: 4, elevation: 2, borderWidth: 1,
  },
  searchPlaceholder: { fontSize: 14, fontWeight: '500', flex: 1 },
});
