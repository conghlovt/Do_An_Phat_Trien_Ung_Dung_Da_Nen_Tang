import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '../../src/login/hooks/useAuth';
import { PartnerDashboard } from '../../src/partner/components/PartnerDashboard';

export default function PartnerDashboardScreen() {
  const router = useRouter();
  const { user, logout, isLoading, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login' as any);
  };

  React.useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) router.replace('/login' as any);
  }, [isAuthenticated, isLoading]);

  if (isLoading || !isAuthenticated) {
    return <View style={s.center}><Text>Loading...</Text></View>;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PartnerDashboard user={user} onLogout={handleLogout} />
    </>
  );
}

const s = StyleSheet.create({ center: { flex: 1, justifyContent: 'center', alignItems: 'center' } });
