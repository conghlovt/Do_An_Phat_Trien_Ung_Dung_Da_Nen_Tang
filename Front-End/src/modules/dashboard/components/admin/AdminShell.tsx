import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, Platform } from 'react-native';
import { 
  LayoutDashboard, Users, Building2, CalendarCheck, 
  Ticket, Star, FileText, ChevronDown, ChevronRight, 
  Menu, LogOut, Bell, Search, Sun, Globe, User, 
  LayoutGrid, CheckCircle
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface AdminShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
}

export const AdminShell: React.FC<AdminShellProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  user,
  onLogout 
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['users']);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
    );
  };

  const menuStructure = [
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
        { label: 'Phân quyền', value: 'roles' }
      ]
    },
    { id: 'lodging', label: 'Quản lý lưu trú', icon: Building2 },
    { id: 'booking', label: 'Quản lý Booking', icon: CalendarCheck },
    { id: 'voucher', label: 'Chương trình ưu đãi', icon: Ticket },
    { id: 'reviews', label: 'Đánh giá & Phản hồi', icon: Star },
    { id: 'content', label: 'Quản lý nội dung', icon: FileText },
  ];

  const getBreadcrumb = () => {
    if (activeTab === 'overview') return 'Tổng quan';
    if (['customers', 'partners', 'staff', 'admins', 'roles'].includes(activeTab)) return 'Quản lý người dùng';
    if (activeTab === 'lodging') return 'Quản lý lưu trú';
    if (activeTab === 'booking') return 'Quản lý Booking';
    return activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={[styles.sidebar, isSidebarCollapsed && styles.sidebarCollapsed]}>
        <View style={styles.sidebarHeader}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Building2 size={24} color="#FFF" />
            </View>
            {!isSidebarCollapsed && (
              <View>
                <Text style={styles.logoText}>StayAdmin</Text>
                <Text style={styles.logoSubtext}>Booking Platform</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => setIsSidebarCollapsed(!isSidebarCollapsed)} style={styles.collapseToggle}>
            <LayoutGrid size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
          {menuStructure.map((menu) => (
            <View key={menu.id}>
              <TouchableOpacity 
                style={[
                  styles.menuItem, 
                  activeTab === menu.id && styles.menuItemActive,
                  !isSidebarCollapsed && styles.menuItemFull
                ]}
                onPress={() => menu.children ? toggleMenu(menu.id) : setActiveTab(menu.id)}
              >
                <View style={styles.menuItemLeft}>
                  <menu.icon size={20} color={activeTab === menu.id ? '#FFF' : '#94A3B8'} />
                  {!isSidebarCollapsed && (
                    <Text style={[styles.menuLabel, activeTab === menu.id && styles.menuLabelActive]}>
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
                    <TouchableOpacity 
                      key={child.value}
                      style={[styles.subMenuItem, activeTab === child.value && styles.subMenuItemActive]}
                      onPress={() => setActiveTab(child.value)}
                    >
                      <View style={[styles.subMenuDot, activeTab === child.value && styles.subMenuDotActive]} />
                      <Text style={[styles.subMenuLabel, activeTab === child.value && styles.subMenuLabelActive]}>
                        {child.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* User Profile in Sidebar Footer */}
        {!isSidebarCollapsed && (
          <View style={styles.sidebarFooter}>
            <View style={styles.userProfile}>
              <View style={styles.avatarContainer}>
                <User size={20} color="#FFF" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.username || 'Nguyễn Admin'}</Text>
                <Text style={styles.userRole}>{user?.role || 'Super Admin'}</Text>
              </View>
              <TouchableOpacity onPress={onLogout} style={styles.logoutBtnSmall}>
                <LogOut size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.breadcrumbContainer}>
              <Text style={styles.breadcrumbPrev}>Trang chủ  /</Text>
              <Text style={styles.breadcrumbCurrent}> {getBreadcrumb()}</Text>
            </View>
            <Text style={styles.pageTitle}>Bảng điều khiển</Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.searchContainer}>
              <Search size={18} color="#64748B" />
              <TextInput 
                placeholder="Tìm kiếm toàn hệ thống..." 
                placeholderTextColor="#64748B"
                style={styles.searchInput}
              />
              <View style={styles.searchShortcut}>
                <Text style={styles.shortcutText}>⌘K</Text>
              </View>
            </View>

            <View style={styles.actionIcons}>
              <TouchableOpacity style={styles.iconBtn}>
                <Sun size={20} color="#94A3B8" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, styles.langBtn]}>
                <Globe size={18} color="#94A3B8" />
                <Text style={styles.langText}>VI</Text>
                <ChevronDown size={14} color="#94A3B8" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Bell size={20} color="#94A3B8" />
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.headerDivider} />
              <View style={styles.headerUser}>
                <View style={styles.headerAvatar}>
                  <User size={18} color="#FFF" />
                </View>
                <View style={styles.headerUserInfo}>
                  <Text style={styles.headerUserName}>{user?.username || 'Nguyễn Admin'}</Text>
                  <Text style={styles.headerUserRole}>{user?.role || 'Super Admin'}</Text>
                </View>
                <ChevronDown size={14} color="#64748B" />
              </View>
            </View>
          </View>
        </View>

        {/* Content View */}
        <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentContainer}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0F172A',
  },
  sidebar: {
    width: 280,
    backgroundColor: '#1E293B',
    borderRightWidth: 1,
    borderRightColor: '#334155',
  },
  sidebarCollapsed: {
    width: 80,
  },
  sidebarHeader: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoSubtext: {
    color: '#64748B',
    fontSize: 11,
  },
  collapseToggle: {
    padding: 4,
  },
  menuScroll: {
    flex: 1,
    padding: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  menuItemFull: {
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: '#3B82F6',
  },
  menuLabel: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  menuLabelActive: {
    color: '#FFF',
  },
  subMenu: {
    paddingLeft: 44,
    paddingVertical: 8,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  subMenuItemActive: {},
  subMenuDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#475569',
  },
  subMenuDotActive: {
    backgroundColor: '#3B82F6',
  },
  subMenuLabel: {
    color: '#64748B',
    fontSize: 13,
  },
  subMenuLabelActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  sidebarFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 16,
    gap: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  userRole: {
    color: '#64748B',
    fontSize: 11,
  },
  logoutBtnSmall: {
    padding: 4,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerLeft: {
    gap: 4,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbPrev: {
    color: '#475569',
    fontSize: 12,
  },
  breadcrumbCurrent: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '600',
  },
  pageTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 12,
    width: 300,
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any
    })
  },
  searchShortcut: {
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  shortcutText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  langBtn: {
    flexDirection: 'row',
    width: 80,
    gap: 6,
  },
  langText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1E293B',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#334155',
  },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1E293B',
    padding: 6,
    paddingRight: 12,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerUserInfo: {
    // Hidden on mobile, shown here for consistency
  },
  headerUserName: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  headerUserRole: {
    color: '#6366F1',
    fontSize: 10,
    fontWeight: '600',
  },
  contentScroll: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  contentContainer: {
    padding: 24,
  },
});
