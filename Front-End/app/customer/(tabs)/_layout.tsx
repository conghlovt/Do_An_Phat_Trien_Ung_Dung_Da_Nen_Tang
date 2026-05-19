import { Tabs } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ClipboardList, Compass, Gift, Home, User } from 'lucide-react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/src/customer/shared/theme/ThemeContext';

const PRIMARY = '#85c2a4';
const PRIMARY_DARK = '#6dbb99';

const TAB_ITEMS = [
  { name: 'dashboard', label: 'Trang chủ', Icon: Home },
  { name: 'discover', label: 'Khám phá', Icon: Compass },
  { name: 'bookings', label: 'Phòng đã đặt', Icon: ClipboardList },
  { name: 'offers', label: 'Ưu đãi', Icon: Gift },
  { name: 'profile', label: 'Tài khoản', Icon: User },
] as const;

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { currentTheme } = useThemeContext();
  const { width } = useWindowDimensions();
  const isWebLayout = Platform.OS === 'web' && width >= 768;

  if (isWebLayout) return null;

  return (
    <View style={[
      styles.tabBar,
      {
        paddingBottom: Math.max(insets.bottom, 12),
        backgroundColor: currentTheme.card,
        borderTopColor: currentTheme.border,
      },
    ]}>
      {state.routes.map((route, index) => {
        const tab = TAB_ITEMS.find((item) => item.name === route.name) ?? TAB_ITEMS[index];
        if (!tab) return null;

        const isActive = state.index === index;
        const { Icon, label } = tab;

        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tabItem}
          >
            <Icon
              size={22}
              color={isActive ? PRIMARY : currentTheme.textSecondary}
              fill={isActive ? PRIMARY : 'transparent'}
            />
            <Text style={[styles.tabLabel, { color: isActive ? PRIMARY_DARK : currentTheme.textSecondary }]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="bookings" />
      <Tabs.Screen name="offers" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
