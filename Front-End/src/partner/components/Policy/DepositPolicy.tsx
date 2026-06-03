import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { hotelService } from '../../services/hotel.service';
import { Hotel } from '../../types/hotel.type';
import { ArrowLeft, Wallet, Check, Save, Info, Hotel as HotelIcon, Plus } from 'lucide-react-native';
import { SuccessModal } from '../shared/SuccessModal';

const isMobile = Platform.OS !== 'web';

const DEPOSIT_PRESETS = [
  { value: 0, label: 'Không cần đặt cọc', desc: 'Khách không cần thanh toán trước. Phù hợp cho khách quen hoặc walk-in.', color: '#22C55E' },
  { value: 30, label: 'Đặt cọc 30%', desc: 'Khách thanh toán 30% khi đặt phòng. Đảm bảo cam kết nhưng vẫn linh hoạt.', color: '#3B82F6' },
  { value: 50, label: 'Đặt cọc 50%', desc: 'Khách thanh toán 50% khi đặt phòng. Cân bằng giữa bảo vệ doanh thu và sự linh hoạt.', color: '#F59E0B' },
  { value: 100, label: 'Thanh toán toàn bộ', desc: 'Khách thanh toán 100% khi đặt phòng. Đảm bảo doanh thu tối đa.', color: '#EF4444' },
];

interface Props { onBack?: () => void; }

