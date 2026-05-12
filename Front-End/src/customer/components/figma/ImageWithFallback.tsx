import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { Image } from 'expo-image';
import { ImageOff } from 'lucide-react-native';

interface Props {
  uri: string;
  style?: ImageStyle | ViewStyle;
  alt?: string;
}

export default function ImageWithFallback({ uri, style, alt }: Props) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <View style={[styles.fallback, style as ViewStyle]}>
        <ImageOff size={32} color="#d1d5db" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style as ImageStyle}
      contentFit="cover"
      onError={() => setError(true)}
      accessibilityLabel={alt}
      transition={200}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
