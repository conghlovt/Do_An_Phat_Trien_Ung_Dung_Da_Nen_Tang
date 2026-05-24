import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  useWindowDimensions,
  Text,
} from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import {
  Sidebar,
  SIDEBAR_EXPANDED,
} from '../../src/partner/components/shared/Sidebar';
import { Header } from '../../src/partner/components/shared/Header';
import { useAuth } from '../../src/login/hooks/useAuth';

const isMobile = Platform.OS !== 'web';

export default function PartnerLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated, logout } = useAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-SIDEBAR_EXPANDED)).current;

  React.useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/login' as any);
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login' as any);
  };

  const openMobileDrawer = () => {
    setDrawerOpen(true);

    Animated.spring(drawerAnim, {
      toValue: 0,
      useNativeDriver: true,
      speed: 14,
      bounciness: 0,
    }).start();
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
        <Text>Loading...</Text>
      </View>
    );
  }

  let title = 'Partner';

  if (pathname === '/partner/dashboard' || pathname === '/partner') {
    title = 'Trang chủ';
  } else if (pathname.includes('/rooms')) {
    title = 'Quản lý phòng';
  } else if (pathname.includes('/booking')) {
    title = 'Đơn đặt phòng';
  } else if (pathname.includes('/vouchers')) {
    title = 'Quản lý Voucher';
  } else if (pathname.includes('/stats')) {
    title = 'Thống kê';
  } else if (pathname.includes('/settings')) {
    title = 'Thiết lập';
  } else if (pathname.includes('/hotel/new-hotel')) {
    title = 'Thêm khách sạn mới';
  } else if (pathname.includes('/hotel/edit-hotel')) {
    title = 'Chỉnh sửa khách sạn';
  } else if (pathname.includes('/room/new-room')) {
    title = 'Thêm loại phòng mới';
  } else if (pathname.includes('/room/edit-room')) {
    title = 'Chỉnh sửa phòng';
  } else if (pathname.includes('/room/')) {
    title = 'Chi tiết phòng';
  }

  if (isMobile || !isDesktop) {
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  main: {
    flex: 1,
  },
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