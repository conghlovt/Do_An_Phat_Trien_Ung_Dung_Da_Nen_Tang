import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import SettingsItem from '@/src/customer/components/SettingsItem';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { useAuth } from '@/src/customer/hooks/useAuth';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode, setIsDarkMode, currentTheme } = useThemeContext();
  const { user, isAuthenticated, logout } = useAuth();
  const { width } = useWindowDimensions();
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const isWebLayout = Platform.OS === 'web' && width >= 768;

  const getInitials = () => {
    if (!user) return 'TK';
    const name = user.username || user.email || '';
    const parts = name.split(/[\s@]/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = user?.username || user?.email?.split('@')[0] || (isAuthenticated ? 'Khách hàng' : 'Tài khoản khách');

  const handleLogout = async () => {
    await logout();
    router.replace('/login' as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Trang trí góc trên phải */}
      {!isWebLayout && (
        <View
          style={[styles.topRightDecoration, { backgroundColor: currentTheme.decor }]}
        />
      )}

      <ScrollView
        showsVerticalScrollIndicator={isWebLayout}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: isWebLayout ? 28 : insets.top },
          isWebLayout && styles.webScrollContent,
        ]}
      >
        <View style={isWebLayout && styles.webContent}>
        {/* Header: avatar */}
        <View style={styles.header}>
          <View style={[styles.avatarContainer, styles.avatarFilled]}>
            <Text style={styles.avatarInitials}>{getInitials()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.headerText, { color: currentTheme.text }]}>
              {displayName}
            </Text>
            {user?.email && (
              <Text style={[styles.emailText, { color: currentTheme.textSecondary }]}>
                {user.email}
              </Text>
            )}
            {!isAuthenticated && (
              <Text style={[styles.emailText, { color: currentTheme.textSecondary }]}>
                Đăng nhập để lưu đặt phòng và nhận ưu đãi riêng.
              </Text>
            )}
          </View>
        </View>

        {!isAuthenticated && (
          <View style={styles.authActions}>
            <Pressable style={styles.loginBtn} onPress={() => router.push('/login' as any)}>
              <Text style={styles.loginBtnText}>Đăng nhập</Text>
            </Pressable>
            <Pressable style={styles.registerBtn} onPress={() => router.push('/login/register' as any)}>
              <Text style={styles.registerBtnText}>Đăng ký</Text>
            </Pressable>
          </View>
        )}

        {/* Phần Cài đặt */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.headerTitle }]}>
            Cài đặt
          </Text>
          <View style={[styles.card, { backgroundColor: currentTheme.card }]}>
            <SettingsItem
              icon={<Feather name="bell" size={20} color="#85C2A4" />}
              title="Thông báo"
              onPress={() => router.push('/customer/notification-settings' as any)}
              currentTheme={currentTheme}
            />
            <SettingsItem
              icon={<Ionicons name="language-outline" size={20} color="#85C2A4" />}
              title="Ngôn ngữ"
              rightText="Tiếng Việt"
              currentTheme={currentTheme}
            />
            <SettingsItem
              icon={<Feather name="settings" size={20} color="#85C2A4" />}
              title="Giao diện Sáng/Tối"
              hasSwitch
              currentTheme={currentTheme}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
            />
            {isAuthenticated && (
              <SettingsItem
                icon={<Feather name="log-out" size={20} color="#e05252" />}
                title="Đăng xuất"
                isLast
                onPress={handleLogout}
                currentTheme={currentTheme}
                titleColor="#e05252"
              />
            )}
          </View>
        </View>

        {/* Phần Thông tin */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.headerTitle }]}>
            Thông tin
          </Text>
          <View style={[styles.card, { backgroundColor: currentTheme.card }]}>
            <SettingsItem
              icon={<Feather name="help-circle" size={20} color="#85C2A4" />}
              title="Hỏi đáp"
              onPress={() => router.push('/customer/faqs' as any)}
              currentTheme={currentTheme}
            />
            <SettingsItem
              icon={<Feather name="shield" size={20} color="#85C2A4" />}
              title="Điều khoản & Chính sách bảo mật"
              onPress={() => router.push('/customer/terms' as any)}
              currentTheme={currentTheme}
            />
            <SettingsItem
              icon={<Feather name="arrow-down-circle" size={20} color="#85C2A4" />}
              title="Phiên bản"
              rightText={appVersion}
              currentTheme={currentTheme}
            />
            <SettingsItem
              icon={<Feather name="phone" size={20} color="#85C2A4" />}
              title="Liên hệ"
              isLast
              onPress={() => router.push('/customer/contact-support' as any)}
              currentTheme={currentTheme}
            />
          </View>
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  webScrollContent: {
    paddingHorizontal: 32,
    paddingBottom: 52,
  },
  webContent: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
  },
  topRightDecoration: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    zIndex: 1,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EBEBEB',
    borderWidth: 2,
    borderColor: '#B0C4B1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFilled: {
    backgroundColor: '#85c2a4',
    borderColor: '#85c2a4',
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '500',
  },
  emailText: {
    fontSize: 13,
    marginTop: 2,
  },
  authActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  loginBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#85c2a4',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(133,194,164,0.1)',
  },
  loginBtnText: {
    color: '#85c2a4',
    fontSize: 14,
    fontWeight: '800',
  },
  registerBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#85c2a4',
  },
  registerBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    borderRadius: 16,
    paddingHorizontal: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
});
