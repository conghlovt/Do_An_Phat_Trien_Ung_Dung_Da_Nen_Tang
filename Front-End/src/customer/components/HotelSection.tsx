import React, { useState, useEffect, useRef } from 'react';
import { Platform, View, Text, StyleSheet, Pressable, ScrollView, Animated, useWindowDimensions } from 'react-native';
import { ChevronRight, Zap, Star, Trophy, Sparkles, Crown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import HotelCard from './HotelCard';
import { hotelsApi, Hotel } from '@/src/customer/api/hotels.api';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { SECTION_COLORS, SECTION_PREVIEW_LIMIT, SECTION_TAG_MAP } from '@/src/customer/utils/hotelSections';

interface HotelSectionProps {
  title: string;
  hasMore?: boolean;
  tabs?: string[];
}

function useCountdown(initialH = 2, initialM = 37, initialS = 14) {
  const [time, setTime] = useState({ h: initialH, m: initialM, s: initialS });
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { return { h: 0, m: 0, s: 0 }; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return time;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function HotelSection({ title, hasMore, tabs }: HotelSectionProps) {
  const router = useRouter();
  const { currentTheme } = useThemeContext();
  const { width } = useWindowDimensions();
  const isWebLayout = Platform.OS === 'web' && width >= 768;
  const [activeTab, setActiveTab] = useState(tabs ? tabs[0] : undefined);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const countdown = useCountdown();
  const isFlashSale = title === 'Flash Sale';
  const accentColor = SECTION_COLORS[title] || '#85c2a4';

  const shimmerAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [shimmerAnim]);
  const shimmerOpacity = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const tag = isFlashSale ? activeTab : SECTION_TAG_MAP[title];
    hotelsApi.getAll({ tag, limit: SECTION_PREVIEW_LIMIT })
      .then(({ data }) => { if (!cancelled) setHotels(data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeTab, isFlashSale, title]);

  const handleSeeAll = () => {
    router.push({ pathname: '/customer/see-all', params: { section: title, tab: activeTab } });
  };

  const renderTitleIcon = () => {
    if (isFlashSale) return <Zap size={20} color="#eab308" fill="#eab308" />;
    if (title === 'Ưu đãi đặc biệt') return <Star size={20} color={accentColor} fill={accentColor} />;
    if (title === 'StayHub gợi ý') return <Sparkles size={20} color={accentColor} />;
    if (title === 'Top được bình chọn') return <Trophy size={20} color={accentColor} />;
    if (title === 'Khách sạn mới') return <Crown size={20} color={accentColor} />;
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.titleLeft}>
          {renderTitleIcon()}
          <Text style={[styles.title, { color: currentTheme.text }]}>{title}</Text>
          {isFlashSale && (
            <View style={styles.countdownInline}>
              {[pad(countdown.h), pad(countdown.m), pad(countdown.s)].map((unit, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <Text style={[styles.countSep, { color: currentTheme.textSecondary }]}>:</Text>}
                  <View style={[styles.countChip, { backgroundColor: currentTheme.text }]}>
                    <Text style={styles.countChipText}>{unit}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          )}
        </View>
        {hasMore && (
          <Pressable style={styles.moreBtn} onPress={handleSeeAll}>
            <Text style={[styles.moreText, { color: accentColor }]}>Xem tất cả</Text>
            <ChevronRight size={14} color={accentColor} />
          </Pressable>
        )}
      </View>

      {tabs && (
        <View style={styles.tabs}>
          {tabs.map((tab) => (
            <Pressable key={tab} onPress={() => setActiveTab(tab)} style={styles.tabBtn}>
              <Text style={[styles.tabText, { color: currentTheme.textSecondary }, activeTab === tab && { color: accentColor, fontWeight: '600' }]}>
                {tab}
              </Text>
              {activeTab === tab && <View style={[styles.tabIndicator, { backgroundColor: accentColor }]} />}
            </Pressable>
          ))}
        </View>
      )}

      {isWebLayout ? (
        <View style={styles.webGrid}>
          {loading
            ? Array.from({ length: SECTION_PREVIEW_LIMIT }).map((_, i) => (
                <Animated.View key={i} style={[styles.skeleton, { opacity: shimmerOpacity, backgroundColor: currentTheme.background }]} />
              ))
            : error
              ? <Text style={[styles.errorText, { color: currentTheme.text }]}>Không thể tải dữ liệu.</Text>
              : hotels.length === 0
                ? <Text style={[styles.errorText, { color: currentTheme.text }]}>Không có dữ liệu.</Text>
                : hotels.slice(0, SECTION_PREVIEW_LIMIT).map((hotel) => <HotelCard key={hotel.id} {...hotel} id={hotel.id} />)
          }
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {loading
            ? Array.from({ length: SECTION_PREVIEW_LIMIT }).map((_, i) => (
                <Animated.View key={i} style={[styles.skeleton, { opacity: shimmerOpacity, backgroundColor: currentTheme.background }]} />
              ))
            : error
              ? <Text style={[styles.errorText, { color: currentTheme.text }]}>Không thể tải dữ liệu.</Text>
              : hotels.length === 0
                ? <Text style={[styles.errorText, { color: currentTheme.text }]}>Không có dữ liệu.</Text>
                : hotels.slice(0, SECTION_PREVIEW_LIMIT).map((hotel) => <HotelCard key={hotel.id} {...hotel} id={hotel.id} />)
          }
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  titleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  titleLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  title: { fontSize: 19, fontWeight: '700' },
  countdownInline: { flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 4 },
  countChip: {
    borderRadius: 5,
    paddingHorizontal: 5, paddingVertical: 2, minWidth: 26, alignItems: 'center',
  },
  countChipText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  countSep: { fontSize: 13, fontWeight: '800' },
  moreBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  moreText: { fontSize: 13, fontWeight: '600' },
  tabs: { flexDirection: 'row', gap: 24, marginBottom: 16 },
  tabBtn: { paddingBottom: 8, position: 'relative' },
  tabText: { fontSize: 15, fontWeight: '500' },
  tabIndicator: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, borderRadius: 2 },
  scroll: { gap: 16, paddingVertical: 4, paddingBottom: 8 },
  webGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingTop: 4,
  },
  skeleton: { width: 220, height: 280, borderRadius: 16 },
  errorText: { fontSize: 14, paddingHorizontal: 4 },
});
