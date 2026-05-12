import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Dimensions } from 'react-native';
import { Header } from '../../src/partner/components/Header';
import { BarChart3, Banknote, Star, DoorOpen, ClipboardList } from 'lucide-react-native';

const isMobile = Platform.OS !== 'web';

export default function StatsPage() {
  return (
    <View style={s.container}>
      <ScrollView style={s.scroll}>
        <View style={s.mobilePageHeader}>
          <Text style={s.mobilePageTitle}>Thống kê</Text>
          {isMobile && <Text style={s.mobilePageSub}>Tổng quan hiệu suất khách sạn</Text>}
        </View>

        {/* Stat Cards */}
        <View style={s.grid}>
          <View style={[s.statCard, { backgroundColor: '#0F766E' }]}>
            <View style={s.iconWrapper}><BarChart3 size={24} color="rgba(255,255,255,0.9)" /></View>
            <Text style={s.statNumber}>0</Text>
            <Text style={s.statLabel}>Đặt phòng hôm nay</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: '#1D4ED8' }]}>
            <View style={s.iconWrapper}><Banknote size={24} color="rgba(255,255,255,0.9)" /></View>
            <Text style={s.statNumber}>0đ</Text>
            <Text style={s.statLabel}>Doanh thu tháng</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: '#9333EA' }]}>
            <View style={s.iconWrapper}><Star size={24} color="rgba(255,255,255,0.9)" /></View>
            <Text style={s.statNumber}>0.0</Text>
            <Text style={s.statLabel}>Đánh giá TB</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: '#DC2626' }]}>
            <View style={s.iconWrapper}><DoorOpen size={24} color="rgba(255,255,255,0.9)" /></View>
            <Text style={s.statNumber}>0</Text>
            <Text style={s.statLabel}>Phòng trống</Text>
          </View>
        </View>

        <View style={s.section}>
          <View style={s.sectionTitleRow}>
            <ClipboardList size={18} color="#1E293B" />
            <Text style={s.sectionTitle}>Đặt phòng gần đây</Text>
          </View>
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>Chưa có đặt phòng nào</Text>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: isMobile ? 16 : 20, paddingTop: 20, gap: isMobile ? 10 : 14 },
  statCard: {
    borderRadius: isMobile ? 14 : 16,
    padding: isMobile ? 16 : 20,
    ...Platform.select({
      web: { width: 'calc(50% - 7px)' as any },
      default: { width: '47%', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 6 },
    }),
  },
  iconWrapper: { marginBottom: 8 },
  statNumber: { fontSize: isMobile ? 24 : 28, fontWeight: '800', color: '#FFF' },
  statLabel: { fontSize: isMobile ? 11 : 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  section: { marginHorizontal: isMobile ? 16 : 20, marginTop: 24 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  emptyCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  emptyText: { color: '#94A3B8', fontSize: 14 },
});
