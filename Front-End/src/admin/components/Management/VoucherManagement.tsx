import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView, Platform } from 'react-native';
import { DataTable } from './DataTable';
import { adminService } from '../../services/admin.service';
import { Edit, Plus, Trash2, X } from 'lucide-react-native';
import { confirmAction } from '../../utils/confirmAction';
import { ModuleAccess } from '../../utils/permissions';
import { getErrorMessage } from '../../utils/errorMessage';
import { useAdminTheme } from '../AdminShell';

type VoucherScope = 'partner' | 'customer';

const emptyForm = {
  hotelId: '',
  code: '',
  name: '',
  discountValue: '',
  discountType: 'percent',
  minOrderValue: '',
  maxDiscount: '',
  usageLimit: '100',
  startDate: '',
  endDate: '',
  status: 'ACTIVE',
};

const fullAccess: ModuleAccess = { canView: true, canEdit: true, canDelete: true, canApprove: true };

const toDateInput = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const formatDate = (value?: string | null) => {
  if (!value) return '---';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '---' : date.toLocaleDateString('vi-VN');
};

const formatDiscount = (voucher: any) => {
  const value = Number(voucher.discountValue ?? voucher.discount ?? 0);
  return voucher.discountType === 'fixed' || voucher.type === 'FIXED'
    ? `${value.toLocaleString('vi-VN')} VND`
    : `${value}%`;
};

