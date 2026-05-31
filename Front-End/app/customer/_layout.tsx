import { styles } from '@/src/customer/navigation/customerLayout.styles';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useThemeContext } from '@/src/customer/theme/ThemeContext';
import { LocationProvider } from '@/src/customer/context/LocationContext';
import { FavoritesProvider } from '@/src/customer/context/FavoritesContext';
import {
  CUSTOMER_WEB_SIDEBAR_COLLAPSED,
  CUSTOMER_WEB_SIDEBAR_EXPANDED,
  CustomerWebShellProvider,
} from '@/src/customer/navigation/CustomerWebShellContext';
import { View, useWindowDimensions, Platform, Text, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuth } from '@/src/customer/hooks/useAuth';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Compass,
  Gift,
  Home,
  Hotel,
  LogOut,
  User,
} from 'lucide-react-native';

const PRIMARY_DARK = '#85c2a4';
const BRAND_LIGHT = '#85c2a4';
const BRAND_DARK = '#ffffff';

const WEB_NAV_ITEMS = [
  {
    href: '/customer/dashboard',
    label: 'Trang chủ',
    Icon: Home,
    match: ['/customer/dashboard', '/customer/hotels/near-me', '/customer/hotels', '/customer/hotels/[id]', '/customer/hotels/rooms', '/customer/search'],
  },
  { href: '/customer/discover', label: 'Khám phá', Icon: Compass, match: ['/customer/discover'] },
  { href: '/customer/bookings', label: 'Phòng đã đặt', Icon: ClipboardList, match: ['/customer/bookings', '/customer/booking'] },
  { href: '/customer/offers', label: 'Ưu đãi', Icon: Gift, match: ['/customer/offers'] },
  { href: '/customer/profile', label: 'Tài khoản', Icon: User, match: ['/customer/profile'] },
] as const;

function ThemedStatusBar() {
  const { isDarkMode } = useThemeContext();
  return <StatusBar style={isDarkMode ? 'light' : 'dark'} />;
}

function AuthRestorer({ children }: { children: React.ReactNode }) {
  const { restoreSession } = useAuth();
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);
  return <>{children}</>;
}

