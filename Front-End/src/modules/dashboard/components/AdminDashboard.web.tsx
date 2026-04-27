import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface AdminDashboardProps {
  user: any;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  return (
    <View style={styles.webContainer}>
      {/* Sidebar - Desktop Only */}
      <View style={styles.sidebar}>
        <Text style={styles.logo}>ANTIGRAVITY</Text>
        <View style={styles.menuItems}>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemActive]}>
            <Text style={styles.menuTextActive}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>User Management</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Partner Approvals</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>System Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Audit Logs</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.mainContent}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Administrative Overview</Text>
          <Text style={styles.pageSubtitle}>System status and performance metrics</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: '#3B82F6' }]}>
            <Text style={styles.statValue}>1,284</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
            <Text style={styles.statValue}>85</Text>
            <Text style={styles.statLabel}>Active Partners</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
            <Text style={styles.statValue}>$12,450</Text>
            <Text style={styles.statLabel}>Monthly Revenue</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#EF4444' }]}>
            <Text style={styles.statValue}>14</Text>
            <Text style={styles.statLabel}>Pending Issues</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>User</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Role</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Action</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Time</Text>
            </View>
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2, fontWeight: '600' }]}>User {i}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Partner</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>Created new listing #A10{i}</Text>
                <Text style={[styles.tableCell, { flex: 1, color: '#94A3B8' }]}>{i}h ago</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  webContainer: { flex: 1, flexDirection: 'row', backgroundColor: '#F8FAFC' },
  sidebar: {
    width: 280,
    backgroundColor: '#0F172A',
    padding: 30,
    height: '100%',
  },
  logo: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 50,
  },
  menuItems: { gap: 10 },
  menuItem: {
    padding: 15,
    borderRadius: 12,
  },
  menuItemActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  menuText: { color: '#94A3B8', fontSize: 15, fontWeight: '600' },
  menuTextActive: { color: '#60A5FA', fontSize: 15, fontWeight: '700' },
  mainContent: { flex: 1, padding: 40 },
  pageHeader: { marginBottom: 40 },
  pageTitle: { fontSize: 32, fontWeight: 'bold', color: '#1E293B' },
  pageSubtitle: { fontSize: 16, color: '#64748B', marginTop: 8 },
  statsGrid: { flexDirection: 'row', gap: 24, marginBottom: 40 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 16,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#1E293B' },
  statLabel: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 24 },
  table: { width: '100%' },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 10,
  },
  tableHeaderText: { color: '#94A3B8', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableCell: { fontSize: 14, color: '#334155' },
});