export const VoucherManagement = ({ permissions = fullAccess }: { permissions?: ModuleAccess }) => {
  const { isLight } = useAdminTheme();
  const [scope, setScope] = useState<VoucherScope>('partner');
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [hotelFilter, setHotelFilter] = useState('');
  const [exporting, setExporting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);
  const [formData, setFormData] = useState(emptyForm);

  const filteredHotels = useMemo(() => hotels || [], [hotels]);

  const fetchVouchers = useCallback(async (q: string, p: number) => {
    setLoading(true);
    try {
      const result = await adminService.getVouchers({
        scope,
        search: q,
        page: p,
        limit: 10,
        status: statusFilter,
        hotelId: scope === 'partner' ? hotelFilter : '',
      });
      setVouchers(result.vouchers || []);
      setHotels(result.hotels || []);
      setTotalCount(result.pagination?.total ?? result.total ?? 0);
    } catch (error) {
      console.error('Failed to fetch vouchers:', error);
      Alert.alert('Loi', getErrorMessage(error, 'Khong tai duoc danh sach voucher.'));
    } finally {
      setLoading(false);
    }
  }, [hotelFilter, scope, statusFilter]);

  useEffect(() => {
    fetchVouchers(searchQuery, page);
  }, [fetchVouchers, page, searchQuery]);

  const switchScope = (nextScope: VoucherScope) => {
    setScope(nextScope);
    setPage(1);
    setStatusFilter('');
    setHotelFilter('');
    setSearchQuery('');
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setPage(1);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await adminService.downloadExport('vouchers', {
        scope,
        search: searchQuery,
        status: statusFilter,
        hotelId: scope === 'partner' ? hotelFilter : '',
      }, `${scope}-vouchers`);
    } catch (error: any) {
      Alert.alert('Loi', error?.response?.status === 403 ? 'Ban khong co quyen xuat du lieu' : 'Xuat file that bai');
    } finally {
      setExporting(false);
    }
  };

  const openCreateModal = () => {
    setEditingVoucher(null);
    setFormData({
      ...emptyForm,
      hotelId: scope === 'partner' ? hotelFilter : '',
    });
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
      minOrderValue: voucher.minOrderValue !== null && voucher.minOrderValue !== undefined ? String(voucher.minOrderValue) : '',
      maxDiscount: voucher.maxDiscount !== null && voucher.maxDiscount !== undefined ? String(voucher.maxDiscount) : '',
      usageLimit: String(voucher.usageLimit ?? 100),
      startDate: toDateInput(voucher.startDate),
      endDate: toDateInput(voucher.endDate || voucher.expiry),
      status: voucher.status || 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleSaveVoucher = async () => {
    const code = formData.code.trim();
    const name = formData.name.trim();
    const discountValue = Number(formData.discountValue);

    if (!code || !name || !discountValue || discountValue <= 0) {
      Alert.alert('Loi', 'Vui long nhap ma, ten va gia tri giam hop le.');
      return;
    }
    if (formData.discountType === 'percent' && (discountValue < 1 || discountValue > 100)) {
      Alert.alert('Loi', 'Voucher phan tram phai nam trong khoang 1-100.');
      return;
    }
    if (scope === 'partner' && !formData.hotelId) {
      Alert.alert('Loi', 'Voucher Partner phai chon khach san.');
      return;
    }

    const payload = {
      scope,
      hotelId: scope === 'partner' ? formData.hotelId : null,
      code,
      name,
      discountType: formData.discountType,
      discountValue,
      minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : null,
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
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
      fetchVouchers(searchQuery, page);
    } catch (error) {
      Alert.alert('Loi', getErrorMessage(error, 'Khong the luu voucher.'));
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    const confirmed = await confirmAction('Xac nhan', 'Ban co chac muon xoa voucher nay?');
    if (!confirmed) return;

    try {
      await adminService.deleteVoucher(id);
      Alert.alert('Thanh cong', 'Da xoa voucher');
      fetchVouchers(searchQuery, page);
    } catch {
      Alert.alert('Loi', 'Khong the xoa voucher');
    }
  };

  const columns = [
    {
      key: 'code',
      label: 'Ma',
      render: (val: string) => <Text style={{ color: isLight ? '#0F766E' : '#5EEAD4', fontWeight: '800' }}>{val}</Text>,
    },
    { key: 'name', label: 'Ten' },
    {
      key: 'hotel',
      label: 'Khach san',
      render: (_: any, row: any) => <Text style={{ color: isLight ? '#475569' : '#CBD5E1' }}>{row.hotel?.name || 'He thong'}</Text>,
    },
    {
      key: 'discountValue',
      label: 'Giam gia',
      render: (_: any, row: any) => <Text style={{ color: isLight ? '#0F766E' : '#5EEAD4', fontWeight: '700' }}>{formatDiscount(row)}</Text>,
    },
    { key: 'usageLimit', label: 'Gioi han' },
    { key: 'usedCount', label: 'Da dung' },
    { key: 'startDate', label: 'Bat dau', render: (val: string) => <Text style={styles.dateText}>{formatDate(val)}</Text> },
    { key: 'endDate', label: 'Het han', render: (val: string) => <Text style={styles.dateText}>{formatDate(val)}</Text> },
    {
      key: 'status',
      label: 'Trang thai',
      render: (status: string) => (
        <View style={[styles.badge, { backgroundColor: status === 'ACTIVE' ? 'rgba(20, 184, 166, 0.12)' : 'rgba(239, 68, 68, 0.1)' }]}>
          <Text style={[styles.badgeText, { color: status === 'ACTIVE' ? '#0F766E' : '#EF4444' }]}>
            {status}
          </Text>
        </View>
      ),
    },
  ];

  const actions = [
    ...(permissions.canEdit ? [{ label: 'Sua', icon: Edit, color: '#0F766E', onPress: (item: any) => openEditModal(item) }] : []),
    ...(permissions.canDelete ? [{ label: 'Xoa', icon: Trash2, color: '#EF4444', onPress: (item: any) => handleDeleteVoucher(item.id) }] : []),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.tabs}>
          {[
            { key: 'partner', label: 'Voucher Partner' },
            { key: 'customer', label: 'Voucher Customer' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, scope === tab.key && styles.tabActive]}
              onPress={() => switchScope(tab.key as VoucherScope)}
            >
              <Text style={[styles.tabText, scope === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {permissions.canEdit && (
          <TouchableOpacity style={styles.addBtn} onPress={openCreateModal}>
            <Plus size={18} color="#FFF" />
            <Text style={styles.addBtnText}>{scope === 'customer' ? 'Tao voucher customer' : 'Tao voucher partner'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <DataTable
        title={scope === 'customer' ? 'Voucher Customer' : 'Voucher Partner'}
        columns={columns}
        data={vouchers}
        onSearch={handleSearch}
        onExport={permissions.canExport ? () => handleExport() : undefined}
        exporting={exporting}
        filterContent={
          <View style={styles.filterPanel}>
            <View style={styles.filterRow}>
              {['', 'ACTIVE', 'INACTIVE', 'EXPIRED'].map((status) => (
                <TouchableOpacity
                  key={status || 'ALL'}
                  style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
                  onPress={() => {
                    setStatusFilter(status);
                    setPage(1);
                  }}
                >
                  <Text style={[styles.filterChipText, statusFilter === status && styles.filterChipTextActive]}>
                    {status || 'Tat ca trang thai'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {scope === 'partner' && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                <TouchableOpacity
                  style={[styles.filterChip, hotelFilter === '' && styles.filterChipActive]}
                  onPress={() => {
                    setHotelFilter('');
                    setPage(1);
                  }}
                >
                  <Text style={[styles.filterChipText, hotelFilter === '' && styles.filterChipTextActive]}>Tat ca khach san</Text>
                </TouchableOpacity>
                {filteredHotels.map((hotel) => (
                  <TouchableOpacity
                    key={hotel.id}
                    style={[styles.filterChip, hotelFilter === hotel.id && styles.filterChipActive]}
                    onPress={() => {
                      setHotelFilter(hotel.id);
                      setPage(1);
                    }}
                  >
                    <Text style={[styles.filterChipText, hotelFilter === hotel.id && styles.filterChipTextActive]}>{hotel.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        }
        actions={actions}
        serverSide
        loading={loading}
        totalCount={totalCount}
        page={page}
        onPageChange={setPage}
      />

      <Modal visible={isModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingVoucher ? 'Sua voucher' : scope === 'customer' ? 'Tao Voucher Customer' : 'Tao Voucher Partner'}
              </Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
              {scope === 'partner' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Khach san ap dung</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hotelSelector}>
                    {filteredHotels.map((hotel) => (
                      <TouchableOpacity
                        key={hotel.id}
                        style={[styles.hotelChip, formData.hotelId === hotel.id && styles.hotelChipActive]}
                        onPress={() => setFormData({ ...formData, hotelId: hotel.id })}
                      >
                        <Text style={[styles.hotelChipText, formData.hotelId === hotel.id && styles.hotelChipTextActive]}>{hotel.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex]}>
                  <Text style={styles.label}>Ma voucher</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: FLASH30"
                    placeholderTextColor="#94A3B8"
                    value={formData.code}
                    autoCapitalize="characters"
                    onChangeText={(t) => setFormData({ ...formData, code: t.toUpperCase() })}
                  />
                </View>
                <View style={[styles.inputGroup, styles.flex]}>
                  <Text style={styles.label}>Ten voucher</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Uu dai cuoi tuan"
                    placeholderTextColor="#94A3B8"
                    value={formData.name}
                    onChangeText={(t) => setFormData({ ...formData, name: t })}
                  />
                </View>
              </View>

              <View style={styles.typeSelector}>
                {[
                  { key: 'percent', label: 'Phan tram (%)' },
                  { key: 'fixed', label: 'So tien co dinh' },
                ].map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[styles.typeBtn, formData.discountType === type.key && styles.typeBtnActive]}
                    onPress={() => setFormData({ ...formData, discountType: type.key })}
                  >
                    <Text style={[styles.typeBtnText, formData.discountType === type.key && styles.typeBtnTextActive]}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex]}>
                  <Text style={styles.label}>Gia tri giam</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={formData.discountType === 'percent' ? '10' : '100000'}
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={formData.discountValue}
                    onChangeText={(t) => setFormData({ ...formData, discountValue: t })}
                  />
                </View>
                <View style={[styles.inputGroup, styles.flex]}>
                  <Text style={styles.label}>Giam toi da</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Chi ap dung cho %"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={formData.maxDiscount}
                    onChangeText={(t) => setFormData({ ...formData, maxDiscount: t })}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex]}>
                  <Text style={styles.label}>Don toi thieu</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="500000"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={formData.minOrderValue}
                    onChangeText={(t) => setFormData({ ...formData, minOrderValue: t })}
                  />
                </View>
                <View style={[styles.inputGroup, styles.flex]}>
                  <Text style={styles.label}>Gioi han luot dung</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={formData.usageLimit}
                    onChangeText={(t) => setFormData({ ...formData, usageLimit: t })}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex]}>
                  <Text style={styles.label}>Ngay bat dau</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2026-06-01"
                    placeholderTextColor="#94A3B8"
                    value={formData.startDate}
                    onChangeText={(t) => setFormData({ ...formData, startDate: t })}
                  />
                </View>
                <View style={[styles.inputGroup, styles.flex]}>
                  <Text style={styles.label}>Ngay het han</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2026-06-30"
                    placeholderTextColor="#94A3B8"
                    value={formData.endDate}
                    onChangeText={(t) => setFormData({ ...formData, endDate: t })}
                  />
                </View>
              </View>

              <View style={styles.typeSelector}>
                {['ACTIVE', 'INACTIVE', 'EXPIRED'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.typeBtn, formData.status === status && styles.typeBtnActive]}
                    onPress={() => setFormData({ ...formData, status })}
                  >
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
  topBar: { marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  tabs: { flexDirection: 'row', gap: 8, backgroundColor: '#ECFDF5', padding: 4, borderRadius: 10 },
  tab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  tabActive: { backgroundColor: '#0F766E' },
  tabText: { color: '#0F766E', fontWeight: '800', fontSize: 13 },
  tabTextActive: { color: '#FFFFFF' },
  filterPanel: { gap: 10 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
  filterChipActive: { borderColor: '#0F766E', backgroundColor: 'rgba(20, 184, 166, 0.12)' },
  filterChipText: { color: '#64748B', fontSize: 12, fontWeight: '700' },
  filterChipTextActive: { color: '#0F766E' },
  addBtn: {
    backgroundColor: '#0F766E',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    ...Platform.select({
      web: { boxShadow: '0 4px 8px rgba(15, 118, 110, 0.24)' } as any,
      default: {
        shadowColor: '#0F766E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.24,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  dateText: { color: '#64748B', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.35)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 720,
    maxHeight: '92%',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: { boxShadow: '0 18px 36px rgba(15, 23, 42, 0.16)' } as any,
    }),
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  form: { gap: 16 },
  flex: { flex: 1 },
  inputGroup: { gap: 8, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '700', color: '#475569' },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    color: '#0F172A',
    fontSize: 14,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  } as any,
  row: { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  typeSelector: { flexDirection: 'row', gap: 10, marginBottom: 14, flexWrap: 'wrap' },
  hotelSelector: { gap: 8, paddingBottom: 8 },
  hotelChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
  hotelChipActive: { borderColor: '#0F766E', backgroundColor: 'rgba(20, 184, 166, 0.12)' },
  hotelChipText: { color: '#64748B', fontSize: 12, fontWeight: '700' },
  hotelChipTextActive: { color: '#0F766E' },
  typeBtn: { flexGrow: 1, minWidth: 130, paddingVertical: 11, paddingHorizontal: 12, alignItems: 'center', borderRadius: 10, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1' },
  typeBtnActive: { backgroundColor: 'rgba(20, 184, 166, 0.12)', borderColor: '#0F766E' },
  typeBtnText: { fontWeight: '700', color: '#64748B', fontSize: 13 },
  typeBtnTextActive: { color: '#0F766E' },
  submitBtn: {
    backgroundColor: '#0F766E',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  submitBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
