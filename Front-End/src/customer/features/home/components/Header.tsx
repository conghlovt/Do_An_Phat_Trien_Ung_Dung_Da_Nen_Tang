import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Platform, View, Text, StyleSheet, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, ChevronDown, MessageCircle, Bell, Search, Mail, User, LogOut, LogIn } from 'lucide-react-native';
import { useLocationContext } from '@/src/customer/features/location/context/LocationContext';
import { useThemeContext } from '@/src/customer/shared/theme/ThemeContext';
import { useAuth } from '@/src/customer/features/auth/hooks/useAuth';
import LocationPickerModal from '@/src/customer/features/location/components/LocationPickerModal';
import { messagesApi } from '@/src/customer/features/messages/api/messages.api';

const STAYHUB_COLOR = '#599373';
const STAYHUB_LIGHT = '#85c2a4';
const STAYHUB_DARK = '#ffffff';
const PRIMARY = '#85c2a4';

interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenMessages?: () => void;
  onOpenNotifications?: () => void;
  isScrolled?: boolean;
}

export default function Header({ onOpenSearch, onOpenMessages, onOpenNotifications, isScrolled = false }: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { selectedProvince, isLoading } = useLocationContext();
  const { currentTheme, isDarkMode } = useThemeContext();
  const { user, isAuthenticated, logout } = useAuth();
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const isWebLayout = Platform.OS === 'web' && width >= 768;
  const displayName = user?.username || user?.email?.split('@')[0] || 'Khách';
  const initial = displayName.slice(0, 1).toUpperCase();
  const stayHubColor = isDarkMode ? STAYHUB_DARK : STAYHUB_LIGHT;
  const locationLabel = selectedProvince.selectedWard
    ? `${selectedProvince.selectedWard}, ${selectedProvince.selectedDistrict}`
    : selectedProvince.selectedDistrict
      ? `${selectedProvince.selectedDistrict}, ${selectedProvince.name}`
      : selectedProvince.name;

  useEffect(() => {
    let isMounted = true;

    const loadUnreadIndicators = async () => {
      if (!isAuthenticated) {
        setUnreadMessagesCount(0);
        setUnreadNotificationsCount(0);
        return;
      }

      try {
        const [messages, notifications] = await Promise.all([
          messagesApi.getMessages(),
          messagesApi.getNotifications(),
        ]);

        if (isMounted) {
          setUnreadMessagesCount(messages.filter((message) => !message.isRead).length);
          setUnreadNotificationsCount(notifications.filter((notification) => !notification.isRead).length);
        }
      } catch {
        if (isMounted) {
          setUnreadMessagesCount(0);
          setUnreadNotificationsCount(0);
        }
      }
    };

    void loadUnreadIndicators();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleLogout = async () => {
    setAccountMenuOpen(false);

    if (isAuthenticated) {
      await logout();
      router.replace('/login' as any);
      return;
    }

    router.push('/login' as any);
  };

  return (
    <>
      {accountMenuOpen && isWebLayout && (
        <Pressable style={styles.webAccountBackdrop} onPress={() => setAccountMenuOpen(false)} />
      )}

      <View style={[
        styles.container,
        { paddingTop: insets.top + 8 },
        isWebLayout && styles.webContainer,
        isScrolled 
          ? [styles.scrolled, { backgroundColor: currentTheme.card }] 
          : [styles.notScrolled, { backgroundColor: isWebLayout ? 'rgba(133,194,164,0.14)' : currentTheme.background }],
      ]}>
        <View style={isWebLayout && styles.webInner}>
          {!isScrolled && (
            <View style={[styles.topRow, isWebLayout && styles.webTopRow]}>
              <View style={styles.brandBlock}>
                <Text
                  style={[
                    styles.brand,
                    isWebLayout && styles.webBrand,
                    { color: stayHubColor },
                  ]}
                >
                  StayHub
                </Text>
                <Text style={[styles.subtitle, isWebLayout && styles.webSubtitle, { color: currentTheme.textSecondary }]}>Khám phá khách sạn và ưu đãi tại</Text>

                <Pressable
                  style={[styles.locationRow, isWebLayout && styles.webLocationRow]}
                  onPress={() => setLocationModalVisible(true)}
                  hitSlop={8}
                >
                  {isLoading ? (
                    <ActivityIndicator size={14} color={STAYHUB_COLOR} />
                  ) : (
                    <MapPin size={16} color={STAYHUB_COLOR} fill={STAYHUB_COLOR} />
                  )}
                  <Text style={[styles.location, isWebLayout && styles.webLocation, { color: STAYHUB_COLOR }]} numberOfLines={1}>
                    {locationLabel}
                  </Text>
                  <ChevronDown size={16} color={STAYHUB_COLOR} />
                </Pressable>
              </View>

              <View style={[styles.actions, isWebLayout && styles.webActions]}>
                {!isWebLayout && (
                  <>
                    <Pressable style={[styles.actionBtn, { backgroundColor: 'rgba(133,194,164,0.2)' }]} onPress={onOpenMessages}>
                      <MessageCircle size={22} color={currentTheme.textSecondary} strokeWidth={1.5} />
                      {unreadMessagesCount > 0 && (
                        <View style={styles.countBadge}>
                          <Text style={styles.countBadgeText}>{unreadMessagesCount}</Text>
                        </View>
                      )}
                    </Pressable>
                    <Pressable style={[styles.actionBtn, { backgroundColor: 'rgba(133,194,164,0.2)' }]} onPress={onOpenNotifications}>
                      <Bell size={22} color={currentTheme.textSecondary} strokeWidth={1.5} />
                      {unreadNotificationsCount > 0 && <View style={styles.badge} />}
                    </Pressable>
                  </>
                )}
                {isWebLayout && (
                  <Pressable
                    style={[styles.webAccountChip, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}
                    onPress={() => setAccountMenuOpen((value) => !value)}
                  >
                    <View style={styles.webAccountAvatar}>
                      <Text style={styles.webAccountAvatarText}>{initial}</Text>
                    </View>
                    <View style={styles.webAccountTextWrap}>
                      <Text style={[styles.webAccountName, { color: currentTheme.text }]} numberOfLines={1}>
                        {displayName}
                      </Text>
                      <Text style={styles.webAccountRole}>{isAuthenticated ? 'Khách hàng' : 'Tài khoản khách'}</Text>
                    </View>
                  </Pressable>
                )}
              </View>
            </View>
          )}

          <View style={[styles.searchRow, isWebLayout && styles.webSearchRow]}>
            <Pressable style={[styles.searchBar, isWebLayout && styles.webSearchBar, { backgroundColor: currentTheme.card, borderColor: isWebLayout ? 'rgba(133,194,164,0.45)' : currentTheme.border }]} onPress={onOpenSearch}>
              <Search size={isWebLayout ? 20 : 18} color={PRIMARY} />
              <Text style={[styles.searchPlaceholder, isWebLayout && styles.webSearchPlaceholder, { color: currentTheme.textSecondary }]}>Tên khách sạn, hoặc quận...</Text>
            </Pressable>
            {isScrolled && (
              <View style={[styles.actions, isWebLayout && styles.webScrolledActions]}>
                {!isWebLayout && (
                  <>
                    <Pressable style={[styles.actionBtnSmall, { backgroundColor: currentTheme.background }]} onPress={onOpenMessages}>
                      <MessageCircle size={20} color={currentTheme.textSecondary} strokeWidth={1.5} />
                      {unreadMessagesCount > 0 && (
                        <View style={styles.countBadgeSmall}>
                          <Text style={styles.countBadgeText}>{unreadMessagesCount}</Text>
                        </View>
                      )}
                    </Pressable>
                    <Pressable style={[styles.actionBtnSmall, { backgroundColor: currentTheme.background }]} onPress={onOpenNotifications}>
                      <Bell size={20} color={currentTheme.textSecondary} strokeWidth={1.5} />
                      {unreadNotificationsCount > 0 && <View style={styles.badgeSmall} />}
                    </Pressable>
                  </>
                )}
                {isWebLayout && (
                  <Pressable
                    style={[styles.webAccountChip, styles.webAccountChipCompact, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}
                    onPress={() => setAccountMenuOpen((value) => !value)}
                  >
                    <View style={styles.webAccountAvatar}>
                      <Text style={styles.webAccountAvatarText}>{initial}</Text>
                    </View>
                    <View style={styles.webAccountTextWrap}>
                      <Text style={[styles.webAccountName, { color: currentTheme.text }]} numberOfLines={1}>
                        {displayName}
                      </Text>
                      <Text style={styles.webAccountRole}>{isAuthenticated ? 'Khách hàng' : 'Tài khoản khách'}</Text>
                    </View>
                  </Pressable>
                )}
              </View>
            )}
          </View>

          {accountMenuOpen && isWebLayout && (
            <View
              style={[
                styles.webAccountMenu,
                { top: isScrolled ? 54 : 62, backgroundColor: currentTheme.card, borderColor: currentTheme.border },
              ]}
            >
              <View style={styles.webAccountMenuHeader}>
                <View style={styles.webAccountMenuAvatar}>
                  <Text style={styles.webAccountMenuAvatarText}>{initial}</Text>
                </View>
                <View style={styles.webAccountMenuInfo}>
                  <Text style={[styles.webAccountMenuName, { color: currentTheme.text }]} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text style={styles.webAccountMenuRole}>{isAuthenticated ? 'Khách hàng' : 'Chưa đăng nhập'}</Text>
                </View>
              </View>

              <View style={[styles.webMenuDivider, { backgroundColor: currentTheme.border }]} />

              <View style={styles.webInfoRow}>
                <Mail size={17} color="#64748b" strokeWidth={2.1} />
                <Text style={styles.webInfoText} numberOfLines={1}>
                  {user?.email || 'Chưa có email'}
                </Text>
              </View>

              <Pressable
                onPress={() => {
                  setAccountMenuOpen(false);
                  onOpenMessages?.();
                }}
                style={styles.webMenuAction}
              >
                <MessageCircle size={18} color={PRIMARY} strokeWidth={2.2} />
                <Text style={styles.webMenuActionText}>Tin nhắn</Text>
                {unreadMessagesCount > 0 && (
                  <View style={styles.webMenuCountBadge}>
                    <Text style={styles.webMenuCountBadgeText}>{unreadMessagesCount}</Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                onPress={() => {
                  setAccountMenuOpen(false);
                  onOpenNotifications?.();
                }}
                style={styles.webMenuAction}
              >
                <Bell size={18} color={PRIMARY} strokeWidth={2.2} />
                <Text style={styles.webMenuActionText}>Thông báo</Text>
                {unreadNotificationsCount > 0 && <View style={styles.webMenuNotificationDot} />}
              </Pressable>

              <Pressable
                onPress={() => {
                  setAccountMenuOpen(false);
                  router.push('/customer/profile' as any);
                }}
                style={styles.webMenuAction}
              >
                <User size={18} color={PRIMARY} strokeWidth={2.2} />
                <Text style={styles.webMenuActionText}>Thông tin người dùng</Text>
              </Pressable>

              <Pressable onPress={handleLogout} style={styles.webMenuAction}>
                {isAuthenticated ? (
                  <LogOut size={18} color="#ef4444" strokeWidth={2.2} />
                ) : (
                  <LogIn size={18} color={PRIMARY} strokeWidth={2.2} />
                )}
                <Text style={[styles.webMenuActionText, isAuthenticated && styles.webMenuLogoutText]}>
                  {isAuthenticated ? 'Đăng xuất' : 'Đăng nhập'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Modal chọn tỉnh/thành */}
      <LocationPickerModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 12 },
  webContainer: {
    paddingHorizontal: 32,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(133,194,164,0.28)',
    zIndex: 160,
    ...(Platform.OS === 'web' ? { position: 'relative' as any } : {}),
  },
  webInner: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    zIndex: 220,
    ...(Platform.OS === 'web' ? { position: 'relative' as any } : {}),
  },
  scrolled: {},
  notScrolled: {
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  webTopRow: {
    alignItems: 'center',
    marginBottom: 18,
  },
  brandBlock: {
    flex: 1,
    marginRight: 12,
  },
  brand: { fontSize: 20, fontWeight: '800', letterSpacing: 0 },
  webBrand: { fontSize: 32 },
  subtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  webSubtitle: { fontSize: 14, marginTop: 4 },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  webLocationRow: {
    backgroundColor: '#fff',
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(133,194,164,0.45)',
    marginTop: 10,
  },
  location: {
    fontSize: 15,
    fontWeight: '700',
    maxWidth: 160,
  },
  webLocation: {
    maxWidth: 360,
    fontSize: 16,
  },
  actions: { flexDirection: 'row', gap: 8 },
  webActions: {
    position: 'absolute',
    right: 0,
    top: 8,
    alignItems: 'center',
  },
  webScrolledActions: {
    alignItems: 'center',
    marginLeft: 12,
  },
  actionBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  webActionBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'rgba(133,194,164,0.35)',
  },
  actionBtnSmall: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444',
    borderWidth: 1.5, borderColor: '#fff',
  },
  badgeSmall: {
    position: 'absolute', top: 4, right: 4,
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444',
    borderWidth: 1.5, borderColor: '#fff',
  },
  countBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeSmall: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  webAccountChip: {
    height: 46,
    minWidth: 190,
    maxWidth: 240,
    borderRadius: 23,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 7,
    paddingRight: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  webAccountChipCompact: {
    height: 42,
    minWidth: 178,
  },
  webAccountAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webAccountAvatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  webAccountTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  webAccountName: {
    fontSize: 13,
    fontWeight: '800',
  },
  webAccountRole: {
    marginTop: 1,
    color: PRIMARY,
    fontSize: 11,
    fontWeight: '700',
  },
  webAccountBackdrop: {
    position: 'fixed' as any,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 150,
  },
  webAccountMenu: {
    position: 'absolute',
    right: 0,
    width: 282,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    zIndex: 220,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 12,
  },
  webAccountMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    marginBottom: 10,
  },
  webAccountMenuAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webAccountMenuAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  webAccountMenuInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  webAccountMenuName: {
    fontSize: 16,
    fontWeight: '900',
  },
  webAccountMenuRole: {
    marginTop: 3,
    color: PRIMARY,
    fontSize: 12,
    fontWeight: '700',
  },
  webMenuDivider: {
    height: 1,
    marginBottom: 12,
  },
  webInfoRow: {
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 11,
    marginBottom: 8,
  },
  webInfoText: {
    flex: 1,
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
  webMenuAction: {
    minHeight: 44,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 11,
  },
  webMenuActionText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '800',
  },
  webMenuLogoutText: {
    color: '#ef4444',
  },
  webMenuNotificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginLeft: 'auto',
  },
  webMenuCountBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  webMenuCountBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  webSearchRow: {
    marginTop: 6,
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 99, paddingHorizontal: 16, paddingVertical: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05,
    shadowRadius: 4, elevation: 2, borderWidth: 1,
  },
  webSearchBar: {
    maxWidth: 760,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 15,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  searchPlaceholder: { fontSize: 14, fontWeight: '500', flex: 1 },
  webSearchPlaceholder: { fontSize: 15 },
});
