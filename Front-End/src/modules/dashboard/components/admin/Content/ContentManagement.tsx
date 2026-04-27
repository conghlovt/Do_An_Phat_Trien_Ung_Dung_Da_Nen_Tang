import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DataTable } from '../Management/DataTable';
import { FileText, Plus, Edit, Eye } from 'lucide-react-native';

const MOCK_CONTENT = [
  { id: 'C1', title: 'Chính sách đặt phòng', category: 'Pháp lý', author: 'Admin', date: '2024-04-01' },
  { id: 'C2', title: 'Hướng dẫn cho đối tác mới', category: 'Hướng dẫn', author: 'Editor', date: '2024-04-10' },
];

export const ContentManagement = () => {
  const columns = [
    { key: 'title', label: 'Tiêu đề' },
    { key: 'category', label: 'Danh mục' },
    { key: 'author', label: 'Người viết' },
    { key: 'date', label: 'Cập nhật cuối' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.addBtn}>
          <Plus size={20} color="#FFF" />
          <Text style={styles.addBtnText}>Viết bài mới</Text>
        </TouchableOpacity>
      </View>
      
      <DataTable 
        title="Quản lý bài viết & Nội dung"
        columns={columns}
        data={MOCK_CONTENT}
        onSearch={(q) => console.log('Search content', q)}
        actions={[
          { label: 'Xem', icon: Eye, color: '#64748B', onPress: () => {} },
          { label: 'Sửa', icon: Edit, color: '#3B82F6', onPress: () => {} },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { marginBottom: 20, alignItems: 'flex-end' },
  addBtn: { backgroundColor: '#3B82F6', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  addBtnText: { color: '#FFF', fontWeight: '700' },
});
