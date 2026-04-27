import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface UserDashboardProps {
  user: any;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
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
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.roleBadge}>
        <Text style={styles.roleBadgeText}>{user?.role?.toUpperCase()}</Text>
      </View>

      {user?.role === 'partner' && renderPartnerDashboard()}
      {user?.role === 'customer' && renderCustomerDashboard()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
