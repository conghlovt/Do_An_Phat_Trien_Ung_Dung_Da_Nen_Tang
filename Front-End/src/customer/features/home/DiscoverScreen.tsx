import React from 'react';
import { Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import ExploreMoreSection from '@/src/customer/features/home/ExploreMoreSection';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';

export default function DiscoverScreen() {
  const { currentTheme } = useThemeContext();
  const { width } = useWindowDimensions();
  const isWebLayout = Platform.OS === 'web' && width >= 768;

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={isWebLayout}
        contentContainerStyle={[styles.scrollContent, isWebLayout && styles.webScrollContent]}
      >
        <View style={isWebLayout && styles.webContent}>
          <ExploreMoreSection />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: 60, paddingBottom: 24 },
  webScrollContent: { paddingTop: 28, paddingHorizontal: 32, paddingBottom: 52 },
  webContent: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
  },
});
