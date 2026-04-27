import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { DataTable } from './DataTable';
import { adminService } from '../../../services/admin.service';
import { Eye, CheckCircle, XCircle, Trash2 } from 'lucide-react-native';

export const LodgingManagement = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await adminService.getProperties();
      setProperties(data);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminService.updatePropertyStatus(id, status);
      Alert.alert('Thành công', `Đã chuyển trạng thái sang ${status}`);
      fetchProperties();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa cơ sở lưu trú này?', [
      { text: 'Hủy' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
        try {
          await adminService.deleteProperty(id);
          fetchProperties();
        } catch (error) {
          Alert.alert('Lỗi', 'Không thể xóa');
        }
      }}
    ]);
  };

  const columns = [
    { key: 'name', label: 'Tên cơ sở', render: (val: string) => <Text style={{color: '#FFF', fontWeight: 'bold'}}>{val}</Text> },
    { key: 'address', label: 'Địa chỉ', render: (val: string) => <Text style={{color: '#94A3B8', fontSize: 13}} numberOfLines={1}>{val}</Text> },
    { key: 'type', label: 'Loại', render: (val: string) => <Text style={{color: '#60A5FA'}}>{val}</Text> },
    { 
      key: 'status', 
      label: 'Trạng thái',
      render: (status: string) => {
        let color = '#10B981';
        let bgColor = 'rgba(16, 185, 129, 0.1)';
        
        if (status === 'REJECTED') {
          color = '#EF4444';
          bgColor = 'rgba(239, 68, 68, 0.1)';
        } else if (status === 'PENDING') {
          color = '#F59E0B';
          bgColor = 'rgba(245, 158, 11, 0.1)';
        }
        
        return (
          <View style={[styles.badge, { backgroundColor: bgColor }]}>
            <Text style={[styles.badgeText, { color }]}>{status}</Text>
          </View>
        );
      }
    },
    { key: 'owner', label: 'Chủ sở hữu', render: (val: any) => <Text style={{color: '#CBD5E1'}}>{val?.username || 'N/A'}</Text> },
  ];

  const actions = [
    { label: 'Duyệt', icon: CheckCircle, color: '#10B981', onPress: (item: any) => handleUpdateStatus(item.id, 'APPROVED') },
    { label: 'Từ chối', icon: XCircle, color: '#F59E0B', onPress: (item: any) => handleUpdateStatus(item.id, 'REJECTED') },
    { label: 'Xóa', icon: Trash2, color: '#EF4444', onPress: (item: any) => handleDelete(item.id) },
  ];

  if (loading) return <View style={styles.container}><Text style={{color: '#FFF'}}>Đang tải dữ liệu lưu trú...</Text></View>;

  return (
    <View style={styles.container}>
      <DataTable 
        title="Quản lý cơ sở lưu trú"
        columns={columns}
        data={properties}
        onSearch={(q) => console.log('Searching', q)}
        actions={actions}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
