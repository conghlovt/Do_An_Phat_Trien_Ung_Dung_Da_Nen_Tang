import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Đang tải...' }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#008080" />
    <Text style={styles.text}>{message}</Text>
  </View>
);

export const EmptyState: React.FC<{ icon?: string; title: string; subtitle?: string }> = ({
  icon = '📋',
  title,
  subtitle,
}) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  text: { marginTop: 12, fontSize: 14, color: '#64748B' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#334155', textAlign: 'center' },
  emptySubtitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 6 },
});
