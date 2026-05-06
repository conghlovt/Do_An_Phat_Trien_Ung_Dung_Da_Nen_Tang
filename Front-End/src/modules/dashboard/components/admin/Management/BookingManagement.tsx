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
      Alert.alert('Thanh cong', `Da chuyen trang thai sang ${status}`);
      fetchBookings();
    } catch {
      Alert.alert('Loi', 'Khong the cap nhat trang thai');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmAction('Xac nhan', 'Ban co chac muon xoa booking nay?');
    if (!confirmed) return;

    try {
      await adminService.deleteBooking(id);
      Alert.alert('Thanh cong', 'Da xoa booking');
      fetchBookings();
    } catch {
      Alert.alert('Loi', 'Khong the xoa booking');
    }
  };

  const columns = [
    { key: 'id', label: 'Ma don', render: (val: string) => <Text style={{ color: '#94A3B8', fontSize: 13 }}>#{val.substring(0, 8)}</Text> },
    { key: 'user', label: 'Khach hang', render: (val: any) => <Text style={{ color: '#FFF', fontWeight: '600' }}>{val?.username || 'Khach vang lai'}</Text> },
    { key: 'property', label: 'Luu tru', render: (val: any) => <Text style={{ color: '#CBD5E1' }}>{val?.name || 'N/A'}</Text> },
    { key: 'checkIn', label: 'Check-in', render: (val: string) => <Text style={{ color: '#94A3B8' }}>{new Date(val).toLocaleDateString('vi-VN')}</Text> },
    { key: 'totalPrice', label: 'Tong tien', render: (val: number) => <Text style={{ color: '#60A5FA', fontWeight: 'bold' }}>{Number(val || 0).toLocaleString()} VND</Text> },
    {
      key: 'status',
      label: 'Trang thai',
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
            <Text style={[styles.badgeText, { color }]}>{status}</Text>
          </View>
        );
      },
    },
  ];

  const actions = [
    ...(permissions.canApprove || permissions.canEdit
      ? [
          { label: 'Duyet', icon: CheckCircle, color: '#10B981', onPress: (item: any) => handleUpdateStatus(item.id, 'CONFIRMED') },
          { label: 'Huy', icon: XCircle, color: '#F59E0B', onPress: (item: any) => handleUpdateStatus(item.id, 'CANCELLED') },
        ]
      : []),
    ...(permissions.canDelete ? [{ label: 'Xoa', icon: Trash2, color: '#EF4444', onPress: (item: any) => handleDelete(item.id) }] : []),
  ];

  if (loading) return <View style={styles.container}><Text style={{ color: '#FFF' }}>Dang tai du lieu booking...</Text></View>;

  return (
    <View style={styles.container}>
      <DataTable title="Quan ly Booking he thong" columns={columns} data={bookings} onSearch={() => {}} actions={actions} />
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
