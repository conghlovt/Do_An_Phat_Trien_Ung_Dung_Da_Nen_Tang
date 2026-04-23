import { Stack } from 'expo-router';
import { AppProvider } from '../src/providers/AppProvider';

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(authenticated)" />

      </Stack>
    </AppProvider>
  );
}
