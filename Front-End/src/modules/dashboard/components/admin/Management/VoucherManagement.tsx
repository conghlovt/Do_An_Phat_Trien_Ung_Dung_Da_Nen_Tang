import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView, Platform } from 'react-native';
import { DataTable } from './DataTable';
import { adminService } from '../../../services/admin.service';
import { Edit, Plus, Trash2, X } from 'lucide-react-native';
import { confirmAction } from '../../../utils/confirmAction';
import { ModuleAccess } from '../../../utils/permissions';
import { getErrorMessage } from '../../../utils/errorMessage';

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
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchVouchers = async (q = searchQuery, p = page) => {
    setLoading(true);
    try {
      const result = await adminService.getVouchers(q, p, 10);
      setVouchers(result.vouchers || []);
      setTotalCount(result.total || 0);
    } catch (error) {
      console.error('Failed to fetch vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers(searchQuery, page);
  }, [page]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setPage(1);
    fetchVouchers(q, 1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
  };

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
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mã, mức giảm và ngày hết hạn');
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
      Alert.alert('Thành công', editingVoucher ? 'Đã cập nhật voucher' : 'Đã tạo voucher mới');
      setIsModalOpen(false);
      fetchVouchers();
    } catch (error) {
      Alert.alert('Lỗi', getErrorMessage(error, 'Không thể lưu voucher.'));
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    const confirmed = await confirmAction('Xác nhận', 'Bạn có chắc muốn xóa mã này?');
    if (!confirmed) return;

    try {
      await adminService.deleteVoucher(id);
      Alert.alert('Thành công', 'Đã xóa voucher');
      fetchVouchers();
    } catch {
      Alert.alert('Lỗi', 'Không thể xóa voucher');
    }
  };

  const columns = [
    { key: 'code', label: 'Mã Voucher', render: (val: string) => <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{val}</Text> },
    { key: 'discount', label: 'Mức giảm', render: (val: any, row: any) => <Text style={{ color: '#60A5FA' }}>{val}{row.type === 'PERCENTAGE' ? '%' : ' VND'}</Text> },
    { key: 'type', label: 'Loại' },
    { key: 'usageLimit', label: 'Giới hạn' },
    { key: 'usedCount', label: 'Đã dùng' },
    { key: 'expiry', label: 'Hết hạn', render: (val: string) => <Text style={{ color: '#94A3B8' }}>{new Date(val).toLocaleDateString('vi-VN')}</Text> },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (status: string) => (
        <View style={[styles.badge, { backgroundColor: status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
          <Text style={[styles.badgeText, { color: status === 'ACTIVE' ? '#10B981' : '#EF4444' }]}>
            {status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động'}
          </Text>
        </View>
      ),
    },
  ];

  const actions = [
    ...(permissions.canEdit ? [{ label: 'Sửa', icon: Edit, color: '#3B82F6', onPress: (item: any) => openEditModal(item) }] : []),
    ...(permissions.canDelete ? [{ label: 'Xóa', icon: Trash2, color: '#EF4444', onPress: (item: any) => handleDeleteVoucher(item.id) }] : []),
  ];


  return (
    <View style={styles.container}>
      {permissions.canEdit && (
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.addBtn} onPress={openCreateModal}>
            <Plus size={18} color="#FFF" />
            <Text style={styles.addBtnText}>Tạo Voucher mới</Text>
          </TouchableOpacity>
        </View>
      )}

      <DataTable 
        title="Quản lý mã giảm giá (Voucher)" 
        columns={columns} 
        data={vouchers} 
        onSearch={handleSearch} 
        actions={actions} 
        serverSide
        loading={loading}
        totalCount={totalCount}
        page={page}
        onPageChange={handlePageChange}
      />

      <Modal visible={isModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingVoucher ? 'Sửa Voucher' : 'Tạo Voucher mới'}</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mã Voucher</Text>
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
                  <Text style={styles.label}>Mức giảm</Text>
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
                  <Text style={styles.label}>Giới hạn</Text>
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
                    <Text style={[styles.typeBtnText, formData.type === type && styles.typeBtnTextActive]}>
                      {type === 'PERCENTAGE' ? 'Phần trăm (%)' : 'Số tiền cố định'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ngày hết hạn (YYYY-MM-DD)</Text>
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
                    <Text style={[styles.typeBtnText, formData.status === status && styles.typeBtnTextActive]}>
                      {status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSaveVoucher}>
                <Text style={styles.submitBtnText}>Lưu Voucher</Text>
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
