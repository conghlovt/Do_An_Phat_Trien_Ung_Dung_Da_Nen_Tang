import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/login/hooks/useAuth';
import { CustomerDashboard } from '../../src/customer/components/CustomerDashboard';

export default function CustomerDashboardScreen() {
  const router = useRouter();
  const { user, logout, isLoading, isAuthenticated } = useAuth();

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
    if (user?.role === 'partner') {
      router.replace('/partner/dashboard' as any);
    }
  }, [isAuthenticated, isLoading, router, user?.role]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hello,</Text>
          <Text style={styles.usernameText}>{user?.username || 'User'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <CustomerDashboard user={user} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
