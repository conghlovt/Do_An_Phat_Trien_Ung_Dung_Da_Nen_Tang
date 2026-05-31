import React, { type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useSupportLayout } from '@/src/customer/hooks/support/useSupportLayout';
import { supportStyles as styles } from '@/src/customer/styles/support/support.styles';

type SupportScreenProps = {
  backTo?: string;
  children: ReactNode;
  title: string;
};

export function SupportScreen({ backTo = '/customer/profile', children, title }: SupportScreenProps) {
  const {
    containerStyle,
    contentContainerStyle,
    currentTheme,
    goBack,
    headerStyle,
    isWebLayout,
  } = useSupportLayout(backTo);

  return (
    <View style={containerStyle}>
      <View style={headerStyle}>
        <Pressable style={styles.backBtn} onPress={goBack}>
          <ChevronLeft size={22} color={currentTheme.text} />
        </Pressable>
        <Text style={[styles.title, { color: currentTheme.text }]}>{title}</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={isWebLayout}
      >
        {children}
      </ScrollView>
    </View>
  );
}
