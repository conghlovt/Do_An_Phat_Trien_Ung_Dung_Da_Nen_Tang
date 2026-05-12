import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useHotels } from '../../src/partner/hooks/useHotels';
import { Header } from '../../src/partner/components/Header';
import { ArrowLeft, ShieldCheck, Clock, Check, Save } from 'lucide-react-native';

const isMobile = Platform.OS !== 'web';

const POLICIES = [
  {
    key: 'flexible',
    label: 'Linh hoạt',
    desc: 'Khách có thể hủy miễn phí trước giờ nhận phòng. Phù hợp để thu hút nhiều khách hơn.',
    color: '#22C55E',
  },
  {
    key: 'moderate',
    label: 'Vừa phải',
    desc: 'Khách hủy miễn phí trước 24 giờ nhận phòng. Cân bằng giữa linh hoạt và bảo vệ đối tác.',
    color: '#F59E0B',
  },
  {
    key: 'strict',
    label: 'Nghiêm ngặt',
    desc: 'Khách hủy miễn phí trước 48 giờ nhận phòng. Bảo vệ doanh thu cho đối tác.',
    color: '#EF4444',
  },
  {
    key: 'non_refundable',
    label: 'Không hoàn tiền',
    desc: 'Không hoàn tiền khi hủy phòng. Giá phòng thường rẻ hơn để bù đắp.',
    color: '#7C3AED',
  },
];

export default function CancellationPolicyPage() {
  const router = useRouter();
  const { hotels, currentHotel, updateHotel, loadHotel } = useHotels(true);
  const hotelId = currentHotel?.id || hotels[0]?.id || '';

  const [selectedPolicy, setSelectedPolicy] = useState('flexible');
  const [cancellationHours, setCancellationHours] = useState('0');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (hotelId && !currentHotel) loadHotel(hotelId);
  }, [hotelId]);

  useEffect(() => {
    if (currentHotel) {
      setSelectedPolicy(currentHotel.cancellationPolicy || 'flexible');
      setCancellationHours(String(currentHotel.cancellationHours || 0));
    }
  }, [currentHotel]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateHotel(hotelId, {
        cancellationPolicy: selectedPolicy,
        cancellationHours: parseInt(cancellationHours) || 0,
      });
      const msg = 'Đã cập nhật chính sách hủy phòng thành công!';
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
          <Text style={s.mobileBackTitle}>Chính sách hủy phòng</Text>
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
            <ShieldCheck size={28} color="#0F766E" />
          </View>
          <Text style={s.headerTitle}>Chính sách hủy phòng</Text>
          <Text style={s.headerSub}>
            Chọn chính sách hủy phòng phù hợp với khách sạn của bạn.
            Chính sách rõ ràng giúp khách yên tâm đặt phòng.
          </Text>
        </View>

        {/* Policy Options */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Chọn chính sách</Text>
          {POLICIES.map((policy) => (
            <TouchableOpacity
              key={policy.key}
              style={[
                s.policyCard,
                selectedPolicy === policy.key && s.policyCardActive,
                selectedPolicy === policy.key && { borderColor: policy.color },
              ]}
              onPress={() => setSelectedPolicy(policy.key)}
            >
              <View style={s.policyHeader}>
                <View style={[s.radioOuter, selectedPolicy === policy.key && { borderColor: policy.color }]}>
                  {selectedPolicy === policy.key && (
                    <View style={[s.radioInner, { backgroundColor: policy.color }]} />
                  )}
                </View>
                <View style={[s.policyBadge, { backgroundColor: policy.color + '18' }]}>
                  <Text style={[s.policyBadgeText, { color: policy.color }]}>{policy.label}</Text>
                </View>
                {selectedPolicy === policy.key && (
                  <Check size={18} color={policy.color} style={{ marginLeft: 'auto' }} />
                )}
              </View>
              <Text style={s.policyDesc}>{policy.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Hours */}
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
                <TextInput
                  style={s.hoursInput}
                  value={cancellationHours}
                  onChangeText={setCancellationHours}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#94A3B8"
                />
                <Text style={s.hoursUnit}>giờ</Text>
              </View>
            </View>
          </View>
        )}

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
    backgroundColor: '#F0FDFA',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCFBF1',
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
  section: { marginHorizontal: isMobile ? 16 : 20, marginTop: isMobile ? 20 : 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  policyCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  policyCardActive: {
    backgroundColor: '#FAFFFE',
  },
  policyHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
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
  policyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  policyBadgeText: { fontSize: 13, fontWeight: '700' },
  policyDesc: { fontSize: 13, color: '#64748B', lineHeight: 20, marginLeft: 34 },
  hoursCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hoursContent: { flex: 1 },
  hoursLabel: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 2 },
  hoursHint: { fontSize: 12, color: '#94A3B8' },
  hoursInputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hoursInput: {
    width: 60,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    color: '#0F172A',
  },
  hoursUnit: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  actions: { marginHorizontal: isMobile ? 16 : 20, marginTop: isMobile ? 24 : 32 },
  saveBtn: {
    backgroundColor: '#0F766E',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
