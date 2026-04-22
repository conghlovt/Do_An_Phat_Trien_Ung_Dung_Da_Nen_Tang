import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Animated, Image } from 'react-native';

import { useRouter } from 'expo-router';
import { useAuth } from '../src/modules/auth/hooks/useAuth';

const BACKGROUND_IMAGE = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=3140&auto=format&fit=crop';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated && user) {
          router.replace('/dashboard' as any);
        } else {
          router.replace('/login' as any);
        }

      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, user]);

  return (
    <ImageBackground source={{ uri: BACKGROUND_IMAGE }} style={styles.container} blurRadius={3}>
      <View style={styles.overlay} />
      <Animated.View style={{ ...styles.content, opacity: fadeAnim }}>
        <Image 
          source={require('../assets/images/logo.png')} 
          style={{ width: 120, height: 120, marginBottom: 20, borderRadius: 20 }} 
        />
        <Text style={styles.logoText}>StayHub</Text>

        <Text style={styles.subtitle}>Premium Experience</Text>
      </Animated.View>
    </ImageBackground>
  );

}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 50, 80, 0.5)' },
  content: { alignItems: 'center' },
  logoText: { fontSize: 32, fontWeight: 'bold', color: '#FFF', letterSpacing: 2, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#E0F2F1', marginTop: 8, letterSpacing: 1 },
});
