import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Header } from '../../src/partner/components/Header';
import { useAuth } from '../../src/login/hooks/useAuth';
import { ChevronRight, ShieldCheck, Wallet, User, Mail, BadgeCheck, Settings as SettingsIcon } from 'lucide-react-native';

const isMobile = Platform.OS !== 'web';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <View style={s.container}>
      <ScrollView style={s.scroll}>
        <View style={s.mobilePageHeader}>
          <Text style={s.mobilePageTitle}>Thiết lập</Text>
          {isMobile && <Text style={s.mobilePageSub}>Quản lý tài khoản & chính sách</Text>}
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Thông tin tài khoản</Text>
          <View style={s.card}>
            <View style={s.row}>
              <View style={s.rowLeft}>
                <Mail size={16} color="#64748B" />
                <Text style={s.label}>Email</Text>
              </View>
              <Text style={s.value}>{user?.email}</Text>
            </View>
            <View style={s.divider} />
            <View style={s.row}>
              <View style={s.rowLeft}>
                <User size={16} color="#64748B" />
                <Text style={s.label}>Tên</Text>
              </View>
              <Text style={s.value}>{user?.username}</Text>
            </View>
            <View style={s.divider} />
            <View style={s.row}>
              <View style={s.rowLeft}>
                <BadgeCheck size={16} color="#64748B" />
                <Text style={s.label}>Vai trò</Text>
              </View>
              <Text style={s.value}>Đối tác</Text>
            </View>
          </View>
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Chính sách</Text>
          <View style={s.card}>
            <TouchableOpacity
              style={s.settingRow}
              onPress={() => router.push('/partner/cancellation-policy' as any)}
            >
              <View style={s.settingLeft}>
                <ShieldCheck size={16} color="#334155" />
                <Text style={s.settingText}>Chính sách hủy phòng</Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>
            <View style={s.divider} />
            <TouchableOpacity
              style={s.settingRow}
              onPress={() => router.push('/partner/deposit-policy' as any)}
            >
              <View style={s.settingLeft}>
                <Wallet size={16} color="#334155" />
                <Text style={s.settingText}>Chính sách đặt cọc</Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Ứng dụng</Text>
          <View style={s.card}>
            <View style={s.row}><Text style={s.label}>Phiên bản</Text><Text style={s.value}>1.0.0</Text></View>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: isMobile ? '#FFF' : '#F8FAFC' },
  scroll: { flex: 1 },
  mobilePageHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  mobilePageTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  mobilePageSub: { fontSize: 13, color: '#64748B' },
  pageHeader: { paddingHorizontal: 24, paddingVertical: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  pageTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  section: { marginHorizontal: isMobile ? 16 : 20, marginTop: isMobile ? 20 : 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: isMobile ? 14 : 12,
    borderWidth: isMobile ? 0 : 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...(isMobile ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 } : {}),
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: isMobile ? 16 : 14 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontSize: 14, color: '#64748B' },
  value: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  divider: { height: 1, backgroundColor: '#F1F5F9' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: isMobile ? 16 : 14 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingText: { fontSize: 14, color: '#334155' },
});
