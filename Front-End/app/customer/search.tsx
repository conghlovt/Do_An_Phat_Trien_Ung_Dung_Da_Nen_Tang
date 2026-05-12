import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/src/customer/utils/ThemeContext';
import { X, Navigation, Calendar } from 'lucide-react-native';

type TabType = 'hourly' | 'overnight' | 'daily';

const TABS: { id: TabType; label: string }[] = [
  { id: 'hourly', label: 'Theo giờ' },
  { id: 'overnight', label: 'Qua đêm' },
  { id: 'daily', label: 'Theo ngày' },
];

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentTheme, isDarkMode } = useThemeContext();
  const [activeTab, setActiveTab] = useState<TabType>('hourly');

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.card }]}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <X size={24} color={currentTheme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Tìm kiếm khách sạn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Search Card */}
        <View style={[styles.card, { backgroundColor: currentTheme.card }]}>
          {/* Tabs */}
          <View style={[styles.tabs, { backgroundColor: currentTheme.buttonBg, borderColor: currentTheme.border }]}>
            {TABS.map(({ id, label }) => (
              <Pressable
                key={id}
                onPress={() => setActiveTab(id)}
                style={[styles.tab, activeTab === id && styles.tabActive]}
              >
                <Text style={[styles.tabText, activeTab === id && styles.tabTextActive, { color: activeTab === id ? '#fff' : currentTheme.textSecondary }]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Inputs */}
          <View style={[styles.inputRow, { backgroundColor: currentTheme.buttonBg, borderColor: currentTheme.border }]}>
            <X size={20} color={currentTheme.iconInactive} />
            <TextInput
              placeholder="Tìm địa điểm, khách sạn"
              placeholderTextColor={currentTheme.iconInactive}
              style={[styles.input, { color: currentTheme.text }]}
            />
            <Pressable>
              <Navigation size={18} color={currentTheme.iconInactive} />
            </Pressable>
          </View>

          <View style={[styles.inputRow, { backgroundColor: currentTheme.buttonBg, borderColor: currentTheme.border }]}>
            <Calendar size={20} color={currentTheme.iconInactive} />
            <Text style={[styles.input, { color: currentTheme.iconInactive, flex: 1 }]}>Nhận/ trả phòng</Text>
            <Text style={styles.anyText}>Bất kỳ</Text>
          </View>

          <Pressable style={styles.searchBtn}>
            <Text style={styles.searchBtnText}>Tìm kiếm</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  closeBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  card: {
    borderRadius: 20, margin: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05,
    shadowRadius: 4, elevation: 2,
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: 99, padding: 4, marginBottom: 16,
    borderWidth: 1,
  },
  tab: { flex: 1, borderRadius: 99, paddingVertical: 8, alignItems: 'center' },
  tabActive: { backgroundColor: '#85c2a4' },
  tabText: { fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: '#fff' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1,
    marginBottom: 12,
  },
  input: { flex: 1, fontSize: 15 },
  anyText: { fontSize: 15, fontWeight: '500', color: '#599373' },
  searchBtn: {
    backgroundColor: '#85c2a4', borderRadius: 99, paddingVertical: 14, alignItems: 'center',
  },
  searchBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
