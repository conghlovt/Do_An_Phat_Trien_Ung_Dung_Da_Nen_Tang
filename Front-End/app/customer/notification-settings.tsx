import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useThemeContext } from '@/src/customer/utils/ThemeContext';

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
}

const CustomSwitch = ({ value, onValueChange, disabled }: CustomSwitchProps) => {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [value, animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 28],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#D3D3D3', '#85C2A4']
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Animated.View style={[styles.switchContainer, { backgroundColor }]}>
        <Animated.View style={[styles.switchThumb, { transform: [{ translateX }] }]} />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentTheme } = useThemeContext();

  const [pushEnabled, setPushEnabled] = useState(false);
  const [flashSaleEnabled, setFlashSaleEnabled] = useState(false);
  const [bookingEnabled, setBookingEnabled] = useState(false);

  const handlePushToggle = (value: boolean) => {
    setPushEnabled(value);
    if (!value) {
      setFlashSaleEnabled(false);
      setBookingEnabled(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.background, borderBottomColor: currentTheme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={currentTheme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Thông báo</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Cài đặt */}
      <View style={styles.content}>
        {/* Thông báo đẩy */}
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, { color: currentTheme.text }]}>Thông báo đẩy</Text>
            <Text style={[styles.settingSubtitle, { color: currentTheme.textSecondary }]}>Nhận thông tin và các chương trình ưu đãi</Text>
          </View>
          <CustomSwitch value={pushEnabled} onValueChange={handlePushToggle} />
        </View>

        {/* Flash Sale */}
        <View style={[styles.settingItem, !pushEnabled && { opacity: 0.5 }]}>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, { color: currentTheme.text }]}>Flash Sale</Text>
            <Text style={[styles.settingSubtitle, { color: currentTheme.textSecondary }]}>Nhận thông báo khi mở bán Flash Sale</Text>
          </View>
          <CustomSwitch value={flashSaleEnabled} onValueChange={setFlashSaleEnabled} disabled={!pushEnabled} />
        </View>

        {/* Đặt phòng */}
        <View style={[styles.settingItem, !pushEnabled && { opacity: 0.5 }]}>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, { color: currentTheme.text }]}>Đặt phòng</Text>
            <Text style={[styles.settingSubtitle, { color: currentTheme.textSecondary }]}>Theo dõi thông tin đặt phòng của bạn</Text>
          </View>
          <CustomSwitch value={bookingEnabled} onValueChange={setBookingEnabled} disabled={!pushEnabled} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 13,
  },
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
});
