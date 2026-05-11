import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/login/hooks/useAuth';
import { AdminDashboard } from '../../src/admin/components/AdminDashboard';

const ADMIN_ROLES = ['admin', 'SUPER_ADMIN', 'OPERATOR', 'ACCOUNTANT'];

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const isAdmin = user && ADMIN_ROLES.includes(user.role);

  const handleLogout = async () => {
    await logout();
    router.replace('/login' as any);
  };

  React.useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login' as any);
      return;
    }
    if (!isAdmin) {
      router.replace(user?.role === 'partner' ? '/partner/dashboard' as any : '/customer/dashboard' as any);
    }
  }, [isAuthenticated, isAdmin, isLoading, router, user?.role]);

  if (isLoading || !isAdmin) {
    return (
      <View style={styles.center}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return <AdminDashboard user={user} onLogout={handleLogout} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
