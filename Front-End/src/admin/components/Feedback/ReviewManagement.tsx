import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { DataTable } from '../Management/DataTable';
import { Star, Edit, Trash2, CheckCircle, X } from 'lucide-react-native';
import { adminService } from '../../services/admin.service';
import { confirmAction } from '../../utils/confirmAction';
import { ModuleAccess } from '../../utils/permissions';
import { getErrorMessage } from '../../utils/errorMessage';
import { useAdminTheme } from '../AdminShell';

const fullAccess: ModuleAccess = { canView: true, canEdit: true, canDelete: true, canApprove: true };

export const ReviewManagement = ({ permissions = fullAccess }: { permissions?: ModuleAccess }) => {
  const { isLight } = useAdminTheme();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [formData, setFormData] = useState({ rating: '5', comment: '', status: 'APPROVED', reply: '' });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await adminService.getReviews();
      setReviews(data || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openEditModal = (review: any) => {
    setEditingReview(review);
    setFormData({
      rating: String(review.rating || 5),
      comment: review.comment || '',
      status: review.status || 'APPROVED',
      reply: review.reply || '',
    });
  };

  const handleSave = async () => {
    if (!editingReview) return;
    try {
      await adminService.updateReview(editingReview.id, {
        rating: Number(formData.rating),
        comment: formData.comment,
        status: formData.status,
        reply: formData.reply,
      });
      Alert.alert('Thành công', 'Đã cập nhật đánh giá');
      setEditingReview(null);
      fetchReviews();
    } catch (error) {
      Alert.alert('Lỗi', getErrorMessage(error, 'Không thể cập nhật đánh giá.'));
    }
  };

  const handleApprove = async (review: any) => {
    try {
      await adminService.updateReview(review.id, { status: 'APPROVED' });
      fetchReviews();
    } catch {
      Alert.alert('Lỗi', 'Không thể duyệt đánh giá');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmAction('Xác nhận', 'Bạn có chắc muốn xóa đánh giá này?');
    if (!confirmed) return;

    try {
      await adminService.deleteReview(id);
      Alert.alert('Thành công', 'Đã xóa đánh giá');
      fetchReviews();
    } catch {
      Alert.alert('Lỗi', 'Không thể xóa đánh giá');
    }
  };

  const columns = [
    { key: 'guest', label: 'Khách hàng' },
    { key: 'property', label: 'Cơ sở' },
    {
      key: 'rating',
      label: 'Đánh giá',
      render: (rating: number) => (
        <View style={{ flexDirection: 'row', gap: 2 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={14} color={s <= rating ? '#F59E0B' : '#E2E8F0'} fill={s <= rating ? '#F59E0B' : 'transparent'} />
          ))}
        </View>
      ),
    },
    { key: 'comment', label: 'Nội dung' },
    { 
      key: 'status', 
      label: 'Trạng thái',
      render: (status: string) => (
        <View style={[styles.statusBtn, { backgroundColor: status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', height: 30, paddingVertical: 0 }]}>
           <Text style={{ color: status === 'APPROVED' ? '#10B981' : '#EF4444', fontSize: 11, fontWeight: '700' }}>
            {status === 'APPROVED' ? 'Đã duyệt' : status === 'PENDING' ? 'Chờ duyệt' : 'Đã ẩn'}
           </Text>
        </View>
      )
    },
    { key: 'date', label: 'Ngày gửi', render: (date: string) => <Text style={{ color: isLight ? '#64748B' : '#94A3B8' }}>{new Date(date).toLocaleDateString('vi-VN')}</Text> },
  ];

  const actions = [
    ...(permissions.canApprove ? [{ label: 'Duyệt', icon: CheckCircle, color: '#10B981', onPress: (item: any) => handleApprove(item) }] : []),
    ...(permissions.canEdit ? [{ label: 'Sửa', icon: Edit, color: '#3B82F6', onPress: (item: any) => openEditModal(item) }] : []),
    ...(permissions.canDelete ? [{ label: 'Xóa', icon: Trash2, color: '#EF4444', onPress: (item: any) => handleDelete(item.id) }] : []),
  ];

  if (loading) return <View style={styles.container}><Text style={{ color: isLight ? '#0F172A' : '#FFFFFF' }}>Đang tải đánh giá...</Text></View>;

  return (
    <View style={styles.container}>
      <DataTable title="Quản lý đánh giá từ khách hàng" columns={columns} data={reviews} onSearch={() => {}} actions={actions} />

      <Modal visible={!!editingReview} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sửa đánh giá</Text>
              <TouchableOpacity onPress={() => setEditingReview(null)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Số sao</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={formData.rating} onChangeText={(rating) => setFormData({ ...formData, rating })} />

            <Text style={styles.label}>Nội dung đánh giá</Text>
            <TextInput style={[styles.input, styles.textArea, { minHeight: 80 }]} multiline value={formData.comment} onChangeText={(comment) => setFormData({ ...formData, comment })} />

            <Text style={styles.label}>Phản hồi từ Admin</Text>
            <TextInput style={[styles.input, styles.textArea, { minHeight: 80 }]} multiline placeholder="Nhập lời cảm ơn hoặc giải đáp..." placeholderTextColor="#94A3B8" value={formData.reply} onChangeText={(reply) => setFormData({ ...formData, reply })} />

            <View style={styles.statusRow}>
              {['PENDING', 'APPROVED', 'HIDDEN'].map((status) => (
                <TouchableOpacity key={status} style={[styles.statusBtn, formData.status === status && styles.statusBtnActive]} onPress={() => setFormData({ ...formData, status })}>
                  <Text style={[styles.statusBtnText, formData.status === status && styles.statusBtnTextActive]}>
                    {status === 'PENDING' ? 'Chờ duyệt' : status === 'APPROVED' ? 'Đã duyệt' : 'Đã ẩn'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
              <Text style={styles.submitBtnText}>Lưu đánh giá</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  textArea: { minHeight: 110, textAlignVertical: 'top' },
  statusRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statusBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1' },
  statusBtnActive: { borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  statusBtnText: { color: '#64748B', fontWeight: '700', fontSize: 12 },
  statusBtnTextActive: { color: '#3B82F6' },
  submitBtn: { backgroundColor: '#3B82F6', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
