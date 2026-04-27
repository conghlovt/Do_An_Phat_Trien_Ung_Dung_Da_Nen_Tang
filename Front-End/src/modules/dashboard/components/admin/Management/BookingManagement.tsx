import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { DataTable } from './DataTable';
import { adminService } from '../../../services/admin.service';
import { Eye, Edit, CheckCircle, XCircle } from 'lucide-react-native';

export const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await adminService.getBookings();
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminService.updateBookingStatus(id, status);
      Alert.alert('Thành công', `Đã chuyển trạng thái sang ${status}`);
      fetchBookings();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const columns = [
    { key: 'id', label: 'Mã đơn', render: (val: string) => <Text style={{color: '#94A3B8', fontSize: 13}}>#{val.substring(0, 8)}</Text> },
    { key: 'user', label: 'Khách hàng', render: (val: any) => <Text style={{color: '#FFF', fontWeight: '600'}}>{val?.username || 'Khách vãng lai'}</Text> },
    { key: 'property', label: 'Lưu trú', render: (val: any) => <Text style={{color: '#CBD5E1'}}>{val?.name || 'N/A'}</Text> },
    { key: 'checkIn', label: 'Check-in', render: (val: string) => <Text style={{color: '#94A3B8'}}>{new Date(val).toLocaleDateString('vi-VN')}</Text> },
    { key: 'totalPrice', label: 'Tổng tiền', render: (val: number) => <Text style={{color: '#60A5FA', fontWeight: 'bold'}}>{val.toLocaleString()} VNĐ</Text> },
    { 
      key: 'status', 
      label: 'Trạng thái',
      render: (status: string) => {
        let color = '#10B981';
        let bgColor = 'rgba(16, 185, 129, 0.1)';
        
        if (status === 'CANCELLED' || status === 'REJECTED') {
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
  ];

  const actions = [
    { label: 'Duyệt', icon: CheckCircle, color: '#10B981', onPress: (item: any) => handleUpdateStatus(item.id, 'COMPLETED') },
    { label: 'Hủy', icon: XCircle, color: '#EF4444', onPress: (item: any) => handleUpdateStatus(item.id, 'CANCELLED') },
  ];

  if (loading) return <View style={styles.container}><Text style={{color: '#FFF'}}>Đang tải dữ liệu booking...</Text></View>;

  return (
    <View style={styles.container}>
      <DataTable 
        title="Quản lý Booking hệ thống"
        columns={columns}
        data={bookings}
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
