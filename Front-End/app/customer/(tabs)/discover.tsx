import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import ExploreMoreSection from '@/src/customer/components/mobile/ExploreMoreSection';
import { useThemeContext } from '@/src/customer/utils/ThemeContext';

export default function DiscoverScreen() {
  const { currentTheme } = useThemeContext();

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 60 }}>
        <ExploreMoreSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
