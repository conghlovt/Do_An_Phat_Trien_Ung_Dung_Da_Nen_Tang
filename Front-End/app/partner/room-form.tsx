import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRooms } from '../../src/partner/hooks/useRooms';
import { Header } from '../../src/partner/components/Header';
import { ArrowLeft, BedDouble } from 'lucide-react-native';

const isMobile = Platform.OS !== 'web';

export default function RoomFormPage() {
  const router = useRouter();
  const { hotelId } = useLocalSearchParams<{ hotelId: string }>();
  const { createRoomType, isLoading } = useRooms(hotelId || '');

  const [form, setForm] = useState({
    name: '', description: '', maxGuests: '2', bedType: 'double', roomSizeSqm: '', totalUnits: '1',
  });

  const updateField = (key: string, value: string) => setForm({ ...form, [key]: value });

  const handleSubmit = async () => {
    try {
      await createRoomType({
        name: form.name,
        description: form.description,
        maxGuests: parseInt(form.maxGuests) || 2,
        bedType: form.bedType,
        roomSizeSqm: form.roomSizeSqm ? parseInt(form.roomSizeSqm) : undefined,
        totalUnits: parseInt(form.totalUnits) || 1,
      });
      router.back();
    } catch (err: any) {
      if (Platform.OS === 'web') alert(err.message);
      else Alert.alert('Lỗi', err.message);
    }
  };

  return (
    <View style={s.container}>
      {isMobile ? (
        <View style={s.mobileBackHeader}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <ArrowLeft size={20} color="#1E293B" />
          </TouchableOpacity>
          <Text style={s.mobileBackTitle}>Thêm loại phòng mới</Text>
        </View>
      ) : null}
      <ScrollView style={s.scroll}>
        {!isMobile && <View style={s.pageHeader}><Text style={s.pageTitle}>Thêm loại phòng mới</Text></View>}
        <View style={s.formSection}>
          <View style={s.field}>
            <Text style={s.label}>Tên loại phòng *</Text>
            <TextInput style={s.input} value={form.name} onChangeText={(v) => updateField('name', v)} placeholder="VD: Phòng Standard, Phòng Deluxe" placeholderTextColor="#94A3B8" />
          </View>
          <View style={s.field}>
            <Text style={s.label}>Mô tả</Text>
            <TextInput style={[s.input, s.textarea]} value={form.description} onChangeText={(v) => updateField('description', v)} placeholder="Mô tả loại phòng" placeholderTextColor="#94A3B8" multiline />
          </View>
          <View style={s.row}>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>Sức chứa (người)</Text>
              <TextInput style={s.input} value={form.maxGuests} onChangeText={(v) => updateField('maxGuests', v)} keyboardType="numeric" placeholderTextColor="#94A3B8" />
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>Loại giường</Text>
              <TextInput style={s.input} value={form.bedType} onChangeText={(v) => updateField('bedType', v)} placeholder="double, twin..." placeholderTextColor="#94A3B8" />
            </View>
          </View>
          <View style={s.row}>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>Diện tích (m²)</Text>
              <TextInput style={s.input} value={form.roomSizeSqm} onChangeText={(v) => updateField('roomSizeSqm', v)} keyboardType="numeric" placeholder="25" placeholderTextColor="#94A3B8" />
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>Số phòng</Text>
              <TextInput style={s.input} value={form.totalUnits} onChangeText={(v) => updateField('totalUnits', v)} keyboardType="numeric" placeholderTextColor="#94A3B8" />
            </View>
          </View>
        </View>
        <View style={s.actions}>
          <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()}><Text style={s.cancelText}>Hủy</Text></TouchableOpacity>
          <TouchableOpacity style={[s.submitBtn, isLoading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={isLoading}>
            <Text style={s.submitText}>{isLoading ? 'Đang tạo...' : 'Tạo loại phòng'}</Text>
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
  pageHeader: { paddingHorizontal: 24, paddingVertical: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  pageTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  formSection: {
    marginHorizontal: isMobile ? 16 : 20,
    marginTop: isMobile ? 16 : 20,
    backgroundColor: '#FFF',
    borderRadius: isMobile ? 16 : 14,
    padding: isMobile ? 16 : 20,
    borderWidth: isMobile ? 0 : 1,
    borderColor: '#E2E8F0',
    ...(isMobile ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 } : {}),
  },
  field: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#1E293B' },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: isMobile ? 'column' : 'row', gap: 12 },
  actions: { flexDirection: 'row', gap: 12, marginHorizontal: isMobile ? 16 : 20, marginTop: isMobile ? 20 : 24 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center' },
  cancelText: { color: '#64748B', fontSize: 14, fontWeight: '700' },
  submitBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: '#0D9488', alignItems: 'center' },
  submitText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
