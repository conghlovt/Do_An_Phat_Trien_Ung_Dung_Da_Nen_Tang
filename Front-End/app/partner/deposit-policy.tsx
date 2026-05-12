import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useHotels } from '../../src/partner/hooks/useHotels';
import { Header } from '../../src/partner/components/Header';
import { ArrowLeft, Wallet, Check, Save, Info } from 'lucide-react-native';

const isMobile = Platform.OS !== 'web';

const DEPOSIT_PRESETS = [
  {
    value: 0,
    label: 'Không cần đặt cọc',
    desc: 'Khách không cần thanh toán trước. Phù hợp cho khách quen hoặc walk-in.',
    color: '#22C55E',
  },
  {
    value: 30,
    label: 'Đặt cọc 30%',
    desc: 'Khách thanh toán 30% khi đặt phòng. Đảm bảo cam kết nhưng vẫn linh hoạt.',
    color: '#3B82F6',
  },
  {
    value: 50,
    label: 'Đặt cọc 50%',
    desc: 'Khách thanh toán 50% khi đặt phòng. Cân bằng giữa bảo vệ doanh thu và sự linh hoạt.',
    color: '#F59E0B',
  },
  {
    value: 100,
    label: 'Thanh toán toàn bộ',
    desc: 'Khách thanh toán 100% khi đặt phòng. Đảm bảo doanh thu tối đa.',
    color: '#EF4444',
  },
];

export default function DepositPolicyPage() {
  const router = useRouter();
  const { hotels, currentHotel, updateHotel, loadHotel } = useHotels(true);
  const hotelId = currentHotel?.id || hotels[0]?.id || '';

  const [selectedPercent, setSelectedPercent] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (hotelId && !currentHotel) loadHotel(hotelId);
  }, [hotelId]);

  useEffect(() => {
    if (currentHotel) {
      setSelectedPercent(currentHotel.depositPercent ?? 0);
    }
  }, [currentHotel]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateHotel(hotelId, {
        depositPercent: selectedPercent,
      });
      const msg = 'Đã cập nhật chính sách đặt cọc thành công!';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Thành công', msg);
      router.back();
    } catch (err: any) {
      const msg = err.message || 'Có lỗi xảy ra';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Lỗi', msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={s.container}>
      {isMobile ? (
        <View style={s.mobileBackHeader}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <ArrowLeft size={20} color="#1E293B" />
          </TouchableOpacity>
          <Text style={s.mobileBackTitle}>Chính sách đặt cọc</Text>
        </View>
      ) : (
        <View style={s.pageHeader}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={18} color="#64748B" />
            <Text style={s.backText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.headerCard}>
          <View style={s.headerIconWrapper}>
            <Wallet size={28} color="#1D4ED8" />
          </View>
          <Text style={s.headerTitle}>Chính sách đặt cọc</Text>
          <Text style={s.headerSub}>
            Chọn mức đặt cọc phù hợp với khách sạn của bạn.
            Mức đặt cọc hợp lý giúp giảm tỷ lệ hủy phòng.
          </Text>
        </View>

        {/* Current Value Display */}
        <View style={s.currentValueCard}>
          <Text style={s.currentLabel}>Mức đặt cọc hiện tại</Text>
          <Text style={s.currentValue}>{selectedPercent}%</Text>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${selectedPercent}%` }]} />
          </View>
        </View>

        {/* Preset Options */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Chọn mức đặt cọc</Text>
          {DEPOSIT_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.value}
              style={[
                s.presetCard,
                selectedPercent === preset.value && s.presetCardActive,
                selectedPercent === preset.value && { borderColor: preset.color },
              ]}
              onPress={() => setSelectedPercent(preset.value)}
            >
              <View style={s.presetHeader}>
                <View style={[s.radioOuter, selectedPercent === preset.value && { borderColor: preset.color }]}>
                  {selectedPercent === preset.value && (
                    <View style={[s.radioInner, { backgroundColor: preset.color }]} />
                  )}
                </View>
                <View style={[s.presetBadge, { backgroundColor: preset.color + '18' }]}>
                  <Text style={[s.presetBadgeText, { color: preset.color }]}>{preset.label}</Text>
                </View>
                {selectedPercent === preset.value && (
                  <Check size={18} color={preset.color} style={{ marginLeft: 'auto' }} />
                )}
              </View>
              <Text style={s.presetDesc}>{preset.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Note */}
        <View style={s.infoCard}>
          <Info size={16} color="#1D4ED8" />
          <Text style={s.infoText}>
            Mức đặt cọc sẽ được áp dụng cho tất cả các đặt phòng mới. Các đặt phòng hiện tại sẽ không bị ảnh hưởng.
          </Text>
        </View>

        {/* Save Button */}
        <View style={s.actions}>
          <TouchableOpacity
            style={[s.saveBtn, isSaving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Save size={16} color="#FFF" />
                <Text style={s.saveBtnText}>Lưu thay đổi</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: isMobile ? '#FFF' : '#F8FAFC' },
  scroll: { flex: 1 },
  mobileBackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  mobileBackTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  pageHeader: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { color: '#64748B', fontSize: 14, fontWeight: '600' },
  headerCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  headerIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  headerSub: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20 },
  currentValueCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  currentLabel: { fontSize: 13, color: '#64748B', marginBottom: 4 },
  currentValue: { fontSize: 36, fontWeight: '900', color: '#1D4ED8', marginBottom: 12 },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1D4ED8',
    borderRadius: 4,
  },
  section: { marginHorizontal: isMobile ? 16 : 20, marginTop: isMobile ? 20 : 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  presetCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  presetCardActive: {
    backgroundColor: '#FAFFFE',
  },
  presetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  presetBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  presetBadgeText: { fontSize: 13, fontWeight: '700' },
  presetDesc: { fontSize: 13, color: '#64748B', lineHeight: 20, marginLeft: 34 },
  infoCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoText: { flex: 1, fontSize: 12, color: '#1E40AF', lineHeight: 18 },
  actions: { marginHorizontal: isMobile ? 16 : 20, marginTop: isMobile ? 24 : 32 },
  saveBtn: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
