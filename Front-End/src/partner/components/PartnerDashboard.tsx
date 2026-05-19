/**
 * PartnerDashboard — SPA Shell (mirrors AdminDashboard pattern)
 *
 * Toàn bộ navigation được quản lý bằng state (activeScreen + screenParams).
 * Không dùng expo-router cho sub-screens → app/partner/ chỉ cần dashboard.tsx.
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  View, StyleSheet, Platform, Animated, TouchableOpacity,
  TouchableWithoutFeedback, useWindowDimensions,
} from 'react-native';
import { Sidebar, SIDEBAR_EXPANDED, SIDEBAR_COLLAPSED } from './shared/Sidebar';
import { Header } from './shared/Header';

// ── Screen components ──────────────────────────────────────────────────────
import { PartnerOverview } from './Overview/PartnerOverview';
import { RoomManagement } from './Management/RoomManagement';
import { BookingManagement } from './Management/BookingManagement';
import { StatsView } from './Management/StatsView';
import { PartnerSettings } from './Settings/PartnerSettings';
import { HotelEditForm } from './Hotel/HotelEditForm';
import { RoomDetail } from './Room/RoomDetail';
import { RoomForm } from './Room/RoomForm';
import { CancellationPolicy } from './Policy/CancellationPolicy';
import { DepositPolicy } from './Policy/DepositPolicy';

// ── Types ──────────────────────────────────────────────────────────────────
export type ScreenName =
  | 'overview'
  | 'rooms'
  | 'booking'
  | 'stats'
  | 'settings'
  | 'hotel-edit'
  | 'room-detail'
  | 'room-form'
  | 'cancellation-policy'
  | 'deposit-policy';

export interface ScreenParams {
  hotelId?: string;
  roomTypeId?: string;
  /** For hotel-edit: existing hotel id to edit (undefined = create) */
  editHotelId?: string;
}

interface NavEntry { screen: ScreenName; params: ScreenParams }

interface PartnerDashboardProps {
  user: any;
  onLogout: () => void;
}

const isMobile = Platform.OS !== 'web';

// ── Main Component ─────────────────────────────────────────────────────────
export function PartnerDashboard({ user, onLogout }: PartnerDashboardProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // Sidebar collapse
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-SIDEBAR_EXPANDED)).current;

  // ── Navigation stack ──────────────────────────────────────────────────────
  const [navStack, setNavStack] = useState<NavEntry[]>([
    { screen: 'overview', params: {} },
  ]);
  const current = navStack[navStack.length - 1]!;
  const activeScreen = current.screen;
  const screenParams = current.params;

  /** Navigate to a new screen (push onto stack) */
  const navigate = useCallback((screen: ScreenName, params: ScreenParams = {}) => {
    setNavStack(prev => [...prev, { screen, params }]);
    if (drawerOpen) closeMobileDrawer();
  }, [drawerOpen]);

  /** Go back one screen */
  const goBack = useCallback(() => {
    setNavStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  /** Switch tab (clears stack) */
  const switchTab = useCallback((screen: string) => {
    setNavStack([{ screen: screen as ScreenName, params: {} }]);
    if (drawerOpen) closeMobileDrawer();
  }, [drawerOpen]);

  // ── Mobile drawer ─────────────────────────────────────────────────────────
  const openMobileDrawer = () => {
    setDrawerOpen(true);
    Animated.spring(drawerAnim, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 0 }).start();
  };
  const closeMobileDrawer = () => {
    Animated.timing(drawerAnim, { toValue: -SIDEBAR_EXPANDED, duration: 220, useNativeDriver: true }).start(() => setDrawerOpen(false));
  };

  // ── Render screen ─────────────────────────────────────────────────────────
  const renderScreen = () => {
    switch (activeScreen) {
      case 'overview':
        return <PartnerOverview onNavigate={navigate} />;
      case 'rooms':
        return <RoomManagement onNavigate={navigate} />;
      case 'booking':
        return <BookingManagement />;
      case 'stats':
        return <StatsView />;
      case 'settings':
        return <PartnerSettings onNavigate={navigate} />;
      case 'hotel-edit':
        return <HotelEditForm hotelId={screenParams.editHotelId} onBack={goBack} />;
      case 'room-detail':
        return <RoomDetail hotelId={screenParams.hotelId!} roomTypeId={screenParams.roomTypeId!} onBack={goBack} />;
      case 'room-form':
        return <RoomForm hotelId={screenParams.hotelId!} onBack={goBack} />;
      case 'cancellation-policy':
        return <CancellationPolicy onBack={goBack} />;
      case 'deposit-policy':
        return <DepositPolicy onBack={goBack} />;
      default:
        return <PartnerOverview onNavigate={navigate} />;
    }
  };

  // ── Layout ────────────────────────────────────────────────────────────────
  if (isMobile || !isDesktop) {
    // Mobile: drawer overlay
    return (
      <View style={s.container}>
        <Header
          title={SCREEN_TITLES[activeScreen] || 'Partner'}
          onMenuPress={openMobileDrawer}
        />
        <View style={s.content}>{renderScreen()}</View>

        {drawerOpen && (
          <TouchableWithoutFeedback onPress={closeMobileDrawer}>
            <View style={s.overlay} />
          </TouchableWithoutFeedback>
        )}
        {drawerOpen && (
          <Animated.View style={[s.mobileDrawer, { transform: [{ translateX: drawerAnim }] }]}>
            <Sidebar
              collapsed={false}
              activeScreen={activeScreen}
              onNavigate={switchTab}
              onLogout={onLogout}
            />
          </Animated.View>
        )}
      </View>
    );
  }

  // Desktop: persistent sidebar
  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;
  return (
    <View style={s.row}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(p => !p)}
        activeScreen={activeScreen}
        onNavigate={switchTab}
        onLogout={onLogout}
      />
      <View style={s.main}>
        {renderScreen()}
      </View>
    </View>
  );
}

// ── Screen title map ──────────────────────────────────────────────────────
const SCREEN_TITLES: Partial<Record<ScreenName, string>> = {
  overview: 'Trang chủ',
  rooms: 'Quản lý phòng',
  booking: 'Đơn đặt phòng',
  stats: 'Thống kê',
  settings: 'Thiết lập',
  'hotel-edit': 'Chỉnh sửa khách sạn',
  'room-detail': 'Chi tiết phòng',
  'room-form': 'Thêm loại phòng',
  'cancellation-policy': 'Chính sách hủy',
  'deposit-policy': 'Chính sách đặt cọc',
};

const s = StyleSheet.create({
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
    top: 0, bottom: 0, left: 0,
    width: SIDEBAR_EXPANDED,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
});
