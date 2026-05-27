import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView, Platform } from 'react-native';
import { DataTable } from './DataTable';
import { adminService } from '../../services/admin.service';
import { Edit, Plus, Trash2, X } from 'lucide-react-native';
import { confirmAction } from '../../utils/confirmAction';
import { ModuleAccess } from '../../utils/permissions';
import { getErrorMessage } from '../../utils/errorMessage';
import { useAdminTheme } from '../AdminShell';

const emptyForm = {
  hotelId: '',
  code: '',
  name: '',
  discountValue: '',
  discountType: 'percent',
  discount: '',
  type: 'PERCENTAGE',
  minOrderValue: '',
  maxDiscount: '',
  usageLimit: '100',
  startDate: '',
  endDate: '',
  expiry: '',
  status: 'ACTIVE',
};

const fullAccess: ModuleAccess = { canView: true, canEdit: true, canDelete: true, canApprove: true };

export const VoucherManagement = ({ permissions = fullAccess }: { permissions?: ModuleAccess }) => {
  const { isLight } = useAdminTheme();
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchVouchers = useCallback(async (q: string, p: number) => {
    setLoading(true);
    try {
      const result = await adminService.getVouchers(q, p, 10);
      setVouchers(result.vouchers || []);
      setHotels(result.hotels || []);
      setTotalCount(result.total || 0);
    } catch (error) {
      console.error('Failed to fetch vouchers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers(searchQuery, page);
  }, [fetchVouchers, page, searchQuery]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setPage(1);
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
      hotelId: voucher.hotelId || '',
      code: voucher.code || '',
      name: voucher.name || '',
      discountValue: String(voucher.discountValue ?? voucher.discount ?? ''),
      discountType: voucher.discountType || (voucher.type === 'FIXED' ? 'fixed' : 'percent'),
      discount: String(voucher.discountValue ?? voucher.discount ?? ''),
      type: voucher.discountType === 'fixed' || voucher.type === 'FIXED' ? 'FIXED' : 'PERCENTAGE',
      minOrderValue: voucher.minOrderValue !== null && voucher.minOrderValue !== undefined ? String(voucher.minOrderValue) : '',
      maxDiscount: voucher.maxDiscount !== null && voucher.maxDiscount !== undefined ? String(voucher.maxDiscount) : '',
      usageLimit: String(voucher.usageLimit ?? 100),
      startDate: voucher.startDate ? new Date(voucher.startDate).toISOString().slice(0, 10) : '',
      endDate: voucher.endDate ? new Date(voucher.endDate).toISOString().slice(0, 10) : '',
      expiry: voucher.endDate ? new Date(voucher.endDate).toISOString().slice(0, 10) : '',
      status: voucher.status || (voucher.isActive ? 'ACTIVE' : 'INACTIVE'),
    });
    setIsModalOpen(true);
  };

  const handleSaveVoucher = async () => {
    if (!formData.hotelId || !formData.code || !(formData.discountValue || formData.discount) || !(formData.endDate || formData.expiry)) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mã, mức giảm và ngày hết hạn');
      return;
    }

    const payload = {
      hotelId: formData.hotelId,
      code: formData.code,
      name: formData.name || formData.code,
      discountType: formData.discountType || (formData.type === 'FIXED' ? 'fixed' : 'percent'),
      discountValue: Number(formData.discountValue || formData.discount),
      minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : null,
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
      usageLimit: Number(formData.usageLimit || 100),
      startDate: new Date(formData.startDate || new Date()).toISOString(),
      endDate: new Date(formData.endDate || formData.expiry).toISOString(),
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
      fetchVouchers(searchQuery, page);
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
      fetchVouchers(searchQuery, page);
    } catch {
      Alert.alert('Lỗi', 'Không thể xóa voucher');
    }
  };

  const columns = [
    { key: 'code', label: 'Mã Voucher', render: (val: string) => <Text style={{ color: isLight ? '#0F172A' : '#FFFFFF', fontWeight: 'bold' }}>{val}</Text> },
    { key: 'discount', label: 'Mức giảm', render: (val: any, row: any) => <Text style={{ color: isLight ? '#2563EB' : '#60A5FA' }}>{val}{row.type === 'PERCENTAGE' ? '%' : ' VND'}</Text> },
    { key: 'type', label: 'Loại' },
    { key: 'usageLimit', label: 'Giới hạn' },
    { key: 'usedCount', label: 'Đã dùng' },
    { key: 'expiry', label: 'Hết hạn', render: (val: string) => <Text style={{ color: isLight ? '#64748B' : '#94A3B8' }}>{new Date(val).toLocaleDateString('vi-VN')}</Text> },
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
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Khach san ap dung</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hotelSelector}>
                  {hotels.map((hotel) => (
                    <TouchableOpacity
                      key={hotel.id}
                      style={[styles.hotelChip, formData.hotelId === hotel.id && styles.hotelChipActive]}
                      onPress={() => setFormData({ ...formData, hotelId: hotel.id })}
                    >
                      <Text style={[styles.hotelChipText, formData.hotelId === hotel.id && styles.hotelChipTextActive]}>{hotel.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TextInput
                  style={styles.input}
                  placeholder="Hotel ID"
                  placeholderTextColor="#94A3B8"
                  value={formData.hotelId}
                  onChangeText={(t) => setFormData({ ...formData, hotelId: t })}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mã Voucher</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: CHAOBANMOI"
                  placeholderTextColor="#94A3B8"
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
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={formData.discount}
                    onChangeText={(t) => setFormData({ ...formData, discount: t, discountValue: t })}
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
                  <TouchableOpacity key={type} style={[styles.typeBtn, formData.type === type && styles.typeBtnActive]} onPress={() => setFormData({ ...formData, type, discountType: type === 'FIXED' ? 'fixed' : 'percent' })}>
                    <Text style={[styles.typeBtnText, formData.type === type && styles.typeBtnTextActive]}>
                      {type === 'PERCENTAGE' ? 'Phần trăm (%)' : 'Số tiền cố định'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ngay bat dau (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2026-01-01"
                  placeholderTextColor="#94A3B8"
                  value={formData.startDate}
                  onChangeText={(t) => setFormData({ ...formData, startDate: t })}
                />

                <Text style={styles.label}>Ngày hết hạn (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2026-12-31"
                  placeholderTextColor="#94A3B8"
                  value={formData.expiry}
                  onChangeText={(t) => setFormData({ ...formData, expiry: t, endDate: t })}
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.35)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 560,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: { boxShadow: '0 18px 36px rgba(15, 23, 42, 0.16)' } as any,
    }),
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  form: { gap: 16 },
  inputGroup: { gap: 10, marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569' },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 14,
    color: '#0F172A',
    fontSize: 15,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  } as any,
  row: { flexDirection: 'row', gap: 16 },
  typeSelector: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  hotelSelector: { gap: 8, paddingBottom: 10 },
  hotelChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
  hotelChipActive: { borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  hotelChipText: { color: '#64748B', fontSize: 12, fontWeight: '700' },
  hotelChipTextActive: { color: '#3B82F6' },
  typeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1' },
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
