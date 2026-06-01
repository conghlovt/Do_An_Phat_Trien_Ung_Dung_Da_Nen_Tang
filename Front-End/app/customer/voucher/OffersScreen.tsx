import React, { useEffect, useState } from 'react';
import { Platform, View, Text, ScrollView, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Gift } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { useAuth } from '@/src/customer/hooks/useAuth';
import { offersApi } from '@/src/customer/core/api/offers.api';

import HeroSection from './HeroSection';
import FlashDeals from './FlashDeals';
import CustomerRewards from './CustomerRewards';
import NearbyOffers from './NearbyOffers';
import HotelOffers from './HotelOffers';
import { styles, INK, MUTED } from './styles';

export default function OffersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentTheme, isDarkMode } = useThemeContext();
  const { isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();
  const isWebLayout = Platform.OS === 'web' && width >= 768;

  const [loading, setLoading] = useState(true);
  const [offersData, setOffersData] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login' as any);
      return;
    }

    const loadOffers = async () => {
      try {
        const res = await offersApi.getOffers();
        if (res.success) {
          setOffersData(res.data);
        }
      } catch (error) {
        console.error('Failed to load offers', error);
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, [isAuthenticated, router]);

  const surface = isDarkMode ? currentTheme.card : '#ffffff';
  const softSurface = isDarkMode ? 'rgba(133,194,164,0.14)' : '#f4f8f6';
  const textColor = isDarkMode ? currentTheme.text : INK;
  const mutedColor = isDarkMode ? currentTheme.textSecondary : MUTED;

  const sharedProps = {
    isWebLayout,
    isDarkMode,
    surface,
    textColor,
    mutedColor,
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading || !offersData) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#5cae8c" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: isWebLayout ? 56 : insets.bottom + 26 },
          isWebLayout && styles.webScrollContent,
        ]}
        showsVerticalScrollIndicator={isWebLayout}
      >
        <View style={isWebLayout ? styles.webContent : undefined}>
          {/* ── Hero ── */}
          <HeroSection
            paddingTop={isWebLayout ? 28 : insets.top + 18}
            isWebLayout={isWebLayout}
            isDarkMode={isDarkMode}
            onVoucherPress={() => router.push('/customer/voucher/wallet' as any)}
          />

          <View style={[styles.body, isWebLayout && styles.webBody]}>
            {/* ── Hot Time Deal  ── */}
            <FlashDeals {...sharedProps} data={offersData.flashDeals} />

            {/* ── Khách hàng mới (header) ── */}
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: isDarkMode ? 'rgba(133,194,164,0.2)' : '#d7f2e7' },
                ]}
              >
                <Gift size={18} color="#5eb58e" strokeWidth={2} />
              </View>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Ưu đãi khách sạn
              </Text>
            </View>

            {/* ── Khách hàng mới (cards) ── */}
            <CustomerRewards
              isWebLayout={isWebLayout}
              surface={surface}
              textColor={textColor}
              mutedColor={mutedColor}
              data={offersData.customerRewards}
            />

            {/* ── Gần bạn ── */}
            <NearbyOffers {...sharedProps} data={offersData.nearbyOffers} />

            {/* ── Ưu đãi khách sạn mới ── */}
            <HotelOffers
              {...sharedProps}
              softSurface={softSurface}
              borderColor={currentTheme.border}
              data={offersData.hotelOffers}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
