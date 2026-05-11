import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import {
  Bell,
  Building2,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  FileText,
  Globe,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Moon,
  Search,
  Star,
  Sun,
  Ticket,
  User,
  Users,
} from 'lucide-react-native';
import { adminService } from '../services/admin.service';
import { canViewTab, PermissionMap } from '../utils/permissions';

const getNotificationStorageKey = (userId?: string) => `admin_read_notifications_${userId || 'guest'}`;

type AdminThemeContextValue = {
  isDarkMode: boolean;
  isLight: boolean;
};

const AdminThemeContext = React.createContext<AdminThemeContextValue>({
  isDarkMode: false,
  isLight: true,
});

export const useAdminTheme = () => React.useContext(AdminThemeContext);

interface AdminShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout?: () => void;
  permissions?: PermissionMap;
}

export const AdminShell: React.FC<AdminShellProps> = ({ children, activeTab, setActiveTab, user, onLogout, permissions }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['users']);
  const [globalSearch, setGlobalSearch] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const menuStructure = useMemo(() => [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    {
      id: 'users',
      label: 'Quản lý người dùng',
      icon: Users,
      children: [
        { label: 'Khách hàng', value: 'customers' },
        { label: 'Đối tác', value: 'partners' },
        { label: 'Nhân viên', value: 'staff' },
        { label: 'Quản trị viên', value: 'admins' },
        { label: 'Phân quyền', value: 'roles' },
      ],
    },
    { id: 'lodging', label: 'Quản lý cơ sở lưu trú', icon: Building2 },
    { id: 'booking', label: 'Quản lý đặt phòng', icon: CalendarCheck },
    { id: 'voucher', label: 'Chương trình ưu đãi', icon: Ticket },
    { id: 'reviews', label: 'Đánh giá & Phản hồi', icon: Star },
    { id: 'content', label: 'Quản lý nội dung', icon: FileText },
  ], []);

  const canShowTab = useCallback((tab: string) => !permissions || canViewTab(permissions, user?.role, tab), [permissions, user?.role]);

  const visibleMenuStructure = useMemo(() => {
    return menuStructure
      .map((menu) => ({
        ...menu,
        children: menu.children?.filter((child) => canShowTab(child.value)),
      }))
      .filter((menu) => canShowTab(menu.id) || Boolean(menu.children?.length));
  }, [canShowTab, menuStructure]);

  const searchableItems = useMemo(() => {
    return visibleMenuStructure.flatMap((menu) => {
      const parent = [{ label: menu.label, value: menu.id, group: 'Menu' }];
      const children = menu.children?.map((child) => ({ ...child, group: menu.label })) || [];
      return canShowTab(menu.id) ? [...parent, ...children] : children;
    });
  }, [canShowTab, visibleMenuStructure]);

  const searchResults = globalSearch.trim()
    ? searchableItems.filter((item) => item.label.toLowerCase().includes(globalSearch.trim().toLowerCase())).slice(0, 8)
    : [];

  const notificationItems = useMemo(
    () => notifications.map((item) => ({ ...item, isRead: readNotificationIds.includes(item.id) })),
    [notifications, readNotificationIds],
  );

  const unreadNotifications = useMemo(
    () => notificationItems.filter((item) => !item.isRead),
    [notificationItems],
  );

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await adminService.getNotifications();
        setNotifications(data || []);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    try {
      const stored = window.localStorage.getItem(getNotificationStorageKey(user?.id));
      setReadNotificationIds(stored ? JSON.parse(stored) : []);
    } catch {
      setReadNotificationIds([]);
    }
  }, [user?.id]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => (prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]));
  };

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    setGlobalSearch('');
    setIsNotificationOpen(false);
  };

  const persistReadNotifications = useCallback((ids: string[]) => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(getNotificationStorageKey(user?.id), JSON.stringify(ids));
    } catch {
      // Ignore storage errors; the in-memory read state still updates for this session.
    }
  }, [user?.id]);

  const markNotificationAsRead = useCallback((id: string) => {
    setReadNotificationIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      persistReadNotifications(next);
      return next;
    });
  }, [persistReadNotifications]);

  const markAllNotificationsAsRead = useCallback(() => {
    const next = Array.from(new Set([...readNotificationIds, ...notifications.map((item) => item.id)]));
    setReadNotificationIds(next);
    persistReadNotifications(next);
  }, [notifications, persistReadNotifications, readNotificationIds]);

  const handleNotificationPress = (item: any) => {
    markNotificationAsRead(item.id);
    navigateTo(item.tab || 'overview');
  };

  const getBreadcrumb = () => {
    if (activeTab === 'overview') return 'Tổng quan';
    if (['customers', 'partners', 'staff', 'admins', 'roles'].includes(activeTab)) return 'Quản lý người dùng';
    if (activeTab === 'lodging') return 'Quản lý cơ sở lưu trú';
    if (activeTab === 'booking') return 'Quản lý đặt phòng';
    if (activeTab === 'voucher') return 'Chương trình ưu đãi';
    if (activeTab === 'reviews') return 'Đánh giá & Phản hồi';
    if (activeTab === 'content') return 'Quản lý nội dung';
    return activeTab;
  };

  const isLight = !isDarkMode;
  const themeValue = useMemo(() => ({ isDarkMode, isLight }), [isDarkMode, isLight]);

  return (
    <AdminThemeContext.Provider value={themeValue}>
    <View style={[styles.container, isLight && styles.containerLight]}>
      <View style={[styles.sidebar, isLight && styles.sidebarLight, isSidebarCollapsed && styles.sidebarCollapsed]}>
        <View style={[styles.sidebarHeader, isLight && styles.borderLight]}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Building2 size={24} color="#FFF" />
            </View>
            {!isSidebarCollapsed && (
              <View>
                <Text style={[styles.logoText, isLight && styles.textDark]}>StayAdmin</Text>
                <Text style={styles.logoSubtext}>Nền tảng Đặt phòng</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => setIsSidebarCollapsed(!isSidebarCollapsed)} style={styles.collapseToggle}>
            <LayoutGrid size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
          {visibleMenuStructure.map((menu) => (
            <View key={menu.id}>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  activeTab === menu.id && styles.menuItemActive,
                  !isSidebarCollapsed && styles.menuItemFull,
                ]}
                onPress={() => (menu.children ? toggleMenu(menu.id) : navigateTo(menu.id))}
              >
                <View style={styles.menuItemLeft}>
                  <menu.icon size={20} color={activeTab === menu.id ? '#FFF' : '#94A3B8'} />
                  {!isSidebarCollapsed && (
                    <Text style={[styles.menuLabel, isLight && styles.menuLabelLight, activeTab === menu.id && styles.menuLabelActive]}>
                      {menu.label}
                    </Text>
                  )}
                </View>
                {!isSidebarCollapsed && menu.children && (
                  expandedMenus.includes(menu.id) ? <ChevronDown size={16} color="#64748B" /> : <ChevronRight size={16} color="#64748B" />
                )}
              </TouchableOpacity>

              {!isSidebarCollapsed && menu.children && expandedMenus.includes(menu.id) && (
                <View style={styles.subMenu}>
                  {menu.children.map((child) => (
                    <TouchableOpacity key={child.value} style={styles.subMenuItem} onPress={() => navigateTo(child.value)}>
                      <View style={[styles.subMenuDot, activeTab === child.value && styles.subMenuDotActive]} />
                      <Text style={[styles.subMenuLabel, isLight && styles.subMenuLabelLight, activeTab === child.value && styles.subMenuLabelActive]}>
                        {child.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {!isSidebarCollapsed && (
          <View style={[styles.sidebarFooter, isLight && styles.borderLight]}>
            <TouchableOpacity style={[styles.userProfile, isLight && styles.surfaceLight]} onPress={() => setIsUserMenuOpen((value) => !value)}>
              <View style={styles.avatarContainer}>
                <User size={20} color="#FFF" />
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, isLight && styles.textDark]}>{user?.username || 'Admin'}</Text>
                <Text style={styles.userRole}>{user?.role || 'Super Admin'}</Text>
              </View>
              <ChevronDown size={18} color="#64748B" />
            </TouchableOpacity>
            {isUserMenuOpen && (
              <TouchableOpacity onPress={onLogout} style={[styles.sidebarLogout, isLight && styles.surfaceLight]}>
                <LogOut size={16} color="#EF4444" />
                <Text style={styles.logoutText}>Đăng xuất</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={[styles.mainContent, isLight && styles.mainContentLight]}>
        <View style={[styles.header, isLight && styles.headerLight]}>
          <View style={styles.headerLeft}>
            <View style={styles.breadcrumbContainer}>
              <Text style={styles.breadcrumbPrev}>Trang chủ /</Text>
              <Text style={styles.breadcrumbCurrent}> {getBreadcrumb()}</Text>
            </View>
            <Text style={[styles.pageTitle, isLight && styles.textDark]}>Bảng điều khiển</Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.searchWrapper}>
              <View style={[styles.searchContainer, isLight && styles.searchContainerLight]}>
                <Search size={18} color="#64748B" />
                <TextInput
                  placeholder="Tìm kiếm menu..."
                  placeholderTextColor="#64748B"
                  style={[styles.searchInput, isLight && styles.searchInputLight]}
                  value={globalSearch}
                  onChangeText={setGlobalSearch}
                />
                <View style={styles.searchShortcut}>
                  <Text style={styles.shortcutText}>Ctrl K</Text>
                </View>
              </View>
              {searchResults.length > 0 && (
                <View style={[styles.dropdown, styles.searchDropdown, isLight && styles.dropdownLight]}>
                  {searchResults.map((item) => (
                    <TouchableOpacity key={`${item.group}-${item.value}`} style={styles.dropdownItem} onPress={() => navigateTo(item.value)}>
                      <Text style={[styles.dropdownTitle, isLight && styles.textDark]}>{item.label}</Text>
                      <Text style={styles.dropdownSubtitle}>{item.group}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.actionIcons}>
              <TouchableOpacity style={[styles.iconBtn, isLight && styles.iconBtnLight]} onPress={() => setIsDarkMode((value) => !value)}>
                {isDarkMode ? <Sun size={20} color="#94A3B8" /> : <Moon size={20} color="#475569" />}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, styles.langBtn, isLight && styles.iconBtnLight]}>
                <Globe size={18} color="#94A3B8" />
                <Text style={styles.langText}>VI</Text>
                <ChevronDown size={14} color="#94A3B8" />
              </TouchableOpacity>
              <View>
                <TouchableOpacity style={[styles.iconBtn, isLight && styles.iconBtnLight]} onPress={() => setIsNotificationOpen((value) => !value)}>
                  <Bell size={20} color="#94A3B8" />
                  {unreadNotifications.length > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.badgeText}>{unreadNotifications.length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {isNotificationOpen && (
                  <View style={[styles.dropdown, styles.notificationDropdown, isLight && styles.dropdownLight]}>
                    <View style={[styles.notificationHeader, isLight && styles.dropdownItemLight]}>
                      <Text style={[styles.notificationHeaderTitle, isLight && styles.textDark]}>Thông báo</Text>
                      {unreadNotifications.length > 0 && (
                        <TouchableOpacity onPress={markAllNotificationsAsRead}>
                          <Text style={styles.markReadText}>Đánh dấu đã đọc</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    {notificationItems.length > 0 ? (
                      notificationItems.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.dropdownItem,
                            styles.notificationItem,
                            item.isRead && styles.notificationItemRead,
                            isLight && styles.dropdownItemLight,
                          ]}
                          onPress={() => handleNotificationPress(item)}
                        >
                          <View style={[styles.notificationDot, item.isRead && styles.notificationDotRead]} />
                          <View style={styles.notificationContent}>
                            <View style={styles.notificationTitleRow}>
                              <Text style={[styles.dropdownTitle, item.isRead && styles.dropdownTitleRead, isLight && styles.textDark]}>{item.title}</Text>
                              <Text style={[styles.notificationStatus, item.isRead && styles.notificationStatusRead]}>{item.isRead ? 'Đã đọc' : 'Mới'}</Text>
                            </View>
                            <Text style={styles.dropdownSubtitle}>{item.message}</Text>
                          </View>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={[styles.dropdownItem, isLight && styles.dropdownItemLight]}>
                        <Text style={[styles.dropdownTitle, isLight && styles.textDark]}>Không có thông báo mới</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
              <View style={[styles.headerDivider, isLight && styles.headerDividerLight]} />
              <View>
                <TouchableOpacity style={[styles.headerUser, isLight && styles.headerUserLight]} onPress={() => setIsUserMenuOpen((value) => !value)}>
                  <View style={styles.headerAvatar}>
                    <User size={18} color="#FFF" />
                  </View>
                  <View style={styles.headerUserInfo}>
                    <Text style={[styles.headerUserName, isLight && styles.textDark]}>{user?.username || 'Admin'}</Text>
                    <Text style={styles.headerUserRole}>{user?.role || 'Super Admin'}</Text>
                  </View>
                  <ChevronDown size={14} color="#64748B" />
                </TouchableOpacity>
                {isUserMenuOpen && (
                  <View style={[styles.dropdown, styles.userDropdown, isLight && styles.dropdownLight]}>
                    <View style={[styles.dropdownItem, isLight && styles.dropdownItemLight]}>
                      <Text style={[styles.dropdownTitle, isLight && styles.textDark]}>{user?.email || user?.username || 'Admin'}</Text>
                      <Text style={styles.dropdownSubtitle}>{user?.role || 'Super Admin'}</Text>
                    </View>
                    <TouchableOpacity style={[styles.dropdownItem, isLight && styles.dropdownItemLight]} onPress={onLogout}>
                      <Text style={styles.logoutText}>Đăng xuất</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        <ScrollView style={[styles.contentScroll, isLight && styles.contentScrollLight]} contentContainerStyle={styles.contentContainer}>
          {children}
        </ScrollView>
      </View>
    </View>
    </AdminThemeContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#0F172A' },
  containerLight: { backgroundColor: '#F8FAFC' },
  sidebar: { width: 280, backgroundColor: '#1E293B', borderRightWidth: 1, borderRightColor: '#334155' },
  sidebarLight: { backgroundColor: '#FFF', borderRightColor: '#E2E8F0' },
  sidebarCollapsed: { width: 80 },
  sidebarHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 80, borderBottomWidth: 1, borderBottomColor: '#334155' },
  borderLight: { borderBottomColor: '#E2E8F0', borderTopColor: '#E2E8F0' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
  logoText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  logoSubtext: { color: '#64748B', fontSize: 11 },
  collapseToggle: { padding: 4 },
  menuScroll: { flex: 1, padding: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, marginBottom: 4 },
  menuItemFull: { paddingHorizontal: 12, justifyContent: 'space-between' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuItemActive: { backgroundColor: '#3B82F6' },
  menuLabel: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
  menuLabelLight: { color: '#475569' },
  menuLabelActive: { color: '#FFF' },
  subMenu: { paddingLeft: 44, paddingVertical: 8 },
  subMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 },
  subMenuDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#475569' },
  subMenuDotActive: { backgroundColor: '#3B82F6' },
  subMenuLabel: { color: '#64748B', fontSize: 13 },
  subMenuLabelLight: { color: '#64748B' },
  subMenuLabelActive: { color: '#3B82F6', fontWeight: '700' },
  sidebarFooter: { padding: 16, borderTopWidth: 1, borderTopColor: '#334155' },
  userProfile: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', padding: 12, borderRadius: 16, gap: 12 },
  avatarContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center' },
  userInfo: { flex: 1 },
  userName: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  userRole: { color: '#64748B', fontSize: 11 },
  sidebarLogout: { marginTop: 8, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: '#0F172A' },
  mainContent: { flex: 1, backgroundColor: '#0F172A' },
  mainContentLight: { backgroundColor: '#F8FAFC' },
  header: { height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: '#1E293B', zIndex: 20 },
  headerLight: { backgroundColor: '#FFF', borderBottomColor: '#E2E8F0' },
  headerLeft: { gap: 4 },
  breadcrumbContainer: { flexDirection: 'row', alignItems: 'center' },
  breadcrumbPrev: { color: '#64748B', fontSize: 12 },
  breadcrumbCurrent: { color: '#6366F1', fontSize: 12, fontWeight: '600' },
  pageTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  searchWrapper: { position: 'relative', zIndex: 50 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', paddingHorizontal: 16, height: 44, borderRadius: 12, width: 300, gap: 12, borderWidth: 1, borderColor: '#334155' },
  searchContainerLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  searchInput: { flex: 1, color: '#FFF', fontSize: 14, ...Platform.select({ web: { outlineStyle: 'none' } as any }) } as any,
  searchInputLight: { color: '#0F172A' },
  searchShortcut: { backgroundColor: '#334155', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  shortcutText: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold' },
  actionIcons: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  iconBtnLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  langBtn: { flexDirection: 'row', width: 80, gap: 6 },
  langText: { color: '#94A3B8', fontSize: 13, fontWeight: 'bold' },
  notificationBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', minWidth: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1E293B', paddingHorizontal: 3 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  headerDivider: { width: 1, height: 32, backgroundColor: '#334155' },
  headerDividerLight: { backgroundColor: '#CBD5E1' },
  headerUser: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1E293B', padding: 6, paddingRight: 12, borderRadius: 100, borderWidth: 1, borderColor: '#334155' },
  headerUserLight: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  headerAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center' },
  headerUserInfo: {},
  headerUserName: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  headerUserRole: { color: '#6366F1', fontSize: 10, fontWeight: '600' },
  dropdown: { position: 'absolute', top: 50, right: 0, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', borderRadius: 12, minWidth: 260, overflow: 'hidden', zIndex: 1000, ...Platform.select({ web: { boxShadow: '0 12px 24px rgba(0,0,0,0.22)' } as any }) },
  dropdownLight: { backgroundColor: '#FFF', borderColor: '#E2E8F0' },
  searchDropdown: { left: 0, right: undefined, width: 300 },
  notificationDropdown: { width: 320 },
  userDropdown: { width: 240 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#334155' },
  dropdownItemLight: { borderBottomColor: '#E2E8F0' },
  dropdownTitle: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  dropdownTitleRead: { color: '#94A3B8', fontWeight: '600' },
  dropdownSubtitle: { color: '#64748B', fontSize: 12, marginTop: 3 },
  notificationHeader: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notificationHeaderTitle: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  markReadText: { color: '#3B82F6', fontSize: 12, fontWeight: '700' },
  notificationItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  notificationItemRead: { opacity: 0.72 },
  notificationDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6', marginTop: 5 },
  notificationDotRead: { backgroundColor: '#475569' },
  notificationContent: { flex: 1 },
  notificationTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  notificationStatus: { color: '#3B82F6', fontSize: 11, fontWeight: '800' },
  notificationStatusRead: { color: '#64748B' },
  logoutText: { color: '#EF4444', fontSize: 13, fontWeight: '700' },
  textDark: { color: '#0F172A' },
  surfaceLight: { backgroundColor: '#F8FAFC' },
  contentScroll: { flex: 1, backgroundColor: '#0F172A' },
  contentScrollLight: { backgroundColor: '#F8FAFC' },
  contentContainer: { padding: 24 },
});
