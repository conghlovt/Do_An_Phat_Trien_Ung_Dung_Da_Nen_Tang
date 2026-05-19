import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useThemeContext } from '@/src/customer/shared/theme/ThemeContext';
import { LocationProvider } from '@/src/customer/features/location/context/LocationContext';
import { View, useWindowDimensions, StyleSheet, Platform, Text, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuth } from '@/src/customer/features/auth/hooks/useAuth';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Compass,
  Gift,
  Home,
  Hotel,
  LogIn,
  LogOut,
  User,
} from 'lucide-react-native';

const PRIMARY_DARK = '#6dbb99';
const BRAND_LIGHT = '#85c2a4';
const BRAND_DARK = '#ffffff';
const PRIMARY_SOFT = '#eef8f4';
const PRIMARY_ICON_BG = '#8bcaad';
const WEB_SIDEBAR_EXPANDED = 318;
const WEB_SIDEBAR_COLLAPSED = 92;

const WEB_NAV_ITEMS = [
  {
    href: '/customer/dashboard',
    label: 'Trang chủ',
    Icon: Home,
    match: ['/customer/dashboard', '/customer/near-me', '/customer/see-all', '/customer/hotel-detail', '/customer/room-list', '/customer/search'],
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
  const sidebarWidth = collapsed ? WEB_SIDEBAR_COLLAPSED : WEB_SIDEBAR_EXPANDED;
  const displayName = user?.username || user?.email?.split('@')[0] || 'Khách';
  const initial = displayName.slice(0, 1).toUpperCase();
  const brandColor = isDarkMode ? BRAND_DARK : BRAND_LIGHT;

  const handleLogout = async () => {
    if (isAuthenticated) {
      await logout();
      router.replace('/login' as any);
      return;
    }

    router.push('/login' as any);
  };

  return (
    <View style={[styles.rootContainer, { backgroundColor: currentTheme.background }]}>
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

          <View style={[styles.webSidebarActions, collapsed && styles.webSidebarActionsCollapsed]}>
            <Pressable onPress={handleLogout} style={[styles.webLogoutItem, collapsed && styles.webLogoutItemCollapsed]}>
              <View style={styles.webLogoutIconBox}>
                {isAuthenticated ? (
                  <LogOut size={21} color="#ef4444" strokeWidth={2.2} />
                ) : (
                  <LogIn size={21} color="#6b7280" strokeWidth={2.2} />
                )}
              </View>
              {!collapsed && (
                <Text style={[styles.webLogoutLabel, !isAuthenticated && styles.webLoginLabel]}>
                  {isAuthenticated ? 'Đăng xuất' : 'Đăng nhập'}
                </Text>
              )}
            </Pressable>
          </View>

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
                <Text style={styles.webUserRole}>{isAuthenticated ? 'Khách hàng' : 'Tài khoản khách'}</Text>
              </View>
            )}
          </View>
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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(hotels)/hotel-detail" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="(hotels)/room-list" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="(hotels)/see-all" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="(hotels)/near-me" options={nearMeOptions} />
      <Stack.Screen name="(booking)/booking-calendar" options={bottomModalOptions} />
      <Stack.Screen name="(booking)/booking-confirm" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="(search)/search" options={fullScreenBottomOptions} />
      <Stack.Screen name="(messages)/messages" options={fullScreenRightOptions} />
      <Stack.Screen name="(messages)/notifications" options={fullScreenRightOptions} />
      <Stack.Screen name="(messages)/notification-settings" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="(support)/contact-support" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="(support)/faqs" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="(support)/terms" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="(auth)/unauthorized" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <LocationProvider>
      <ThemeProvider>
        <ThemedStatusBar />
        <AuthRestorer>
          <ResponsiveAppWrapper>
            <CustomerStack />
          </ResponsiveAppWrapper>
        </AuthRestorer>
      </ThemeProvider>
    </LocationProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  appContainerLarge:
    Platform.OS === 'web'
      ? { width: '100%', height: '100%' }
      : {
          maxWidth: 480,
          maxHeight: '100%',
          borderRadius: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 10,
          marginVertical: 20,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.05)',
        },
  webSidebar: {
    position: 'fixed' as any,
    left: 0,
    top: 0,
    bottom: 0,
    borderRightWidth: 1,
    zIndex: 260,
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 0,
    shadowColor: '#0f172a',
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.03,
    shadowRadius: 18,
    elevation: 8,
    ...(Platform.OS === 'web'
      ? { height: '100vh' as any, overflow: 'visible' as any, transition: 'width 0.22s ease' }
      : {}),
  },
  webSidebarCollapsed: {
    paddingHorizontal: 10,
    paddingTop: 26,
  },
  webHeader: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 26,
    paddingHorizontal: 14,
  },
  webHeaderCollapsed: {
    justifyContent: 'center',
    marginBottom: 26,
    paddingHorizontal: 0,
  },
  webBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minWidth: 0,
  },
  webBrandRowCollapsed: {
    justifyContent: 'center',
  },
  webLogoIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#8bcaaa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webBrandCopy: {
    minWidth: 0,
  },
  webBrandText: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0,
  },
  webBrandSub: {
    marginTop: 3,
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  webDivider: {
    height: 1,
    marginHorizontal: -16,
    marginBottom: 18,
  },
  webDividerCollapsed: {
    marginHorizontal: -10,
    marginBottom: 18,
  },
  webNavList: {
    flex: 1,
    gap: 14,
    paddingTop: 0,
  },
  webNavListCollapsed: {
    alignItems: 'center',
    gap: 14,
    paddingTop: 0,
  },
  webTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 65,
    borderRadius: 17,
    paddingHorizontal: 14,
    position: 'relative',
  },
  webTabItemCollapsed: {
    width: 62,
    minHeight: 62,
    justifyContent: 'center',
    paddingHorizontal: 0,
    borderRadius: 18,
  },
  webTabItemActive: {
    backgroundColor: PRIMARY_SOFT,
  },
  webActiveDot: {
    position: 'absolute',
    right: 14,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: PRIMARY_DARK,
  },
  webIconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webIconBoxActive: {
    backgroundColor: PRIMARY_ICON_BG,
  },
  webTabLabel: {
    flex: 1,
    marginLeft: 16,
    marginRight: 18,
    fontSize: 16,
    fontWeight: '800',
  },
  webSidebarActions: {
    marginBottom: 8,
  },
  webSidebarActionsCollapsed: {
    alignItems: 'center',
  },
  webLogoutItem: {
    minHeight: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  webLogoutItemCollapsed: {
    width: 62,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  webLogoutIconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webLogoutLabel: {
    marginLeft: 16,
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '800',
  },
  webLoginLabel: {
    color: '#64748b',
  },
  webToggleBtn: {
    position: 'absolute',
    right: -18,
    top: 92,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 280,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 6,
  },
  webToggleBtnCollapsed: {
    right: -17,
  },
  webAccountButton: {
    minHeight: 92,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 16,
    paddingBottom: 18,
    paddingTop: 18,
    marginHorizontal: -16,
  },
  webAccountButtonCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
    marginHorizontal: -10,
  },
  webAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#8bcaaa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webAvatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  webAccountButtonText: {
    flex: 1,
    minWidth: 0,
  },
  webUserName: {
    fontSize: 16,
    fontWeight: '800',
  },
  webUserRole: {
    marginTop: 2,
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
});
