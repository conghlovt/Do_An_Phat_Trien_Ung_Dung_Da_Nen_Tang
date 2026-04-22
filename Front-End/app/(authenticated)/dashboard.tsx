import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../../src/modules/auth/hooks/useAuth';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

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

  const renderAdminDashboard = () => (
    <View>
      <View style={[styles.card, { backgroundColor: '#1E293B' }]}>
        <Text style={styles.cardTitle}>System Overview</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>1.2k</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>85</Text>
            <Text style={styles.statLabel}>Partners</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Admin Actions</Text>
      <TouchableOpacity style={styles.actionItem}>
        <Text style={styles.actionText}>User Management</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionItem}>
        <Text style={styles.actionText}>System Configuration</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionItem}>
        <Text style={styles.actionText}>Audit Logs</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPartnerDashboard = () => (
    <View>
      <View style={[styles.card, { backgroundColor: '#065F46' }]}>
        <Text style={styles.cardTitle}>Partner Statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>$4.5k</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Active Listings</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Manage Listings</Text>
      <TouchableOpacity style={styles.actionItem}>
        <Text style={styles.actionText}>Add New Accommodation</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionItem}>
        <Text style={styles.actionText}>View Bookings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionItem}>
        <Text style={styles.actionText}>Voucher Management</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCustomerDashboard = () => (
    <View>
      <View style={[styles.card, { backgroundColor: '#0369A1' }]}>
        <Text style={styles.cardTitle}>My Activity</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Links</Text>
      <TouchableOpacity style={styles.actionItem}>
        <Text style={styles.actionText}>Explore Accommodations</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionItem}>
        <Text style={styles.actionText}>My Saved Places</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionItem}>
        <Text style={styles.actionText}>Transaction History</Text>
      </TouchableOpacity>
    </View>
  );

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{user?.role?.toUpperCase()}</Text>
        </View>

        {user?.role === 'admin' && renderAdminDashboard()}
        {user?.role === 'partner' && renderPartnerDashboard()}
        {user?.role === 'customer' && renderCustomerDashboard()}
      </ScrollView>
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
  },
  welcomeText: { fontSize: 14, color: '#64748B' },
  usernameText: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  logoutBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: '#FEE2E2' },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 13 },
  content: { flex: 1, padding: 24 },
  roleBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  roleBadgeText: { fontSize: 10, fontWeight: '800', color: '#475569', letterSpacing: 1 },
  card: { borderRadius: 20, padding: 24, marginBottom: 30, elevation: 4 },
  cardTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 20 },
  statBox: { flex: 1 },
  statNumber: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  actionItem: {
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  actionText: { fontSize: 15, fontWeight: '600', color: '#334155' },
});

