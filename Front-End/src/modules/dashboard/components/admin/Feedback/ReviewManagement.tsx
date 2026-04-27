import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DataTable } from '../Management/DataTable';
import { Star, MessageSquare, Trash2, CheckCircle } from 'lucide-react-native';

const MOCK_REVIEWS = [
  { id: 'R1', guest: 'John Smith', property: 'Sheraton Saigon', rating: 5, comment: 'Dịch vụ rất tốt!', date: '2024-04-25' },
  { id: 'R2', guest: 'Maria Garcia', property: 'Homestay Cỏ May', rating: 3, comment: 'Phòng hơi nhỏ so với ảnh.', date: '2024-04-24' },
];

export const ReviewManagement = () => {
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
      )
    },
    { key: 'comment', label: 'Nội dung' },
    { key: 'date', label: 'Ngày gửi' },
  ];

  const actions = [
    { label: 'Duyệt', icon: CheckCircle, color: '#10B981', onPress: (item: any) => console.log('Approve', item) },
    { label: 'Ẩn/Xóa', icon: Trash2, color: '#EF4444', onPress: (item: any) => console.log('Delete', item) },
  ];

  return (
    <View style={styles.container}>
      <DataTable 
        title="Quản lý đánh giá từ khách hàng"
        columns={columns}
        data={MOCK_REVIEWS}
        onSearch={(q) => console.log('Search reviews', q)}
        actions={actions}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});
