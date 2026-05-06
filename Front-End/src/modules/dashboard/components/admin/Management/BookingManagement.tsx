import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { DataTable } from './DataTable';
import { adminService } from '../../../services/admin.service';
import { CheckCircle, Trash2, XCircle } from 'lucide-react-native';
import { confirmAction } from '../../../utils/confirmAction';
import { ModuleAccess } from '../../../utils/permissions';

const fullAccess: ModuleAccess = { canView: true, canEdit: true, canDelete: true, canApprove: true };

export const BookingManagement = ({ permissions = fullAccess }: { permissions?: ModuleAccess }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await adminService.getBookings();
      setBookings(data || []);
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
      Alert.alert('Thành công', `Đã chuyển trạng thái sang ${status === 'CONFIRMED' ? 'Đã xác nhận' : 'Đã hủy'}`);
      fetchBookings();
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmAction('Xác nhận', 'Bạn có chắc muốn xóa đặt phòng này?');
    if (!confirmed) return;

    try {
      await adminService.deleteBooking(id);
      Alert.alert('Thành công', 'Đã xóa đặt phòng');
      fetchBookings();
    } catch {
      Alert.alert('Lỗi', 'Không thể xóa đặt phòng');
    }
  };

  const columns = [
    { key: 'id', label: 'Mã đơn', render: (val: string) => <Text style={{ color: '#94A3B8', fontSize: 13 }}>#{val.substring(0, 8)}</Text> },
    { key: 'user', label: 'Khách hàng', render: (val: any) => <Text style={{ color: '#FFF', fontWeight: '600' }}>{val?.username || 'Khách vãng lai'}</Text> },
    { key: 'property', label: 'Lưu trú', render: (val: any) => <Text style={{ color: '#CBD5E1' }}>{val?.name || 'N/A'}</Text> },
    { key: 'checkIn', label: 'Check-in', render: (val: string) => <Text style={{ color: '#94A3B8' }}>{new Date(val).toLocaleDateString('vi-VN')}</Text> },
    { key: 'totalPrice', label: 'Tổng tiền', render: (val: number) => <Text style={{ color: '#60A5FA', fontWeight: 'bold' }}>{Number(val || 0).toLocaleString()} VND</Text> },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (status: string) => {
        let color = '#10B981';
        let bgColor = 'rgba(16, 185, 129, 0.1)';

        if (status === 'CANCELLED') {
          color = '#EF4444';
          bgColor = 'rgba(239, 68, 68, 0.1)';
        } else if (status === 'PENDING') {
          color = '#F59E0B';
          bgColor = 'rgba(245, 158, 11, 0.1)';
        }

        return (
          <View style={[styles.badge, { backgroundColor: bgColor }]}>
            <Text style={[styles.badgeText, { color }]}>
              {status === 'CONFIRMED' ? 'Đã xác nhận' : status === 'CANCELLED' ? 'Đã hủy' : 'Chờ xử lý'}
            </Text>
          </View>
        );
      },
    },
  ];

  const actions = [
    ...(permissions.canApprove || permissions.canEdit
      ? [
          { label: 'Duyệt', icon: CheckCircle, color: '#10B981', onPress: (item: any) => handleUpdateStatus(item.id, 'CONFIRMED') },
          { label: 'Hủy', icon: XCircle, color: '#F59E0B', onPress: (item: any) => handleUpdateStatus(item.id, 'CANCELLED') },
        ]
      : []),
    ...(permissions.canDelete ? [{ label: 'Xóa', icon: Trash2, color: '#EF4444', onPress: (item: any) => handleDelete(item.id) }] : []),
  ];

  if (loading) return <View style={styles.container}><Text style={{ color: '#FFF' }}>Đang tải dữ liệu đặt phòng...</Text></View>;

  return (
    <View style={styles.container}>
      <DataTable title="Quản lý đặt phòng hệ thống" columns={columns} data={bookings} onSearch={() => {}} actions={actions} />
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
