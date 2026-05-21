import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { partnerService } from '../../services/partner.service';
import type { Hotel } from '../../services/partner.service';
import { ArrowLeft, ShieldCheck, Clock, Check, Save, Hotel as HotelIcon, Plus } from 'lucide-react-native';
import { SuccessModal } from '../shared/SuccessModal';

const isMobile = Platform.OS !== 'web';

const POLICIES = [
  { key: 'flexible', label: 'Linh hoạt', desc: 'Khách có thể hủy miễn phí trước giờ nhận phòng. Phù hợp để thu hút nhiều khách hơn.', color: '#22C55E' },
  { key: 'moderate', label: 'Vừa phải', desc: 'Khách hủy miễn phí trước 24 giờ nhận phòng. Cân bằng giữa linh hoạt và bảo vệ đối tác.', color: '#F59E0B' },
  { key: 'strict', label: 'Nghiêm ngặt', desc: 'Khách hủy miễn phí trước 48 giờ nhận phòng. Bảo vệ doanh thu cho đối tác.', color: '#EF4444' },
  { key: 'non_refundable', label: 'Không hoàn tiền', desc: 'Không hoàn tiền khi hủy phòng. Giá phòng thường rẻ hơn để bù đắp.', color: '#7C3AED' },
];

interface Props { onBack?: () => void; }

export function CancellationPolicy({ onBack }: Props) {
  const router = useRouter();
  const [hotelId, setHotelId] = useState('');
  const [currentHotel, setCurrentHotel] = useState<Hotel | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState('flexible');
  const [cancellationHours, setCancellationHours] = useState('0');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [noHotel, setNoHotel] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    partnerService.getHotels().then(({ items }) => {
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
    if (hotelId) partnerService.getHotel(hotelId).then(setCurrentHotel);
  }, [hotelId]);

  useEffect(() => {
    if (currentHotel) {
      setSelectedPolicy(currentHotel.cancellationPolicy || 'flexible');
      setCancellationHours(String(currentHotel.cancellationHours || 0));
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
      await partnerService.updateHotel(hotelId, {
        cancellationPolicy: selectedPolicy,
        cancellationHours: parseInt(cancellationHours) || 0,
      });
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
            <Text style={s.mobileBackTitle}>Chính sách hủy phòng</Text>
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
          <Text style={s.noHotelSubtitle}>Hãy tạo khách sạn trước để có thể thiết lập chính sách hủy phòng.</Text>
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
          <Text style={s.mobileBackTitle}>Chính sách hủy phòng</Text>
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
          <View style={s.headerIconWrapper}><ShieldCheck size={28} color="#0F766E" /></View>
          <Text style={s.headerTitle}>Chính sách hủy phòng</Text>
          <Text style={s.headerSub}>Chọn chính sách hủy phòng phù hợp với khách sạn của bạn. Chính sách rõ ràng giúp khách yên tâm đặt phòng.</Text>
        </View>

        {errorMsg ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <SuccessModal 
          visible={showSuccess} 
          message="Đã cập nhật chính sách hủy phòng thành công!" 
          onClose={() => setShowSuccess(false)} 
        />

        <View style={s.section}>
          <Text style={s.sectionTitle}>Chọn chính sách</Text>
          {POLICIES.map((policy) => (
            <TouchableOpacity key={policy.key} style={[s.policyCard, selectedPolicy === policy.key && s.policyCardActive, selectedPolicy === policy.key && { borderColor: policy.color }]} onPress={() => setSelectedPolicy(policy.key)}>
              <View style={s.policyHeader}>
                <View style={[s.radioOuter, selectedPolicy === policy.key && { borderColor: policy.color }]}>
                  {selectedPolicy === policy.key && <View style={[s.radioInner, { backgroundColor: policy.color }]} />}
                </View>
                <View style={[s.policyBadge, { backgroundColor: policy.color + '18' }]}>
                  <Text style={[s.policyBadgeText, { color: policy.color }]}>{policy.label}</Text>
                </View>
                {selectedPolicy === policy.key && <Check size={18} color={policy.color} style={{ marginLeft: 'auto' }} />}
              </View>
              <Text style={s.policyDesc}>{policy.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedPolicy !== 'non_refundable' && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Thời gian hủy miễn phí</Text>
            <View style={s.hoursCard}>
              <Clock size={20} color="#0F766E" />
              <View style={s.hoursContent}>
                <Text style={s.hoursLabel}>Số giờ trước nhận phòng</Text>
                <Text style={s.hoursHint}>Khách có thể hủy miễn phí trước số giờ này</Text>
              </View>
              <View style={s.hoursInputWrapper}>
                <TextInput style={s.hoursInput} value={cancellationHours} onChangeText={setCancellationHours} keyboardType="numeric" placeholder="0" placeholderTextColor="#94A3B8" />
                <Text style={s.hoursUnit}>giờ</Text>
              </View>
            </View>
          </View>
        )}

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
  section: { marginHorizontal: isMobile ? 16 : 20, marginTop: isMobile ? 20 : 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  policyCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 2, borderColor: '#E2E8F0' },
  policyCardActive: { backgroundColor: '#FAFFFE' },
  policyHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  policyBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  policyBadgeText: { fontSize: 13, fontWeight: '700' },
  policyDesc: { fontSize: 13, color: '#64748B', lineHeight: 20, marginLeft: 34 },
  hoursCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  hoursContent: { flex: 1 },
  hoursLabel: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 2 },
  hoursHint: { fontSize: 12, color: '#94A3B8' },
  hoursInputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hoursInput: { width: 60, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16, fontWeight: '700', textAlign: 'center', color: '#0F172A' },
  hoursUnit: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  actions: { marginHorizontal: isMobile ? 16 : 20, marginTop: isMobile ? 24 : 32 },
  saveBtn: { backgroundColor: '#0F766E', paddingVertical: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  errorBox: { marginHorizontal: isMobile ? 16 : 20, marginTop: 16, backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FECACA' },
  errorText: { color: '#EF4444', fontSize: 14, textAlign: 'center' },
  successBox: { marginHorizontal: isMobile ? 16 : 20, marginTop: 16, backgroundColor: '#F0FDFA', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#CCFBF1' },
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