export function DepositPolicy({ onBack }: Props) {
  const router = useRouter();
  const [hotelId, setHotelId] = useState('');
  const [currentHotel, setCurrentHotel] = useState<Hotel | null>(null);
  const [selectedPercent, setSelectedPercent] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [noHotel, setNoHotel] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    hotelService.getHotels().then(({ items }) => {
      if (items.length > 0) {
        setHotelId(items[0].id);
        setNoHotel(false);
      } else {
        setNoHotel(true);
      }
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (hotelId) hotelService.getHotel(hotelId).then(setCurrentHotel);
  }, [hotelId]);

  useEffect(() => {
    if (currentHotel) {
      // Prisma Decimal might come as string or number
      setSelectedPercent(Number(currentHotel.depositPercent || 0));
    }
  }, [currentHotel]);

  const handleSave = async () => {
    if (!hotelId) {
      setErrorMsg('Vui lòng tạo khách sạn trước khi cập nhật chính sách.');
      return;
    }
    try {
      setErrorMsg('');
      setIsSaving(true);
      await hotelService.updateHotel(hotelId, { depositPercent: selectedPercent });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onBack?.();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color="#0F766E" /></View>;
  }

  if (noHotel) {
    return (
      <View style={s.container}>
        {isMobile ? (
          <View style={s.mobileBackHeader}>
            <TouchableOpacity style={s.backBtn} onPress={() => onBack?.()}><ArrowLeft size={20} color="#1E293B" /></TouchableOpacity>
            <Text style={s.mobileBackTitle}>Chính sách đặt cọc</Text>
          </View>
        ) : (
          <View style={s.pageHeader}>
            <TouchableOpacity style={s.backBtn} onPress={() => onBack?.()}>
              <ArrowLeft size={18} color="#64748B" /><Text style={s.backText}>Quay lại</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={s.noHotelWrapper}>
          <View style={s.noHotelIconBox}>
            <HotelIcon size={40} color="#0D9488" />
          </View>
          <Text style={s.noHotelTitle}>Bạn chưa có khách sạn nào</Text>
          <Text style={s.noHotelSubtitle}>Hãy tạo khách sạn trước để có thể thiết lập chính sách đặt cọc.</Text>
          <TouchableOpacity style={s.noHotelBtn} onPress={() => router.push('/partner/hotel/new-hotel' as any)}>
            <Plus size={18} color="#FFF" />
            <Text style={s.noHotelBtnText}>Tạo khách sạn ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {isMobile ? (
        <View style={s.mobileBackHeader}>
          <TouchableOpacity style={s.backBtn} onPress={() => onBack?.()}><ArrowLeft size={20} color="#1E293B" /></TouchableOpacity>
          <Text style={s.mobileBackTitle}>Chính sách đặt cọc</Text>
        </View>
      ) : (
        <View style={s.pageHeader}>
          <TouchableOpacity style={s.backBtn} onPress={() => onBack?.()}>
            <ArrowLeft size={18} color="#64748B" /><Text style={s.backText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.headerCard}>
          <View style={s.headerIconWrapper}><Wallet size={28} color="#0F766E" /></View>
          <Text style={s.headerTitle}>Chính sách đặt cọc</Text>
          <Text style={s.headerSub}>Chọn mức đặt cọc phù hợp với khách sạn của bạn. Mức đặt cọc hợp lý giúp giảm tỷ lệ hủy phòng.</Text>
        </View>

        {errorMsg ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <SuccessModal 
          visible={showSuccess} 
          message="Đã cập nhật chính sách đặt cọc thành công!" 
          onClose={() => setShowSuccess(false)} 
        />

        <View style={s.currentValueCard}>
          <Text style={s.currentLabel}>Mức đặt cọc hiện tại</Text>
          <Text style={s.currentValue}>{selectedPercent}%</Text>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${selectedPercent}%` }]} />
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Chọn mức đặt cọc</Text>
          {DEPOSIT_PRESETS.map((preset) => (
            <TouchableOpacity key={preset.value} style={[s.presetCard, selectedPercent === preset.value && s.presetCardActive, selectedPercent === preset.value && { borderColor: preset.color }]} onPress={() => setSelectedPercent(preset.value)}>
              <View style={s.presetHeader}>
                <View style={[s.radioOuter, selectedPercent === preset.value && { borderColor: preset.color }]}>
                  {selectedPercent === preset.value && <View style={[s.radioInner, { backgroundColor: preset.color }]} />}
                </View>
                <View style={[s.presetBadge, { backgroundColor: preset.color + '18' }]}>
                  <Text style={[s.presetBadgeText, { color: preset.color }]}>{preset.label}</Text>
                </View>
                {selectedPercent === preset.value && <Check size={18} color={preset.color} style={{ marginLeft: 'auto' }} />}
              </View>
              <Text style={s.presetDesc}>{preset.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.infoCard}>
          <Info size={16} color="#0F766E" />
          <Text style={s.infoText}>Mức đặt cọc sẽ được áp dụng cho tất cả các đặt phòng mới. Các đặt phòng hiện tại sẽ không bị ảnh hưởng.</Text>
        </View>

        <View style={s.actions}>
          <TouchableOpacity style={[s.saveBtn, isSaving && { opacity: 0.6 }]} onPress={handleSave} disabled={isSaving}>
            {isSaving ? <ActivityIndicator size="small" color="#FFF" /> : <><Save size={16} color="#FFF" /><Text style={s.saveBtnText}>Lưu thay đổi</Text></>}
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
  mobileBackHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  mobileBackTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  pageHeader: { paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { color: '#64748B', fontSize: 14, fontWeight: '600' },
  headerCard: { marginHorizontal: 20, marginTop: 20, backgroundColor: '#F0FDFA', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#CCFBF1' },
  headerIconWrapper: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  headerSub: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20 },
  currentValueCard: { marginHorizontal: 20, marginTop: 20, backgroundColor: '#FFF', borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  currentLabel: { fontSize: 13, color: '#64748B', marginBottom: 4 },
  currentValue: { fontSize: 36, fontWeight: '900', color: '#0F766E', marginBottom: 12 },
  progressBar: { width: '100%', height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#0F766E', borderRadius: 4 },
  section: { marginHorizontal: isMobile ? 16 : 20, marginTop: isMobile ? 20 : 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  presetCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 2, borderColor: '#E2E8F0' },
  presetCardActive: { backgroundColor: '#FAFFFE' },
  presetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  presetBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  presetBadgeText: { fontSize: 13, fontWeight: '700' },
  presetDesc: { fontSize: 13, color: '#64748B', lineHeight: 20, marginLeft: 34 },
  infoCard: { marginHorizontal: 20, marginTop: 20, backgroundColor: '#F0FDFA', borderRadius: 10, padding: 14, flexDirection: 'row', gap: 10, borderWidth: 1, borderColor: '#CCFBF1' },
  infoText: { flex: 1, fontSize: 12, color: '#0F766E', lineHeight: 18 },
  actions: { marginHorizontal: isMobile ? 16 : 20, marginTop: isMobile ? 24 : 32 },
  saveBtn: { backgroundColor: '#0F766E', paddingVertical: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  errorBox: { marginHorizontal: 20, marginTop: 16, backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FECACA' },
  errorText: { color: '#EF4444', fontSize: 14, textAlign: 'center' },
  successBox: { marginHorizontal: 20, marginTop: 16, backgroundColor: '#F0FDFA', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#CCFBF1' },
  successText: { color: '#0D9488', fontSize: 14, textAlign: 'center' },

  // No hotel empty state
  noHotelWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    ...(Platform.OS === 'web' ? { minHeight: '70vh' as any } : {}),
  },
  noHotelIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDFA',
    borderWidth: 2,
    borderColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  noHotelTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  noHotelSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 340,
    marginBottom: 24,
  },
  noHotelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0D9488',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(13,148,136,0.3)' as any },
      default: { shadowColor: '#0D9488', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    }),
  },
  noHotelBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
