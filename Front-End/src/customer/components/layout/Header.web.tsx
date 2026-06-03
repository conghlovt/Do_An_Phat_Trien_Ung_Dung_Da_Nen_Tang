import { styles } from "./Header.styles";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, Pressable, ActivityIndicator, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  MapPin,
  ChevronDown,
  MessageCircle,
  Bell,
  Search,
  Mail,
  User,
  LogOut,
} from "lucide-react-native";
import { useLocationContext } from "@/src/customer/context/LocationContext";
import { useThemeContext } from "@/src/customer/theme/ThemeContext";
import { useAuth } from "@/src/customer/hooks/useAuth";
import LocationPickerModal from "@/src/customer/components/layout/LocationPickerModal";
import { messagesApi } from "@/src/customer/services/messages/messages.api";

const STAYHUB_COLOR = "#85c2a4";
const PRIMARY = "#85c2a4";

interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenMessages?: () => void;
  onOpenNotifications?: () => void;
  isScrolled?: boolean;
}

export default function Header({
  onOpenSearch,
  onOpenMessages,
  onOpenNotifications,
  isScrolled = false,
}: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectedProvince, isLoading } = useLocationContext();
  const { currentTheme } = useThemeContext();
  const { user, isAuthenticated, logout } = useAuth();
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const displayName =
    user?.nickname ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "Khách hàng";
  const initial = displayName.slice(0, 1).toUpperCase();
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
          setUnreadMessagesCount(
            messages.filter((message) => !message.isRead).length,
          );
          setUnreadNotificationsCount(
            notifications.filter((notification) => !notification.isRead).length,
          );
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
    await logout();
    router.replace("/login" as any);
  };

  return (
    <>
      {accountMenuOpen && isAuthenticated && (
        <Pressable
          style={styles.webAccountBackdrop}
          onPress={() => setAccountMenuOpen(false)}
        />
      )}

      <View
        style={[
          styles.container,
          { paddingTop: insets.top + 8 },
          styles.webContainer,
          isScrolled
            ? [styles.scrolled, { backgroundColor: currentTheme.card }]
            : [
                styles.notScrolled,
                { backgroundColor: "rgba(133,194,164,0.14)" },
              ],
        ]}
      >
        <View style={styles.webInner}>
          {!isScrolled && (
            <View style={[styles.topRow, styles.webTopRow]}>
              <View style={styles.brandBlock}>
                <Image
                  source={require("../../../../assets/images/stayhub-logo.png")}
                  style={{ width: 150, height: 58 }}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.subtitle,
                    styles.webSubtitle,
                    { color: currentTheme.textSecondary },
                  ]}
                >
                  Khám phá khách sạn và ưu đãi tại
                </Text>

                <Pressable
                  style={[styles.locationRow, styles.webLocationRow]}
                  onPress={() => setLocationModalVisible(true)}
                  hitSlop={8}
                >
                  {isLoading ? (
                    <ActivityIndicator size={14} color={STAYHUB_COLOR} />
                  ) : (
                    <MapPin size={20} color={STAYHUB_COLOR} strokeWidth={2.5} />
                  )}
                  <Text
                    style={[
                      styles.location,
                      styles.webLocation,
                      { color: STAYHUB_COLOR },
                    ]}
                    numberOfLines={1}
                  >
                    {locationLabel}
                  </Text>
                  <ChevronDown size={16} color={STAYHUB_COLOR} />
                </Pressable>
              </View>

              <View style={[styles.actions, styles.webActions]}>
                {!isAuthenticated && (
                  <View style={styles.webAuthActions}>
                    <Pressable
                      style={[
                        styles.webLoginBtn,
                        {
                          backgroundColor: currentTheme.card,
                          borderColor: currentTheme.border,
                        },
                      ]}
                      onPress={() => router.push("/login" as any)}
                    >
                      <Text style={styles.webLoginBtnText}>Đăng nhập</Text>
                    </Pressable>
                    <Pressable
                      style={styles.webRegisterBtn}
                      onPress={() => router.push("/login/register" as any)}
                    >
                      <Text style={styles.webRegisterBtnText}>Đăng ký</Text>
                    </Pressable>
                  </View>
                )}
                {isAuthenticated && (
                  <Pressable
                    style={[
                      styles.webAccountChip,
                      {
                        backgroundColor: currentTheme.card,
                        borderColor: currentTheme.border,
                      },
                    ]}
                    onPress={() => setAccountMenuOpen((value) => !value)}
                  >
                    <View style={styles.webAccountAvatar}>
                      <Text style={styles.webAccountAvatarText}>{initial}</Text>
                    </View>
                    <View style={styles.webAccountTextWrap}>
                      <Text
                        style={[
                          styles.webAccountName,
                          { color: currentTheme.text },
                        ]}
                        numberOfLines={1}
                      >
                        {displayName}
                      </Text>
                      <Text style={styles.webAccountRole}>Khách hàng</Text>
                    </View>
                  </Pressable>
                )}
              </View>
            </View>
          )}

          <View style={[styles.searchRow, styles.webSearchRow]}>
            <Pressable
              style={[
                styles.searchBar,
                styles.webSearchBar,
                {
                  backgroundColor: currentTheme.card,
                  borderColor: "rgba(133,194,164,0.45)",
                },
              ]}
              onPress={onOpenSearch}
            >
              <Search size={20} color={PRIMARY} />
              <Text
                style={[
                  styles.searchPlaceholder,
                  styles.webSearchPlaceholder,
                  { color: currentTheme.textSecondary },
                ]}
              >
                Tên khách sạn, hoặc quận...
              </Text>
            </Pressable>
            {isScrolled && (
              <View style={[styles.actions, styles.webScrolledActions]}>
                {!isAuthenticated && (
                  <View style={styles.webAuthActions}>
                    <Pressable
                      style={[
                        styles.webLoginBtn,
                        {
                          backgroundColor: currentTheme.card,
                          borderColor: currentTheme.border,
                        },
                      ]}
                      onPress={() => router.push("/login" as any)}
                    >
                      <Text style={styles.webLoginBtnText}>Đăng nhập</Text>
                    </Pressable>
                    <Pressable
                      style={styles.webRegisterBtn}
                      onPress={() => router.push("/login/register" as any)}
                    >
                      <Text style={styles.webRegisterBtnText}>Đăng ký</Text>
                    </Pressable>
                  </View>
                )}
                {isAuthenticated && (
                  <Pressable
                    style={[
                      styles.webAccountChip,
                      styles.webAccountChipCompact,
                      {
                        backgroundColor: currentTheme.card,
                        borderColor: currentTheme.border,
                      },
                    ]}
                    onPress={() => setAccountMenuOpen((value) => !value)}
                  >
                    <View style={styles.webAccountAvatar}>
                      <Text style={styles.webAccountAvatarText}>{initial}</Text>
                    </View>
                    <View style={styles.webAccountTextWrap}>
                      <Text
                        style={[
                          styles.webAccountName,
                          { color: currentTheme.text },
                        ]}
                        numberOfLines={1}
                      >
                        {displayName}
                      </Text>
                      <Text style={styles.webAccountRole}>Khách hàng</Text>
                    </View>
                  </Pressable>
                )}
              </View>
            )}
          </View>

          {accountMenuOpen && isAuthenticated && (
            <View
              style={[
                styles.webAccountMenu,
                {
                  top: isScrolled ? 54 : 62,
                  backgroundColor: currentTheme.card,
                  borderColor: currentTheme.border,
                },
              ]}
            >
              <View style={styles.webAccountMenuHeader}>
                <View style={styles.webAccountMenuAvatar}>
                  <Text style={styles.webAccountMenuAvatarText}>{initial}</Text>
                </View>
                <View style={styles.webAccountMenuInfo}>
                  <Text
                    style={[
                      styles.webAccountMenuName,
                      { color: currentTheme.text },
                    ]}
                    numberOfLines={1}
                  >
                    {displayName}
                  </Text>
                  <Text style={styles.webAccountMenuRole}>Khách hàng</Text>
                </View>
              </View>

              <View
                style={[
                  styles.webMenuDivider,
                  { backgroundColor: currentTheme.border },
                ]}
              />

              <View style={styles.webInfoRow}>
                <Mail size={17} color="#64748b" strokeWidth={2.1} />
                <Text style={styles.webInfoText} numberOfLines={1}>
                  {user?.email || "customer@stayhub.vn"}
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
                    <Text style={styles.webMenuCountBadgeText}>
                      {unreadMessagesCount}
                    </Text>
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
                {unreadNotificationsCount > 0 && (
                  <View style={styles.webMenuNotificationDot} />
                )}
              </Pressable>

              <Pressable
                onPress={() => {
                  setAccountMenuOpen(false);
                  router.push("/customer/profile" as any);
                }}
                style={styles.webMenuAction}
              >
                <User size={18} color={PRIMARY} strokeWidth={2.2} />
                <Text style={styles.webMenuActionText}>
                  Thông tin người dùng
                </Text>
              </Pressable>

              <Pressable onPress={handleLogout} style={styles.webMenuAction}>
                <LogOut size={18} color="#ef4444" strokeWidth={2.2} />
                <Text
                  style={[styles.webMenuActionText, styles.webMenuLogoutText]}
                >
                  Đăng xuất
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      <LocationPickerModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
      />
    </>
  );
}
