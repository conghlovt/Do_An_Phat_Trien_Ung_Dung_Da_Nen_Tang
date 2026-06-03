import { styles } from '@/src/customer/styles/notification/notificationSettings.styles';
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { useCustomerBack } from '@/src/customer/navigation/useCustomerBack';
import CustomSwitch from '@/src/customer/components/ui/CustomSwitch';

export default function NotificationSettingsScreen() {
  const goBack = useCustomerBack('/customer/profile');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentTheme } = useThemeContext();
  const isWebLayout = Platform.OS === 'web' && width >= 768;

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
    <View style={[styles.container, isWebLayout && styles.webContainer, { backgroundColor: currentTheme.background, paddingTop: isWebLayout ? 0 : insets.top }]}>
      {/* Header */}
      <View style={[styles.header, isWebLayout && styles.webHeader, { backgroundColor: currentTheme.background, borderBottomColor: currentTheme.border }]}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <ArrowLeft size={24} color={currentTheme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Thông báo</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Cài đặt */}
      <View style={[styles.content, isWebLayout && styles.webContent]}>
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
