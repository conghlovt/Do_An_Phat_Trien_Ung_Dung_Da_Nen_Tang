import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useThemeContext } from '@/src/customer/utils/ThemeContext';
import { LocationProvider } from '@/src/customer/utils/LocationContext';
import { View, useWindowDimensions, StyleSheet, Platform } from 'react-native';
import { useEffect } from 'react';
import { useAuth } from '@/src/customer/hooks/useAuth';

function ThemedStatusBar() {
  const { isDarkMode } = useThemeContext();
  return <StatusBar style={isDarkMode ? 'light' : 'dark'} />;
}

function AuthRestorer({ children }: { children: React.ReactNode }) {
  const { restoreSession } = useAuth();
  useEffect(() => {
    restoreSession();
  }, []);
  return <>{children}</>;
}

function ResponsiveAppWrapper({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const { currentTheme } = useThemeContext();
  const isLargeScreen = width >= 768;

  return (
    <View style={[styles.rootContainer, { backgroundColor: currentTheme.background }]}>
      <View
        style={[
          styles.appContainer,
          isLargeScreen && styles.appContainerLarge,
          isLargeScreen && { backgroundColor: currentTheme.background },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <LocationProvider>
      <ThemeProvider>
        <ThemedStatusBar />
        <AuthRestorer>
          <ResponsiveAppWrapper>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="hotel-detail" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="room-list" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="see-all" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="booking-calendar" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="booking-confirm" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="search" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="near-me" options={{ presentation: 'fullScreenModal', animation: 'slide_from_right' }} />
              <Stack.Screen name="notifications" options={{ presentation: 'fullScreenModal', animation: 'slide_from_right' }} />
              <Stack.Screen name="contact-support" options={{ animation: 'slide_from_right' }} />
            </Stack>
          </ResponsiveAppWrapper>
        </AuthRestorer>
      </ThemeProvider>
    </LocationProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  appContainerLarge:
    Platform.OS === 'web'
      ? { width: '100%', height: '100%' }
      : {
          maxWidth: 480,
          maxHeight: '100%',
          borderRadius: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 10,
          marginVertical: 20,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.05)',
        },
});
