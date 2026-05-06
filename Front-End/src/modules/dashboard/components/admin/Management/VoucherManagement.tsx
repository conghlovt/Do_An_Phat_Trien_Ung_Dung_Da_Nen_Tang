import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView, Platform } from 'react-native';
import { DataTable } from './DataTable';
import { adminService } from '../../../services/admin.service';
import { Edit, Plus, Trash2, X } from 'lucide-react-native';
import { confirmAction } from '../../../utils/confirmAction';
import { ModuleAccess } from '../../../utils/permissions';

const emptyForm = {
  code: '',
  discount: '',
  type: 'PERCENTAGE',
  usageLimit: '100',
  expiry: '',
  status: 'ACTIVE',
};

const fullAccess: ModuleAccess = { canView: true, canEdit: true, canDelete: true, canApprove: true };

export const VoucherManagement = ({ permissions = fullAccess }: { permissions?: ModuleAccess }) => {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getVouchers();
      setVouchers(data || []);
    } catch (error) {
      console.error('Failed to fetch vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const openCreateModal = () => {
    setEditingVoucher(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (voucher: any) => {
    setEditingVoucher(voucher);
    setFormData({
      code: voucher.code || '',
      discount: String(voucher.discount ?? ''),
      type: voucher.type || 'PERCENTAGE',
      usageLimit: String(voucher.usageLimit ?? 100),
      expiry: voucher.expiry ? new Date(voucher.expiry).toISOString().slice(0, 10) : '',
      status: voucher.status || (voucher.isActive ? 'ACTIVE' : 'INACTIVE'),
    });
    setIsModalOpen(true);
  };

  const handleSaveVoucher = async () => {
    if (!formData.code || !formData.discount || !formData.expiry) {
      Alert.alert('Loi', 'Vui long nhap day du ma, muc giam va ngay het han');
      return;
    }

    const payload = {
      code: formData.code,
      discount: Number(formData.discount),
      type: formData.type,
      usageLimit: Number(formData.usageLimit || 100),
      expiry: new Date(formData.expiry).toISOString(),
      status: formData.status,
    };

    try {
      if (editingVoucher) {
        await adminService.updateVoucher(editingVoucher.id, payload);
      } else {
        await adminService.createVoucher(payload);
      }
      Alert.alert('Thanh cong', editingVoucher ? 'Da cap nhat voucher' : 'Da tao voucher moi');
      setIsModalOpen(false);
      fetchVouchers();
    } catch (error: any) {
      Alert.alert('Loi', error.response?.data?.message || error.message || 'Khong the luu voucher');
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    const confirmed = await confirmAction('Xac nhan', 'Ban co chac muon xoa ma nay?');
    if (!confirmed) return;

    try {
      await adminService.deleteVoucher(id);
      Alert.alert('Thanh cong', 'Da xoa voucher');
      fetchVouchers();
    } catch {
      Alert.alert('Loi', 'Khong the xoa voucher');
    }
  };

  const columns = [
    { key: 'code', label: 'Ma Voucher', render: (val: string) => <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{val}</Text> },
    { key: 'discount', label: 'Muc giam', render: (val: any, row: any) => <Text style={{ color: '#60A5FA' }}>{val}{row.type === 'PERCENTAGE' ? '%' : ' VND'}</Text> },
    { key: 'type', label: 'Loai' },
    { key: 'usageLimit', label: 'Gioi han' },
    { key: 'usedCount', label: 'Da dung' },
    { key: 'expiry', label: 'Het han', render: (val: string) => <Text style={{ color: '#94A3B8' }}>{new Date(val).toLocaleDateString('vi-VN')}</Text> },
    {
      key: 'status',
      label: 'Trang thai',
      render: (status: string) => (
        <View style={[styles.badge, { backgroundColor: status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
          <Text style={[styles.badgeText, { color: status === 'ACTIVE' ? '#10B981' : '#EF4444' }]}>{status}</Text>
        </View>
      ),
    },
  ];

  const actions = [
    ...(permissions.canEdit ? [{ label: 'Sua', icon: Edit, color: '#3B82F6', onPress: (item: any) => openEditModal(item) }] : []),
    ...(permissions.canDelete ? [{ label: 'Xoa', icon: Trash2, color: '#EF4444', onPress: (item: any) => handleDeleteVoucher(item.id) }] : []),
  ];

  if (loading) return <View style={styles.container}><Text style={{ color: '#FFF' }}>Dang tai voucher...</Text></View>;

  return (
    <View style={styles.container}>
      {permissions.canEdit && (
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.addBtn} onPress={openCreateModal}>
            <Plus size={18} color="#FFF" />
            <Text style={styles.addBtnText}>Tao Voucher moi</Text>
          </TouchableOpacity>
        </View>
      )}

      <DataTable title="Quan ly ma giam gia (Voucher)" columns={columns} data={vouchers} onSearch={() => {}} actions={actions} />

      <Modal visible={isModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingVoucher ? 'Sua Voucher' : 'Tao Voucher moi'}</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ma Voucher</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: CHAOBANMOI"
                  placeholderTextColor="#475569"
                  value={formData.code}
                  autoCapitalize="characters"
                  onChangeText={(t) => setFormData({ ...formData, code: t })}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Muc giam</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: 10"
                    placeholderTextColor="#475569"
                    keyboardType="numeric"
                    value={formData.discount}
                    onChangeText={(t) => setFormData({ ...formData, discount: t })}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Gioi han</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={formData.usageLimit}
                    onChangeText={(t) => setFormData({ ...formData, usageLimit: t })}
                  />
                </View>
              </View>

              <View style={styles.typeSelector}>
                {['PERCENTAGE', 'FIXED'].map((type) => (
                  <TouchableOpacity key={type} style={[styles.typeBtn, formData.type === type && styles.typeBtnActive]} onPress={() => setFormData({ ...formData, type })}>
                    <Text style={[styles.typeBtnText, formData.type === type && styles.typeBtnTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ngay het han (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2026-12-31"
                  placeholderTextColor="#475569"
                  value={formData.expiry}
                  onChangeText={(t) => setFormData({ ...formData, expiry: t })}
                />
              </View>

              <View style={styles.typeSelector}>
                {['ACTIVE', 'INACTIVE'].map((status) => (
                  <TouchableOpacity key={status} style={[styles.typeBtn, formData.status === status && styles.typeBtnActive]} onPress={() => setFormData({ ...formData, status })}>
                    <Text style={[styles.typeBtnText, formData.status === status && styles.typeBtnTextActive]}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSaveVoucher}>
                <Text style={styles.submitBtnText}>Luu Voucher</Text>
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
    ...Platform.select({
      web: { boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)' } as any,
      default: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: {
    backgroundColor: '#1E293B',
    width: '100%',
    maxWidth: 560,
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
      web: { outlineStyle: 'none' } as any,
    }),
  } as any,
  row: { flexDirection: 'row', gap: 16 },
  typeSelector: { flexDirection: 'row', gap: 10, marginBottom: 15 },
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
  },
  submitBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
