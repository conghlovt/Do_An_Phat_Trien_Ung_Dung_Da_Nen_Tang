import { Stack } from 'expo-router';
import { AppProvider } from '../src/login/providers/AppProvider';

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="customer" />
        <Stack.Screen name="partner" />
      </Stack>
    </AppProvider>
  );
}
