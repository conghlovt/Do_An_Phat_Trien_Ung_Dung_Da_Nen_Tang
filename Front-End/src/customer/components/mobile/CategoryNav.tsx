import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import {
  Wallet, Heart, Film, Zap, Sun, Smartphone, Sparkles, Tent, BadgePercent, Home,
} from 'lucide-react-native';
import { useThemeContext } from '@/src/customer/utils/ThemeContext';

interface Category {
  name: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
  bg: string;
  iconColor: string;
  badge?: string;
}

const CATEGORIES: Category[] = [
  { name: 'Trốn Nắng', Icon: Sun, bg: '#e8f6ed', iconColor: '#85c2a4', badge: 'UP TO 28K' },
  { name: 'Tình yêu', Icon: Heart, bg: '#fef2f2', iconColor: '#ef4444' },
  { name: 'Phòng Phim', Icon: Film, bg: '#e8f6ed', iconColor: '#85c2a4' },
  { name: 'Flash Deal', Icon: Zap, bg: '#fefce8', iconColor: '#eab308' },
  { name: 'Check-in kín đáo', Icon: Smartphone, bg: '#eff6ff', iconColor: '#3b82f6' },
  { name: 'Stay Xịn Mới', Icon: Sparkles, bg: '#f5f3ff', iconColor: '#8b5cf6', badge: 'NEW' },
  { name: 'Camping', Icon: Tent, bg: '#f0fdf4', iconColor: '#16a34a' },
  { name: 'Giảm Giá', Icon: BadgePercent, bg: '#fdf2f8', iconColor: '#ec4899' },
  { name: 'Homestay', Icon: Home, bg: '#f0fdfa', iconColor: '#0d9488' },
];

export default function CategoryNav({ onCategoryClick }: { onCategoryClick?: (name: string) => void }) {
  const { currentTheme } = useThemeContext();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {CATEGORIES.map(({ name, Icon, bg, iconColor, badge }) => (
        <Pressable key={name} style={styles.item} onPress={() => onCategoryClick?.(name)}>
          <View style={styles.iconWrapper}>
            <View style={[styles.iconCircle, { backgroundColor: bg }]}>
              <Icon size={24} color={iconColor} />
            </View>
            {badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.label, { color: currentTheme.textSecondary }]} numberOfLines={2}>{name}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingBottom: 8, paddingTop: 8, gap: 16 },
  item: { alignItems: 'center', gap: 6, width: 72 },
  iconWrapper: { position: 'relative' },
  iconCircle: {
    width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: -6, left: '50%', transform: [{ translateX: -18 }],
    backgroundColor: '#ef4444', borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2,
    zIndex: 50,
  },
  badgeText: { color: '#fff', fontSize: 8, fontWeight: '700' },
  label: { fontSize: 11, fontWeight: '500', textAlign: 'center', lineHeight: 14 },
});
