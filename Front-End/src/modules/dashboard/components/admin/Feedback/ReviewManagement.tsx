import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { DataTable } from '../Management/DataTable';
import { Star, Edit, Trash2, CheckCircle, X } from 'lucide-react-native';
import { adminService } from '../../../services/admin.service';
import { confirmAction } from '../../../utils/confirmAction';
import { ModuleAccess } from '../../../utils/permissions';

const fullAccess: ModuleAccess = { canView: true, canEdit: true, canDelete: true, canApprove: true };

export const ReviewManagement = ({ permissions = fullAccess }: { permissions?: ModuleAccess }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [formData, setFormData] = useState({ rating: '5', comment: '', status: 'APPROVED' });

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
    });
  };

  const handleSave = async () => {
    if (!editingReview) return;
    try {
      await adminService.updateReview(editingReview.id, {
        rating: Number(formData.rating),
        comment: formData.comment,
        status: formData.status,
      });
      Alert.alert('Thanh cong', 'Da cap nhat danh gia');
      setEditingReview(null);
      fetchReviews();
    } catch (error: any) {
      Alert.alert('Loi', error.response?.data?.message || 'Khong the cap nhat danh gia');
    }
  };

  const handleApprove = async (review: any) => {
    try {
      await adminService.updateReview(review.id, { status: 'APPROVED' });
      fetchReviews();
    } catch {
      Alert.alert('Loi', 'Khong the duyet danh gia');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmAction('Xac nhan', 'Ban co chac muon xoa danh gia nay?');
    if (!confirmed) return;

    try {
      await adminService.deleteReview(id);
      Alert.alert('Thanh cong', 'Da xoa danh gia');
      fetchReviews();
    } catch {
      Alert.alert('Loi', 'Khong the xoa danh gia');
    }
  };

  const columns = [
    { key: 'guest', label: 'Khach hang' },
    { key: 'property', label: 'Co so' },
    {
      key: 'rating',
      label: 'Danh gia',
      render: (rating: number) => (
        <View style={{ flexDirection: 'row', gap: 2 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={14} color={s <= rating ? '#F59E0B' : '#E2E8F0'} fill={s <= rating ? '#F59E0B' : 'transparent'} />
          ))}
        </View>
      ),
    },
    { key: 'comment', label: 'Noi dung' },
    { key: 'status', label: 'Trang thai' },
    { key: 'date', label: 'Ngay gui', render: (date: string) => <Text style={{ color: '#94A3B8' }}>{new Date(date).toLocaleDateString('vi-VN')}</Text> },
  ];

  const actions = [
    ...(permissions.canApprove ? [{ label: 'Duyet', icon: CheckCircle, color: '#10B981', onPress: (item: any) => handleApprove(item) }] : []),
    ...(permissions.canEdit ? [{ label: 'Sua', icon: Edit, color: '#3B82F6', onPress: (item: any) => openEditModal(item) }] : []),
    ...(permissions.canDelete ? [{ label: 'Xoa', icon: Trash2, color: '#EF4444', onPress: (item: any) => handleDelete(item.id) }] : []),
  ];

  if (loading) return <View style={styles.container}><Text style={{ color: '#FFF' }}>Dang tai danh gia...</Text></View>;

  return (
    <View style={styles.container}>
      <DataTable title="Quan ly danh gia tu khach hang" columns={columns} data={reviews} onSearch={() => {}} actions={actions} />

      <Modal visible={!!editingReview} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sua danh gia</Text>
              <TouchableOpacity onPress={() => setEditingReview(null)}>
                <X size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>So sao</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={formData.rating} onChangeText={(rating) => setFormData({ ...formData, rating })} />

            <Text style={styles.label}>Noi dung phan hoi</Text>
            <TextInput style={[styles.input, styles.textArea]} multiline value={formData.comment} onChangeText={(comment) => setFormData({ ...formData, comment })} />

            <View style={styles.statusRow}>
              {['PENDING', 'APPROVED', 'HIDDEN'].map((status) => (
                <TouchableOpacity key={status} style={[styles.statusBtn, formData.status === status && styles.statusBtnActive]} onPress={() => setFormData({ ...formData, status })}>
                  <Text style={[styles.statusBtnText, formData.status === status && styles.statusBtnTextActive]}>{status}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
              <Text style={styles.submitBtnText}>Luu danh gia</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1E293B', width: '100%', maxWidth: 520, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#334155' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#334155', paddingBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  label: { fontSize: 14, fontWeight: '600', color: '#94A3B8', marginBottom: 8 },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    color: '#FFF',
    fontSize: 15,
    marginBottom: 16,
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  } as any,
  textArea: { minHeight: 110, textAlignVertical: 'top' },
  statusRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statusBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155' },
  statusBtnActive: { borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  statusBtnText: { color: '#64748B', fontWeight: '700', fontSize: 12 },
  statusBtnTextActive: { color: '#3B82F6' },
  submitBtn: { backgroundColor: '#3B82F6', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
