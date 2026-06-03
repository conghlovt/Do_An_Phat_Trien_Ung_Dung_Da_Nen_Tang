import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Platform,
  Text,
} from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { Sidebar, SIDEBAR_EXPANDED } from '../../src/partner/components/shared/Sidebar';
import { Header } from '../../src/partner/components/shared/Header';
import { useAuth } from '../../src/login/hooks/useAuth';

const getPageTitle = (pathname: string): string => {
  const routes: Record<string, string> = {
    '/partner/dashboard': 'Trang chủ',
    '/partner': 'Trang chủ',
    '/rooms': 'Quản lý phòng',
    '/booking': 'Đơn đặt phòng',
    '/vouchers': 'Quản lý Voucher',
    '/stats': 'Thống kê',
    '/settings': 'Thiết lập',
    '/hotel/new-hotel': 'Thêm khách sạn mới',
    '/hotel/edit-hotel': 'Chỉnh sửa khách sạn',
    '/room/new-room': 'Thêm loại phòng mới',
    '/room/edit-room': 'Chỉnh sửa phòng',
  };

  if (routes[pathname]) return routes[pathname];

  for (const [key, title] of Object.entries(routes)) {
    if (pathname.includes(key)) return title;
  }

  return 'Partner';
};

export default function PartnerLayout() {
  const isMobile = Platform.OS !== 'web';
  
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated, logout } = useAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-SIDEBAR_EXPANDED)).current;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login'); 
    }
  }, [isAuthenticated, isLoading]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const openMobileDrawer = () => {
    setDrawerOpen(true);
    setTimeout(() => {
      Animated.spring(drawerAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 14,
        bounciness: 0,
      }).start();
    }, 0);
  };

  const closeMobileDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: -SIDEBAR_EXPANDED,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setDrawerOpen(false));
  };

  if (isLoading || !isAuthenticated) {
    return (
      <View style={s.center}>
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  const title = getPageTitle(pathname);

  // Giao diện Mobile
  if (isMobile) {
    return (
      <View style={s.container}>
        <Header title={title} onMenuPress={openMobileDrawer} />

        <View style={s.content}>
          <Slot />
        </View>

        {drawerOpen && (
          <TouchableWithoutFeedback onPress={closeMobileDrawer}>
            <View style={s.overlay} />
          </TouchableWithoutFeedback>
        )}

        {drawerOpen && (
          <Animated.View
            style={[
              s.mobileDrawer,
              { transform: [{ translateX: drawerAnim }] },
            ]}
          >
            <Sidebar
              collapsed={false}
              onLogout={handleLogout}
              onNavComplete={closeMobileDrawer}
            />
          </Animated.View>
        )}
      </View>
    );
  }

  // Giao diện Desktop
  return (
    <View style={s.row}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        onLogout={handleLogout}
      />
      <View style={s.main}>
        <Header title={title} />
        <Slot />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  row: { flex: 1, flexDirection: 'row', backgroundColor: '#F8FAFC' },
  content: { flex: 1 },
  main: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 10,
  },
  mobileDrawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_EXPANDED,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
});