import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../../login/hooks/useAuth';
import {
  Home, BedDouble, BarChart3, Settings, LogOut, Hotel,
  ChevronLeft, ChevronRight,
} from 'lucide-react-native';

interface MenuItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

// Đã cập nhật path của "Trang chủ" thành /partner/dashboard
const MENU_ITEMS: MenuItem[] = [
  { label: 'Trang chủ', icon: Home, path: '/partner/dashboard' },
  { label: 'Quản lý phòng', icon: BedDouble, path: '/partner/rooms' },
  { label: 'Thống kê', icon: BarChart3, path: '/partner/stats' },
  { label: 'Thiết lập', icon: Settings, path: '/partner/settings' },
];

const SIDEBAR_EXPANDED = 220;
const SIDEBAR_COLLAPSED = 64;

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggle }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login' as any);
  };

  // Logic kiểm tra active đã được sửa chuẩn
  const isActive = (path: string) => {
    // Nếu là trang chủ dashboard
    if (path === '/partner/dashboard') {
      return pathname === '/partner/dashboard' || pathname === '/partner';
    }
    // Với các trang khác, kiểm tra xem URL có chứa đường dẫn gốc không (vd: /partner/rooms/add)
    return pathname.startsWith(path);
  };

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <View
      style={[
        styles.container,
        { width: sidebarWidth },
        ...(Platform.OS === 'web'
          ? [{ transition: 'width 0.2s ease' } as any]
          : []),
      ]}
    >
      {/* Logo + Toggle */}
      <View style={styles.logoSection}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Hotel size={20} color="#FFF" />
          </View>
          {!collapsed && (
            <Text style={styles.logoText}>StayBuddy</Text>
          )}
        </View>
        <TouchableOpacity onPress={onToggle} style={styles.toggleBtn}>
          {collapsed ? (
            <ChevronRight size={16} color="#94A3B8" />
          ) : (
            <ChevronLeft size={16} color="#94A3B8" />
          )}
        </TouchableOpacity>
      </View>

      {/* User Badge */}
      {!collapsed && (
        <View style={styles.userBadge}>
          <View style={styles.userAvatarSmall}>
            <Text style={styles.userAvatarText}>
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.username || 'Người dùng'}
            </Text>
            <Text style={styles.userRole}>Đối tác</Text>
          </View>
        </View>
      )}
      {collapsed && (
        <View style={styles.userBadgeCollapsed}>
          <View style={styles.userAvatarSmall}>
            <Text style={styles.userAvatarText}>
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.divider} />

      {/* Menu Items */}
      <ScrollView style={styles.menuSection} showsVerticalScrollIndicator={false}>
        {MENU_ITEMS.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);
          return (
            <TouchableOpacity
              key={item.path}
              style={[
                styles.menuItem,
                collapsed && styles.menuItemCollapsed,
                active && styles.menuItemActive,
              ]}
              onPress={() => router.push(item.path as any)}
              activeOpacity={0.7}
            >
              {active && <View style={styles.activeIndicator} />}
              <View style={[styles.menuIconBox, active && styles.menuIconBoxActive]}>
                <IconComponent
                  size={18}
                  color={active ? '#0D9488' : '#64748B'}
                  strokeWidth={active ? 2.5 : 1.8}
                />
              </View>
              {!collapsed && (
                <Text
                  style={[styles.menuLabel, active && styles.menuLabelActive]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom — Logout */}
      <View style={styles.bottomSection}>
        <View style={styles.divider} />
        <TouchableOpacity
          style={[styles.logoutBtn, collapsed && styles.logoutBtnCollapsed]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogOut size={16} color="#EF4444" />
          {!collapsed && <Text style={styles.logoutText}>Đăng xuất</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export { SIDEBAR_EXPANDED, SIDEBAR_COLLAPSED };

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'web' ? 0 : 50,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    ...Platform.select({
      web: { height: '100vh' as any, overflow: 'hidden' as any },
      default: { flex: 1 },
    }),
  },

  // Logo
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 0.3,
  },
  toggleBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // User
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  userBadgeCollapsed: {
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  userAvatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  userName: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  userRole: { fontSize: 11, color: '#94A3B8' },

  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
    marginHorizontal: 12,
  },

  // Menu
  menuSection: { flex: 1, paddingHorizontal: 8 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 2,
    position: 'relative',
  },
  menuItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  menuItemActive: {
    backgroundColor: '#F0FDFA',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    backgroundColor: '#0D9488',
    borderRadius: 2,
  },
  menuIconBox: {
    width: 32,
    height: 32,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconBoxActive: {
    backgroundColor: '#CCFBF1',
  },
  menuLabel: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 8,
    fontWeight: '500',
  },
  menuLabelActive: {
    color: '#0D9488',
    fontWeight: '700',
  },

  // Bottom
  bottomSection: { paddingBottom: 16 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginHorizontal: 8,
    borderRadius: 8,
    gap: 8,
  },
  logoutBtnCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  logoutText: { color: '#EF4444', fontSize: 13, fontWeight: '600' },
});