import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import SettingsItem from '@/src/customer/components/mobile/SettingsItem';
import { useThemeContext } from '@/src/customer/utils/ThemeContext';
import { useAuth } from '@/src/customer/hooks/useAuth';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode, setIsDarkMode, currentTheme } = useThemeContext();
  const { isAuthenticated, user, logout } = useAuth();
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const getInitials = () => {
    if (!user) return '?';
    const name = user.username || user.email || '';
    const parts = name.split(/[\s@]/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = user?.username || user?.email?.split('@')[0] || 'Khách';

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Trang trí góc trên phải */}
      <View
        style={[styles.topRightDecoration, { backgroundColor: currentTheme.decor }]}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 32 }}
      >
        {/* Header: avatar */}
        <View style={styles.header}>
          {isAuthenticated && user ? (
            <>
              <View style={[styles.avatarContainer, styles.avatarFilled]}>
                <Text style={styles.avatarInitials}>{getInitials()}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.headerText, { color: currentTheme.text }]}>
                  {displayName}
                </Text>
                {user.email && user.username && (
                  <Text style={[styles.emailText, { color: currentTheme.textSecondary }]}>
                    {user.email}
                  </Text>
                )}
              </View>
            </>
          ) : (
            <>
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={40} color="#D1D1D1" />
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.headerText, { color: currentTheme.text }]}>
                  Khách
                </Text>
                <View style={styles.authButtons}>
                  <TouchableOpacity
                    style={[styles.loginBtn, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}
                    onPress={() => router.push('/login' as any)}
                  >
                    <Text style={[styles.loginBtnText, { color: currentTheme.text }]}>Đăng nhập</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.registerBtnInline}
                    onPress={() => router.push('/login/register' as any)}
                  >
                    <Text style={styles.registerBtnInlineText}>Đăng ký</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>

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
              isLast={!isAuthenticated}
              currentTheme={currentTheme}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
            />
            {isAuthenticated && (
              <SettingsItem
                icon={<Feather name="log-out" size={20} color="#e05252" />}
                title="Đăng xuất"
                isLast
                onPress={logout}
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: '#599373',
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
  authButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  loginBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  loginBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  registerBtnInline: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#85c2a4',
  },
  registerBtnInlineText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
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
