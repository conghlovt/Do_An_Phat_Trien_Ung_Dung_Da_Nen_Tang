import React, { useRef } from 'react';
import { Platform, ScrollView, View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import {
  Heart, Film, Zap, Sun, Smartphone, Sparkles, Tent, BadgePercent, Home, ChevronLeft, ChevronRight,
} from 'lucide-react-native';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';

interface Category {
  name: string;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  bg: string;
  borderColor: string;
  iconColor: string;
  badge?: string;
}

const CATEGORIES: Category[] = [
  { name: 'Trốn Nắng', Icon: Sun, bg: '#fff7ed', borderColor: '#fed7aa', iconColor: '#f97316' },
  { name: 'Tình yêu', Icon: Heart, bg: '#fff1f2', borderColor: '#fecdd3', iconColor: '#f43f5e' },
  { name: 'Phòng Phim', Icon: Film, bg: '#eef2ff', borderColor: '#c7d2fe', iconColor: '#6366f1' },
  { name: 'Flash Deal', Icon: Zap, bg: '#fefce8', borderColor: '#fde68a', iconColor: '#eab308' },
  { name: 'Check-in kín đáo', Icon: Smartphone, bg: '#ecfeff', borderColor: '#a5f3fc', iconColor: '#06b6d4' },
  { name: 'Stay Xịn Mới', Icon: Sparkles, bg: '#f5f3ff', borderColor: '#ddd6fe', iconColor: '#8b5cf6' },
  { name: 'Camping', Icon: Tent, bg: '#ecfdf5', borderColor: '#bbf7d0', iconColor: '#10b981' },
  { name: 'Giảm Giá', Icon: BadgePercent, bg: '#fff7ed', borderColor: '#fed7aa', iconColor: '#ea580c' },
  { name: 'Homestay', Icon: Home, bg: '#f0f9ff', borderColor: '#bae6fd', iconColor: '#0284c7' },
];

export default function CategoryNav({ onCategoryClick }: { onCategoryClick?: (name: string) => void }) {
  const { currentTheme } = useThemeContext();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const isWebLayout = Platform.OS === 'web' && width >= 768;

  const scrollWeb = (direction: 'left' | 'right') => {
    const nextX = direction === 'left' ? 0 : Math.max(width * 0.72, 360);
    scrollRef.current?.scrollTo({ x: nextX, animated: true });
  };

  return (
    <View style={isWebLayout && styles.webWrap}>
      {isWebLayout && (
        <Pressable style={[styles.webArrow, styles.webArrowLeft]} onPress={() => scrollWeb('left')}>
          <ChevronLeft size={30} color="#6b7280" strokeWidth={2.5} />
        </Pressable>
      )}

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, isWebLayout && styles.webScroll]}
      >
        {CATEGORIES.map(({ name, Icon, bg, borderColor, iconColor, badge }) => (
          <Pressable
            key={name}
            style={[styles.item, isWebLayout && [styles.webItem, { backgroundColor: bg, borderColor }]]}
            onPress={() => onCategoryClick?.(name)}
          >
            <View style={[styles.iconWrapper, isWebLayout && styles.webIconWrapper]}>
              <View style={[styles.iconCircle, { backgroundColor: bg }, isWebLayout && styles.webIconCircle]}>
                <Icon size={isWebLayout ? 36 : 24} color={iconColor} strokeWidth={isWebLayout ? 1.8 : 2} />
              </View>
              {badge && (
                <View style={[styles.badge, isWebLayout && styles.webBadge]}>
                  <Text style={[styles.badgeText, isWebLayout && styles.webBadgeText]}>{badge}</Text>
                </View>
              )}
            </View>
            <Text
              style={[styles.label, { color: currentTheme.textSecondary }, isWebLayout && styles.webLabel]}
              numberOfLines={2}
            >
              {name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {isWebLayout && (
        <Pressable style={[styles.webArrow, styles.webArrowRight]} onPress={() => scrollWeb('right')}>
          <ChevronRight size={30} color="#6b7280" strokeWidth={2.5} />
        </Pressable>
      )}
    </View>
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
  webWrap: {
    position: 'relative',
    width: '100%',
    paddingHorizontal: 44,
  },
  webScroll: {
    paddingHorizontal: 6,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 16,
  },
  webItem: {
    width: 148,
    height: 118,
    borderRadius: 16,
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(133,194,164,0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
  },
  webIconWrapper: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  webBadge: {
    top: 0,
    transform: [{ translateX: 10 }],
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  webBadgeText: {
    fontSize: 10,
  },
  webLabel: {
    width: 126,
    color: '#3f3f46',
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 22,
  },
  webArrow: {
    position: 'absolute',
    top: 48,
    zIndex: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  webArrowLeft: {
    left: 8,
  },
  webArrowRight: {
    right: 8,
  },
});
