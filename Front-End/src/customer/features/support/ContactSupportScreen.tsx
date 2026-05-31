import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { SupportCard } from '@/src/customer/features/support/SupportCard';
import { SupportScreen } from '@/src/customer/features/support/SupportScreen';
import { SUPPORT_ACCENT, supportStyles as styles } from '@/src/customer/styles/support/support.styles';
import { CONTACT_ITEMS } from '@/src/customer/constants/support/contactSupport';
import { useOfficeInfo } from '@/src/customer/hooks/support/useOfficeInfo';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';

export default function ContactSupportScreen() {
  const { currentTheme } = useThemeContext();
  const { loading, officeInfo, openMap } = useOfficeInfo();

  return (
    <SupportScreen title="Liên hệ & Hỗ trợ">
      {CONTACT_ITEMS.map(({ action, buttonLabel, icon, subtitle, title, type }) => (
        <SupportCard
          key={type}
          actionLabel={buttonLabel}
          icon={icon}
          onAction={action}
          subtitle={subtitle}
          title={title}
        />
      ))}

      {loading ? (
        <SupportCard centered>
          <ActivityIndicator size="large" color={SUPPORT_ACCENT} />
        </SupportCard>
      ) : officeInfo ? (
        <SupportCard icon={MapPin} title={officeInfo.title}>
          <Text style={[styles.itemSubtitle, styles.offsetText, { color: currentTheme.textSecondary }]}>
            {officeInfo.address}
          </Text>
          <Text style={[styles.itemSubtitle, styles.offsetText, { color: currentTheme.textSecondary }]}>
            Thứ 2-6: {officeInfo.hours.weekday} · Cuối tuần: {officeInfo.hours.weekend}
          </Text>
          <Pressable style={styles.mapBtn} onPress={openMap}>
            <MapPin size={16} color="#fff" />
            <Text style={styles.mapBtnText}>Xem trên bản đồ</Text>
          </Pressable>
        </SupportCard>
      ) : null}
    </SupportScreen>
  );
}
