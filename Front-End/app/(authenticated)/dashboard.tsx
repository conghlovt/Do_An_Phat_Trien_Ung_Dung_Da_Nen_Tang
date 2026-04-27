import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../../src/modules/auth/hooks/useAuth';
import { UserDashboard } from '../../src/modules/dashboard/components/UserDashboard';
import { AdminDashboard } from '../../src/modules/dashboard/components/AdminDashboard';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout, isLoading, isAuthenticated } = useAuth();

  const ADMIN_ROLES = ['admin', 'SUPER_ADMIN', 'OPERATOR', 'ACCOUNTANT'];
  const isAdmin = user && ADMIN_ROLES.includes(user.role);

  const handleLogout = async () => {
    try {
      await logout();
      if (Platform.OS === 'web') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } else {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
      }
      router.replace('/login' as any);
    } catch (error) {
      router.replace('/login' as any);
    }
  };

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login' as any);
      return;
    }

    // If user is logged in but trying to access admin dashboard without permission
    // In this specific layout, dashboard.tsx handles both, but we should ensure
    // we don't show admin UI to customers/partners
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  const renderContent = () => {
    if (isAdmin) {
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    }
    return <UserDashboard user={user} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hello,</Text>
          <Text style={styles.usernameText}>{user?.username || 'User'}</Text>
        </View>
        {!isAdmin && (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 10,
  },
  welcomeText: { fontSize: 14, color: '#64748B' },
  usernameText: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  logoutBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: '#FEE2E2' },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 13 },
  content: { flex: 1 },
});

