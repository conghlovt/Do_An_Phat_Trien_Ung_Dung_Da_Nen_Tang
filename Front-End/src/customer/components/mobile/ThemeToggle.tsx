import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ThemeToggleProps {
  isDarkMode: boolean;
  onValueChange: () => void;
}

const ThemeToggle = ({ isDarkMode, onValueChange }: ThemeToggleProps) => {
  const animatedValue = useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isDarkMode ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isDarkMode, animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 28],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onValueChange}
      style={[
        styles.switchContainer,
        { backgroundColor: isDarkMode ? '#3A3B3C' : '#D3D3D3' },
      ]}
    >
      <Animated.View
        style={[styles.switchThumb, { transform: [{ translateX }] }]}
      >
        <Feather name={isDarkMode ? 'moon' : 'sun'} size={12} color="#F7B500" />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    width: 52,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
});

export default ThemeToggle;
