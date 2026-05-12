import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Phone, MessageCircle, Mail, MapPin } from 'lucide-react-native';
import { useThemeContext } from '@/src/customer/utils/ThemeContext';
import { hotelsApi } from '@/src/customer/api/hotels.api';

const CONTACT_ITEMS = [
  {
    type: 'phone',
    title: 'Hotline CSKH',
    subtitle: '1900 1234',
    buttonLabel: 'Gọi ngay',
    icon: Phone,
    action: () => Linking.openURL('tel:19001234'),
  },
  {
    type: 'chat',
    title: 'Chat trực tuyến',
    subtitle: 'Zalo, Messenger',
    buttonLabel: 'Bắt đầu',
    icon: MessageCircle,
    action: () => {},
  },
  {
    type: 'email',
    title: 'Email',
    subtitle: 'support@stayhub.com',
    buttonLabel: 'Gửi email',
    icon: Mail,
    action: () => Linking.openURL('mailto:support@stayhub.com'),
  },
];

interface OfficeInfo {
  title: string;
  address: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  hours: { weekday: string; weekend: string };
}

export default function ContactSupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentTheme } = useThemeContext();
  const [officeInfo, setOfficeInfo] = useState<OfficeInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hotelsApi.getOfficeInfo()
      .then((result: any) => setOfficeInfo(result.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openMap = () => {
    if (!officeInfo) return;
    Linking.openURL(`https://maps.google.com/?q=${officeInfo.latitude},${officeInfo.longitude}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.card }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={currentTheme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Liên hệ & Hỗ trợ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Items */}
        {CONTACT_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <View key={item.type} style={[styles.contactItem, { backgroundColor: currentTheme.card }]}>
              <View style={styles.iconAndText}>
                <View style={[styles.iconCircle, { backgroundColor: currentTheme.decor }]}>
                  <Icon size={24} color={currentTheme.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemTitle, { color: currentTheme.text }]}>{item.title}</Text>
                  <Text style={[styles.itemSubtitle, { color: currentTheme.textSecondary }]}>{item.subtitle}</Text>
                </View>
              </View>
              <Pressable style={styles.actionBtn} onPress={item.action}>
                <Text style={styles.actionBtnText}>{item.buttonLabel}</Text>
              </Pressable>
            </View>
          );
        })}

        {/* Office Address */}
        {loading ? (
          <View style={[styles.officeSection, { backgroundColor: currentTheme.card, alignItems: 'center' }]}>
            <ActivityIndicator size="large" color="#F97316" />
          </View>
        ) : officeInfo ? (
          <View style={[styles.officeSection, { backgroundColor: currentTheme.card }]}>
            <View style={styles.officeHeader}>
              <View style={[styles.iconCircle, { backgroundColor: currentTheme.decor }]}>
                <MapPin size={24} color={currentTheme.text} />
              </View>
              <Text style={[styles.itemTitle, { color: currentTheme.text }]}>{officeInfo.title}</Text>
            </View>
            <Text style={[styles.addressText, { color: currentTheme.textSecondary }]}>{officeInfo.address}</Text>
            {officeInfo.hours && (
              <Text style={[styles.hoursText, { color: currentTheme.textSecondary }]}>
                Thứ 2–6: {officeInfo.hours.weekday} · Cuối tuần: {officeInfo.hours.weekend}
              </Text>
            )}
            <Pressable style={styles.mapBtn} onPress={openMap}>
              <MapPin size={16} color="#fff" />
              <Text style={styles.mapBtnText}>Xem trên bản đồ</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 2,
  },
  backBtn: { padding: 8, width: 40 },
  headerTitle: { fontSize: 17, fontWeight: '600', flex: 1, textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 16, paddingVertical: 16 },
  contactItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 16, padding: 16, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  iconAndText: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  itemSubtitle: { fontSize: 13 },
  actionBtn: { backgroundColor: '#F97316', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginLeft: 8 },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  officeSection: {
    borderRadius: 16, padding: 16, marginBottom: 32,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  officeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  addressText: { fontSize: 13, lineHeight: 20, marginLeft: 56 },
  hoursText: { fontSize: 12, marginLeft: 56, marginTop: 4, marginBottom: 4 },
  mapBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F97316',
  },
  mapBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
