import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Platform, TouchableOpacity, Animated,
  useWindowDimensions, TouchableWithoutFeedback, ScrollView, StatusBar,
} from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { Sidebar } from '../../src/partner/components/Sidebar';
import { Header } from '../../src/partner/components/Header';
import { useAuth } from '../../src/login/hooks/useAuth';
import {
  Home, BedDouble, BarChart3, Settings, LogOut,
  Hotel, Menu, X,
} from 'lucide-react-native';

const DRAWER_W = 280;

interface DrawerItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const MENU_ITEMS: DrawerItem[] = [
  { label: 'Trang chủ', icon: Home, path: '/partner' },
  { label: 'Quản lý loại phòng', icon: BedDouble, path: '/partner/rooms' },
  { label: 'Thống kê', icon: BarChart3, path: '/partner/stats' },
  { label: 'Thiết lập', icon: Settings, path: '/partner/settings' },
];

export default function PartnerLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isWeb = Platform.OS === 'web';
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Responsive: use sidebar on wide web, drawer on mobile/narrow
  const isWideWeb = isWeb && screenWidth >= 768;

  // Drawer animation
  const drawerAnim = useRef(new Animated.Value(-DRAWER_W)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(drawerAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 220,
      }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(drawerAnim, { toValue: -DRAWER_W, duration: 200, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  };

  const navigateTo = (path: string) => {
    closeDrawer();
    setTimeout(() => router.push(path as any), 120);
  };

  const isActive = (path: string) => {
    if (path === '/partner') {
      return pathname === '/partner' || pathname === '/' || pathname === '';
    }
    const segment = path.replace('/partner/', '');
    return pathname.includes(segment);
  };

  const handleLogout = async () => {
    closeDrawer();
    await logout();
    router.replace('/login' as any);
  };

  // ===== WIDE WEB: Sidebar + Header + Content =====
  if (isWideWeb) {
    return (
      <View style={styles.webContainer}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <View style={styles.webMain}>
          <Header onMenuPress={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <View style={styles.webContent}>
            <Slot />
          </View>
        </View>
      </View>
    );
  }

  // ===== MOBILE / NARROW WEB: Drawer overlay =====
  return (
    <View style={styles.mobileRoot}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={openDrawer} style={styles.menuBtn} activeOpacity={0.6}>
          <Menu size={20} color="#0D9488" strokeWidth={2.2} />
        </TouchableOpacity>
        <View style={styles.logoBrand}>
          <View style={styles.logoIconMini}>
            <Hotel size={14} color="#FFF" />
          </View>
          <Text style={styles.logoText}>StayBuddy</Text>
        </View>
        <TouchableOpacity style={styles.avatarSmall} activeOpacity={0.7}>
          <Text style={styles.avatarSmallText}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.mobileContent}>
        <Slot />
      </View>

      {/* Drawer Overlay */}
      {drawerOpen && (
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <Animated.View style={[styles.overlay, { opacity: overlayAnim }]} />
        </TouchableWithoutFeedback>
      )}

      {/* Drawer */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}>
        {/* Drawer Header */}
        <View style={styles.drawerHeader}>
          <View style={styles.drawerLogoRow}>
            <View style={styles.drawerLogoIcon}>
              <Hotel size={18} color="#FFF" />
            </View>
            <Text style={styles.drawerLogoText}>StayBuddy</Text>
          </View>
          <TouchableOpacity onPress={closeDrawer} style={styles.drawerCloseBtn} activeOpacity={0.6}>
            <X size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* User section */}
        <View style={styles.drawerUserSection}>
          <View style={styles.drawerAvatarLarge}>
            <Text style={styles.drawerAvatarLargeText}>
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.drawerUserName} numberOfLines={1}>
              {user?.username || 'Người dùng'}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>Đối tác</Text>
            </View>
          </View>
        </View>

        <View style={styles.drawerDivider} />

        {/* Menu */}
        <ScrollView style={styles.drawerMenu} showsVerticalScrollIndicator={false}>
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <TouchableOpacity
                key={item.path}
                style={[styles.drawerItem, active && styles.drawerItemActive]}
                onPress={() => navigateTo(item.path)}
                activeOpacity={0.65}
              >
                <View style={[styles.drawerItemIconBox, active && styles.drawerItemIconBoxActive]}>
                  <Icon
                    size={18}
                    color={active ? '#0D9488' : '#64748B'}
                    strokeWidth={active ? 2.5 : 1.8}
                  />
                </View>
                <Text style={[styles.drawerItemText, active && styles.drawerItemTextActive]}>
                  {item.label}
                </Text>
                {active && <View style={styles.drawerActiveBar} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Drawer Footer */}
        <View style={styles.drawerFooter}>
          <View style={styles.drawerDivider} />
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
            <LogOut size={16} color="#EF4444" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // === WEB ===
  webContainer: {
    flex: 1,
    flexDirection: 'row',
    ...Platform.select({ web: { height: '100vh' as any }, default: {} }),
  },
  webMain: { flex: 1, backgroundColor: '#F8FAFC' },
  webContent: {
    flex: 1,
    ...Platform.select({ web: { overflow: 'auto' as any }, default: {} }),
  },

  // === MOBILE ROOT ===
  mobileRoot: { flex: 1, backgroundColor: '#FFF' },
  mobileContent: { flex: 1, backgroundColor: '#F8FAFC' },

  // === TOP BAR ===
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 54 : (Platform.OS === 'web' ? 10 : 36),
    paddingBottom: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    ...Platform.select({
      web: { boxShadow: '0 1px 3px rgba(0,0,0,0.04)' as any },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
    }),
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginLeft: 10,
  },
  logoIconMini: {
    width: 24,
    height: 24,
    borderRadius: 5,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 0.3,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  // === OVERLAY ===
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 90,
  },

  // === DRAWER ===
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_W,
    backgroundColor: '#FFFFFF',
    zIndex: 100,
    ...Platform.select({
      web: { boxShadow: '6px 0 20px rgba(0,0,0,0.12)' as any },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 6, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 24,
      },
    }),
  },

  // Drawer Header
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : (Platform.OS === 'web' ? 16 : 38),
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  drawerLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  drawerLogoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerLogoText: { fontSize: 18, fontWeight: '800', color: '#0D9488' },
  drawerCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Drawer User Section
  drawerUserSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    marginBottom: 4,
  },
  drawerAvatarLarge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerAvatarLargeText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  drawerUserName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#CCFBF1',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 3,
  },
  roleBadgeText: { fontSize: 10, fontWeight: '600', color: '#0D9488' },

  drawerDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
    marginHorizontal: 16,
  },

  // Drawer Menu
  drawerMenu: { flex: 1, paddingHorizontal: 10, paddingTop: 4 },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    borderRadius: 10,
    marginBottom: 2,
    position: 'relative',
  },
  drawerItemActive: {
    backgroundColor: '#F0FDFA',
  },
  drawerActiveBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    backgroundColor: '#0D9488',
    borderRadius: 2,
  },
  drawerItemIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  drawerItemIconBoxActive: {
    backgroundColor: '#CCFBF1',
  },
  drawerItemText: { fontSize: 14, color: '#475569', fontWeight: '500' },
  drawerItemTextActive: { color: '#0D9488', fontWeight: '700' },

  // Drawer Footer
  drawerFooter: {
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    paddingHorizontal: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
  },
  logoutText: { color: '#EF4444', fontSize: 13, fontWeight: '600' },
});
