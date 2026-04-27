import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView, Platform } from 'react-native';
import { DataTable } from './DataTable';
import { adminService } from '../../../services/admin.service';
import { Ticket, Plus, Power, Trash2, X } from 'lucide-react-native';

export const VoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    type: 'PERCENTAGE',
    usageLimit: '100',
    endDate: ''
  });

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getVouchers();
      setVouchers(data);
    } catch (error) {
      console.error('Failed to fetch vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleCreateVoucher = async () => {
    try {
      await adminService.createVoucher({
        ...formData,
        discount: parseFloat(formData.discount),
        usageLimit: parseInt(formData.usageLimit),
        endDate: new Date(formData.endDate).toISOString(),
      });
      Alert.alert('Thành công', 'Đã tạo Voucher mới');
      setIsModalOpen(false);
      fetchVouchers();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tạo Voucher');
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa mã này?', [
      { text: 'Hủy' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
        try {
          await adminService.deleteVoucher(id);
          fetchVouchers();
        } catch (error) {
          Alert.alert('Lỗi', 'Không thể xóa voucher');
        }
      }}
    ]);
  };

  const columns = [
    { key: 'code', label: 'Mã Voucher', render: (val: string) => <Text style={{color: '#FFF', fontWeight: 'bold'}}>{val}</Text> },
    { key: 'discount', label: 'Mức giảm', render: (val: any, row: any) => <Text style={{color: '#60A5FA'}}>{val}{row.type === 'PERCENTAGE' ? '%' : ' VNĐ'}</Text> },
    { key: 'type', label: 'Loại' },
    { key: 'usageLimit', label: 'Giới hạn' },
    { key: 'usedCount', label: 'Đã dùng' },
    { 
      key: 'status', 
      label: 'Trạng thái',
      render: (status: string) => (
        <View style={[styles.badge, { backgroundColor: status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
          <Text style={[styles.badgeText, { color: status === 'ACTIVE' ? '#10B981' : '#EF4444' }]}>{status}</Text>
        </View>
      )
    },
  ];

  const actions = [
    { label: 'Xóa', icon: Trash2, color: '#EF4444', onPress: (item: any) => handleDeleteVoucher(item.id) },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.addBtn} onPress={() => setIsModalOpen(true)}>
          <Plus size={18} color="#FFF" />
          <Text style={styles.addBtnText}>Tạo Voucher mới</Text>
        </TouchableOpacity>
      </View>
      
      <DataTable 
        title="Quản lý mã giảm giá (Voucher)"
        columns={columns}
        data={vouchers}
        onSearch={(q) => console.log('Search voucher', q)}
        actions={actions}
      />

      <Modal visible={isModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo Voucher mới</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mã Voucher</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Vd: CHAOBANMOI" 
                  placeholderTextColor="#475569"
                  value={formData.code} 
                  autoCapitalize="characters"
                  onChangeText={(t) => setFormData({...formData, code: t})} 
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Mức giảm</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Vd: 10" 
                    placeholderTextColor="#475569"
                    keyboardType="numeric" 
                    value={formData.discount} 
                    onChangeText={(t) => setFormData({...formData, discount: t})} 
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Loại</Text>
                  <View style={styles.typeSelector}>
                    <TouchableOpacity style={[styles.typeBtn, formData.type === 'PERCENTAGE' && styles.typeBtnActive]} onPress={() => setFormData({...formData, type: 'PERCENTAGE'})}>
                      <Text style={[styles.typeBtnText, formData.type === 'PERCENTAGE' && styles.typeBtnTextActive]}>%</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.typeBtn, formData.type === 'FIXED' && styles.typeBtnActive]} onPress={() => setFormData({...formData, type: 'FIXED'})}>
                      <Text style={[styles.typeBtnText, formData.type === 'FIXED' && styles.typeBtnTextActive]}>VNĐ</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ngày hết hạn (YYYY-MM-DD)</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="2024-12-31" 
                  placeholderTextColor="#475569"
                  value={formData.endDate} 
                  onChangeText={(t) => setFormData({...formData, endDate: t})} 
                />
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateVoucher}>
                <Text style={styles.submitBtnText}>Xác nhận tạo Voucher</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { marginBottom: 20, alignItems: 'flex-end' },
  addBtn: { 
    backgroundColor: '#3B82F6', 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { 
    backgroundColor: '#1E293B', 
    width: '100%', 
    maxWidth: 500, 
    borderRadius: 24, 
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#334155', paddingBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  form: { gap: 16 },
  inputGroup: { gap: 10, marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', color: '#94A3B8' },
  input: { 
    backgroundColor: '#0F172A', 
    borderWidth: 1, 
    borderColor: '#334155', 
    borderRadius: 12, 
    padding: 14, 
    color: '#FFF',
    fontSize: 15,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any
    })
  } as any,
  row: { flexDirection: 'row', gap: 16 },
  typeSelector: { flexDirection: 'row', gap: 10 },
  typeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155' },
  typeBtnActive: { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: '#3B82F6' },
  typeBtnText: { fontWeight: '600', color: '#64748B' },
  typeBtnTextActive: { color: '#3B82F6' },
  submitBtn: { 
    backgroundColor: '#3B82F6', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
