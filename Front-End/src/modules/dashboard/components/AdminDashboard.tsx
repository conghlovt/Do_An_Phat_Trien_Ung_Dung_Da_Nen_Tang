import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

interface AdminDashboardProps {
  user: any;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.warningCard}>
          <Text style={styles.icon}>💻</Text>
          <Text style={styles.title}>Web Access Required</Text>
          <Text style={styles.message}>
            The Admin Dashboard is only accessible via a web browser for security and better management tools.
          </Text>
          <Text style={styles.hint}>
            Please log in from your computer to manage the system.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  warningCard: {
    backgroundColor: '#FFF',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginBottom: 12, textAlign: 'center' },
  message: { fontSize: 16, color: '#64748B', textAlign: 'center', lineHeight: 24, marginBottom: 20 },
  hint: { fontSize: 14, color: '#94A3B8', textAlign: 'center', fontStyle: 'italic' },
});
