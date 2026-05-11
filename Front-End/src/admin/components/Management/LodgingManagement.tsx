import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Modal, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { DataTable } from './DataTable';
import { adminService } from '../../services/admin.service';
import { CheckCircle, Trash2, XCircle, Edit, X } from 'lucide-react-native';
import { confirmAction } from '../../utils/confirmAction';
import { getErrorMessage } from '../../utils/errorMessage';
import { ModuleAccess } from '../../utils/permissions';
import { useAdminTheme } from '../AdminShell';

const fullAccess: ModuleAccess = { canView: true, canEdit: true, canDelete: true, canApprove: true };

export const LodgingManagement = ({ permissions = fullAccess }: { permissions?: ModuleAccess }) => {
  const { isLight } = useAdminTheme();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', address: '', type: 'Hotel', status: 'PENDING' });

  const fetchProperties = async (q?: string) => {
    setLoading(true);
    try {
      const data = await adminService.getProperties(q);
      setProperties(data || []);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (q: string) => {
    fetchProperties(q);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const openEditModal = (property: any) => {
    setEditingProperty(property);
    setFormData({
      name: property.name || '',
      address: property.address || '',
      type: property.type || 'Hotel',
      status: property.status || 'PENDING',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.address) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên và địa chỉ');
      return;
    }
    try {
      await adminService.updateProperty(editingProperty.id, formData);
      Alert.alert('Thành công', 'Đã cập nhật thông tin cơ sở lưu trú');
      setIsModalOpen(false);
      fetchProperties();
    } catch (error) {
      Alert.alert('Lỗi', getErrorMessage(error, 'Không thể cập nhật thông tin.'));
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminService.updatePropertyStatus(id, status);
      Alert.alert('Thành công', `Đã chuyển trạng thái sang ${status === 'ACTIVE' ? 'Hoạt động' : 'Tạm ngưng'}`);
      fetchProperties();
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmAction('Xác nhận', 'Bạn có chắc muốn xóa cơ sở lưu trú này?');
    if (!confirmed) return;

    try {
      await adminService.deleteProperty(id);
      Alert.alert('Thành công', 'Đã xóa cơ sở lưu trú');
      fetchProperties();
    } catch {
      Alert.alert('Lỗi', 'Không thể xóa cơ sở lưu trú');
    }
  };

  const columns = [
    { key: 'name', label: 'Tên cơ sở', render: (val: string) => <Text style={{ color: isLight ? '#0F172A' : '#FFFFFF', fontWeight: 'bold' }}>{val}</Text> },
    { key: 'address', label: 'Địa chỉ', render: (val: string) => <Text style={{ color: isLight ? '#64748B' : '#94A3B8', fontSize: 13 }} numberOfLines={1}>{val}</Text> },
    { key: 'type', label: 'Loại', render: (val: string) => <Text style={{ color: isLight ? '#2563EB' : '#60A5FA' }}>{val}</Text> },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (status: string) => {
        let color = '#10B981';
        let bgColor = 'rgba(16, 185, 129, 0.1)';

        if (status === 'INACTIVE') {
          color = '#EF4444';
          bgColor = 'rgba(239, 68, 68, 0.1)';
        } else if (status === 'PENDING') {
          color = '#F59E0B';
          bgColor = 'rgba(245, 158, 11, 0.1)';
        }

        return (
          <View style={[styles.badge, { backgroundColor: bgColor }]}>
            <Text style={[styles.badgeText, { color }]}>
              {status === 'ACTIVE' ? 'Hoạt động' : status === 'INACTIVE' ? 'Tạm ngưng' : 'Chờ duyệt'}
            </Text>
          </View>
        );
      },
    },
    { key: 'owner', label: 'Chủ sở hữu', render: (val: any) => <Text style={{ color: isLight ? '#334155' : '#CBD5E1' }}>{val?.username || 'N/A'}</Text> },
  ];

  const actions = [
    ...(permissions.canEdit ? [{ label: 'Sửa', icon: Edit, color: '#3B82F6', onPress: (item: any) => openEditModal(item) }] : []),
    ...(permissions.canApprove || permissions.canEdit
      ? [
          { label: 'Kích hoạt', icon: CheckCircle, color: '#10B981', onPress: (item: any) => handleUpdateStatus(item.id, 'ACTIVE') },
          { label: 'Tạm ngưng', icon: XCircle, color: '#F59E0B', onPress: (item: any) => handleUpdateStatus(item.id, 'INACTIVE') },
        ]
      : []),
    ...(permissions.canDelete ? [{ label: 'Xóa', icon: Trash2, color: '#EF4444', onPress: (item: any) => handleDelete(item.id) }] : []),
  ];

  if (loading) return <View style={styles.container}><Text style={{ color: isLight ? '#0F172A' : '#FFFFFF' }}>Đang tải dữ liệu lưu trú...</Text></View>;

  return (
    <View style={styles.container}>
      <DataTable title="Quản lý cơ sở lưu trú" columns={columns} data={properties} onSearch={handleSearch} actions={actions} />

      <Modal visible={isModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sửa thông tin cơ sở</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Tên cơ sở lưu trú</Text>
              <TextInput style={styles.input} value={formData.name} onChangeText={(t) => setFormData({ ...formData, name: t })} />

              <Text style={styles.label}>Địa chỉ chi tiết</Text>
              <TextInput style={styles.input} value={formData.address} onChangeText={(t) => setFormData({ ...formData, address: t })} />

              <Text style={styles.label}>Loại hình</Text>
              <View style={styles.typeRow}>
                {['Hotel', 'Homestay', 'Resort', 'Villa'].map((type) => (
                  <TouchableOpacity key={type} style={[styles.typeBtn, formData.type === type && styles.typeBtnActive]} onPress={() => setFormData({ ...formData, type })}>
                    <Text style={[styles.typeBtnText, formData.type === type && styles.typeBtnTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
                <Text style={styles.submitBtnText}>Lưu thay đổi</Text>
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
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.35)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', width: '100%', maxWidth: 520, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#E2E8F0', ...Platform.select({ web: { boxShadow: '0 18px 36px rgba(15, 23, 42, 0.16)' } as any }) },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 14,
    color: '#0F172A',
    fontSize: 15,
    marginBottom: 16,
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  } as any,
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  typeBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1' },
  typeBtnActive: { borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  typeBtnText: { color: '#64748B', fontWeight: '700', fontSize: 12 },
  typeBtnTextActive: { color: '#3B82F6' },
  submitBtn: { backgroundColor: '#3B82F6', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
