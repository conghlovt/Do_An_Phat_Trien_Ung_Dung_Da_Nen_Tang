import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView, Platform } from 'react-native';
import { DataTable } from '../Management/DataTable';
import { Plus, Edit, Trash2, X } from 'lucide-react-native';
import { adminService } from '../../../services/admin.service';
import { confirmAction } from '../../../utils/confirmAction';
import { ModuleAccess } from '../../../utils/permissions';
import { getErrorMessage } from '../../../utils/errorMessage';

const emptyForm = {
  title: '',
  category: '',
  excerpt: '',
  body: '',
  thumbnail: '',
  status: 'DRAFT',
};

const fullAccess: ModuleAccess = { canView: true, canEdit: true, canDelete: true, canApprove: true };

export const ContentManagement = ({ permissions = fullAccess }: { permissions?: ModuleAccess }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchContent = async (q?: string) => {
    setLoading(true);
    try {
      const data = await adminService.getContent(q);
      setPosts(data || []);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (q: string) => {
    fetchContent(q);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const openCreateModal = () => {
    setEditingPost(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (post: any) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      category: post.category || '',
      excerpt: post.excerpt || '',
      body: post.body || '',
      thumbnail: post.thumbnail || '',
      status: post.status || 'DRAFT',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.category || !formData.body) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề, danh mục và nội dung');
      return;
    }

    try {
      if (editingPost) {
        await adminService.updateContent(editingPost.id, formData);
      } else {
        await adminService.createContent(formData);
      }
      Alert.alert('Thành công', editingPost ? 'Đã cập nhật bài viết' : 'Đã tạo bài viết mới');
      setIsModalOpen(false);
      fetchContent();
    } catch (error) {
      Alert.alert('Lỗi', getErrorMessage(error, 'Không thể lưu bài viết.'));
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmAction('Xác nhận', 'Bạn có chắc muốn xóa bài viết này?');
    if (!confirmed) return;

    try {
      await adminService.deleteContent(id);
      Alert.alert('Thành công', 'Đã xóa bài viết');
      fetchContent();
    } catch {
      Alert.alert('Lỗi', 'Không thể xóa bài viết');
    }
  };

  const columns = [
    { key: 'title', label: 'Tiêu đề', render: (value: string) => <Text style={{ color: '#FFF', fontWeight: '700' }}>{value}</Text> },
    { key: 'category', label: 'Danh mục' },
    { key: 'author', label: 'Người viết' },
    { key: 'status', label: 'Trạng thái', render: (s: string) => <Text style={{ color: s === 'PUBLISHED' ? '#10B981' : '#94A3B8' }}>{s === 'PUBLISHED' ? 'Đã đăng' : s === 'DRAFT' ? 'Bản nháp' : 'Lưu trữ'}</Text> },
    { key: 'date', label: 'Cập nhật cuối', render: (date: string) => <Text style={{ color: '#94A3B8' }}>{new Date(date).toLocaleDateString('vi-VN')}</Text> },
  ];

  const actions = [
    ...(permissions.canEdit ? [{ label: 'Sửa', icon: Edit, color: '#3B82F6', onPress: (item: any) => openEditModal(item) }] : []),
    ...(permissions.canDelete ? [{ label: 'Xóa', icon: Trash2, color: '#EF4444', onPress: (item: any) => handleDelete(item.id) }] : []),
  ];

  if (loading) return <View style={styles.container}><Text style={{ color: '#FFF' }}>Đang tải nội dung...</Text></View>;

  return (
    <View style={styles.container}>
      {permissions.canEdit && (
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.addBtn} onPress={openCreateModal}>
            <Plus size={20} color="#FFF" />
            <Text style={styles.addBtnText}>Viết bài mới</Text>
          </TouchableOpacity>
        </View>
      )}

      <DataTable title="Quản lý bài viết và nội dung" columns={columns} data={posts} onSearch={handleSearch} actions={actions} />

      <Modal visible={isModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingPost ? 'Sửa bài viết' : 'Viết bài mới'}</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Tiêu đề</Text>
              <TextInput style={styles.input} placeholder="VD: Top 10 địa điểm du lịch..." placeholderTextColor="#475569" value={formData.title} onChangeText={(title) => setFormData({ ...formData, title })} />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Danh mục</Text>
                  <TextInput style={styles.input} placeholder="VD: Cẩm nang" placeholderTextColor="#475569" value={formData.category} onChangeText={(category) => setFormData({ ...formData, category })} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Ảnh đại diện (URL)</Text>
                  <TextInput style={styles.input} placeholder="https://..." placeholderTextColor="#475569" value={formData.thumbnail} onChangeText={(thumbnail) => setFormData({ ...formData, thumbnail })} />
                </View>
              </View>

              <Text style={styles.label}>Mô tả ngắn</Text>
              <TextInput style={styles.input} value={formData.excerpt} onChangeText={(excerpt) => setFormData({ ...formData, excerpt })} />

              <Text style={styles.label}>Nội dung</Text>
              <TextInput style={[styles.input, styles.textArea]} multiline value={formData.body} onChangeText={(body) => setFormData({ ...formData, body })} />

              <View style={styles.statusRow}>
                {['DRAFT', 'PUBLISHED', 'ARCHIVED'].map((status) => (
                  <TouchableOpacity key={status} style={[styles.statusBtn, formData.status === status && styles.statusBtnActive]} onPress={() => setFormData({ ...formData, status })}>
                    <Text style={[styles.statusBtnText, formData.status === status && styles.statusBtnTextActive]}>
                      {status === 'DRAFT' ? 'Bản nháp' : status === 'PUBLISHED' ? 'Đã đăng' : 'Lưu trữ'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
                <Text style={styles.submitBtnText}>Lưu bài viết</Text>
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
  addBtn: { backgroundColor: '#3B82F6', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  addBtnText: { color: '#FFF', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1E293B', width: '100%', maxWidth: 720, maxHeight: '90%', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#334155' },
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
  textArea: { minHeight: 180, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 16 },
  statusRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statusBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155' },
  statusBtnActive: { borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  statusBtnText: { color: '#64748B', fontWeight: '700', fontSize: 12 },
  statusBtnTextActive: { color: '#3B82F6' },
  submitBtn: { backgroundColor: '#3B82F6', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