function ResponsiveAppWrapper({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const { currentTheme, isDarkMode } = useThemeContext();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const isLargeScreen = width >= 768;
  const isWebLayout = Platform.OS === 'web' && isLargeScreen;
  const sidebarWidth = collapsed ? CUSTOMER_WEB_SIDEBAR_COLLAPSED : CUSTOMER_WEB_SIDEBAR_EXPANDED;
  const displayName = user?.username || user?.email?.split('@')[0] || 'Khách hàng';
  const initial = displayName.slice(0, 1).toUpperCase();
  const brandColor = isDarkMode ? BRAND_DARK : BRAND_LIGHT;

  const handleLogout = async () => {
    await logout();
    router.replace('/login' as any);
  };

  return (
    <View style={[styles.rootContainer, { backgroundColor: currentTheme.background }]}>
      <CustomerWebShellProvider value={{ isWebLayout, sidebarWidth: isWebLayout ? sidebarWidth : 0 }}>
        {isWebLayout && (
          <View
            style={[
              styles.webSidebar,
              collapsed && styles.webSidebarCollapsed,
              { width: sidebarWidth, backgroundColor: currentTheme.card, borderRightColor: currentTheme.border },
            ]}
          >
            <View style={[styles.webHeader, collapsed && styles.webHeaderCollapsed]}>
              <View style={[styles.webBrandRow, collapsed && styles.webBrandRowCollapsed]}>
                <View style={styles.webLogoIcon}>
                  <Hotel size={20} color="#ffffff" strokeWidth={2.4} />
                </View>
                {!collapsed && (
                  <View style={styles.webBrandCopy}>
                    <Text
                      style={[
                        styles.webBrandText,
                        { color: brandColor },
                      ]}
                    >
                      StayHub
                    </Text>
                    <Text style={styles.webBrandSub}>Nền tảng đặt phòng</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={[styles.webDivider, collapsed && styles.webDividerCollapsed, { backgroundColor: currentTheme.border }]} />

            <View style={[styles.webNavList, collapsed && styles.webNavListCollapsed]}>
              {WEB_NAV_ITEMS.map(({ href, label, Icon, match }) => {
                const isActive = match.some((item) => pathname.startsWith(item));

                return (
                  <Pressable
                    key={href}
                    onPress={() => router.replace(href as any)}
                    accessibilityRole="link"
                    style={[
                      styles.webTabItem,
                      collapsed && styles.webTabItemCollapsed,
                      isActive && styles.webTabItemActive,
                    ]}
                  >
                    <View style={[styles.webIconBox, isActive && styles.webIconBoxActive]}>
                      <Icon size={21} color={isActive ? '#ffffff' : '#6b7280'} strokeWidth={isActive ? 2.3 : 2} />
                    </View>
                    {!collapsed && (
                      <Text style={[styles.webTabLabel, { color: isActive ? PRIMARY_DARK : '#64748b' }]} numberOfLines={1}>
                        {label}
                      </Text>
                    )}
                    {isActive && !collapsed && <View style={styles.webActiveDot} />}
                  </Pressable>
                );
              })}
            </View>

            {isAuthenticated && (
              <View style={[styles.webSidebarActions, collapsed && styles.webSidebarActionsCollapsed]}>
                <Pressable onPress={handleLogout} style={[styles.webLogoutItem, collapsed && styles.webLogoutItemCollapsed]}>
                  <View style={styles.webLogoutIconBox}>
                    <LogOut size={21} color="#ef4444" strokeWidth={2.2} />
                  </View>
                  {!collapsed && (
                    <Text style={styles.webLogoutLabel}>Đăng xuất</Text>
                  )}
                </Pressable>
              </View>
            )}

            <Pressable
              onPress={() => setCollapsed((value) => !value)}
              style={[styles.webToggleBtn, collapsed && styles.webToggleBtnCollapsed]}
            >
              {collapsed ? (
                <ChevronRight size={18} color="#6b7280" strokeWidth={2.3} />
              ) : (
                <ChevronLeft size={18} color="#6b7280" strokeWidth={2.3} />
              )}
            </Pressable>

            {isAuthenticated && (
              <View
                style={[
                  styles.webAccountButton,
                  collapsed && styles.webAccountButtonCollapsed,
                  { backgroundColor: currentTheme.card, borderTopColor: currentTheme.border },
                ]}
              >
                <View style={styles.webAvatar}>
                  <Text style={styles.webAvatarText}>{initial}</Text>
                </View>
                {!collapsed && (
                  <View style={styles.webAccountButtonText}>
                    <Text style={[styles.webUserName, { color: currentTheme.text }]} numberOfLines={1}>
                      {displayName}
                    </Text>
                    <Text style={styles.webUserRole}>Khách hàng</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
        <View
          style={[
            styles.appContainer,
            isLargeScreen && styles.appContainerLarge,
            isLargeScreen && { backgroundColor: currentTheme.background },
            isWebLayout && { width: `calc(100% - ${sidebarWidth}px)` as any, height: '100%', marginLeft: sidebarWidth },
          ]}
        >
          {children}
        </View>
      </CustomerWebShellProvider>
    </View>
  );
}

function CustomerStack() {
  const { width } = useWindowDimensions();
  const isWebLayout = Platform.OS === 'web' && width >= 768;
  const nearMeOptions = isWebLayout
    ? { animation: 'slide_from_right' as const }
    : { presentation: 'fullScreenModal' as const, animation: 'slide_from_right' as const };
  const bottomModalOptions = isWebLayout
    ? { animation: 'slide_from_bottom' as const }
    : { presentation: 'modal' as const, animation: 'slide_from_bottom' as const };
  const fullScreenBottomOptions = isWebLayout
    ? { animation: 'slide_from_bottom' as const }
    : { presentation: 'fullScreenModal' as const, animation: 'slide_from_bottom' as const };
  const fullScreenRightOptions = isWebLayout
    ? { animation: 'slide_from_right' as const }
    : { presentation: 'fullScreenModal' as const, animation: 'slide_from_right' as const };

  return (
    <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="hotels/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="hotels/rooms" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="hotels/index" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="hotels/near-me" options={nearMeOptions} />
      <Stack.Screen name="booking/calendar" options={bottomModalOptions} />
      <Stack.Screen name="booking/confirm" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="booking/payment" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="booking/detail" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="search/index" options={fullScreenBottomOptions} />
      <Stack.Screen name="messages/index" options={fullScreenRightOptions} />
      <Stack.Screen name="messages/notifications" options={fullScreenRightOptions} />
      <Stack.Screen name="messages/notification-settings" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="support/contact" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="support/faqs" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="support/terms" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <LocationProvider>
      <ThemeProvider>
        <FavoritesProvider>
          <ThemedStatusBar />
          <AuthRestorer>
            <ResponsiveAppWrapper>
              <CustomerStack />
            </ResponsiveAppWrapper>
          </AuthRestorer>
        </FavoritesProvider>
      </ThemeProvider>
    </LocationProvider>
  );
}
