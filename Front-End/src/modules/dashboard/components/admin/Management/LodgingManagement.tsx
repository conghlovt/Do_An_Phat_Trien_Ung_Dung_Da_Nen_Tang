import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { DataTable } from './DataTable';
import { adminService } from '../../../services/admin.service';
import { CheckCircle, Trash2, XCircle } from 'lucide-react-native';
import { confirmAction } from '../../../utils/confirmAction';
import { ModuleAccess } from '../../../utils/permissions';

const fullAccess: ModuleAccess = { canView: true, canEdit: true, canDelete: true, canApprove: true };

export const LodgingManagement = ({ permissions = fullAccess }: { permissions?: ModuleAccess }) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await adminService.getProperties();
      setProperties(data || []);
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
      Alert.alert('Thanh cong', `Da chuyen trang thai sang ${status}`);
      fetchProperties();
    } catch {
      Alert.alert('Loi', 'Khong the cap nhat trang thai');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmAction('Xac nhan', 'Ban co chac muon xoa co so luu tru nay?');
    if (!confirmed) return;

    try {
      await adminService.deleteProperty(id);
      Alert.alert('Thanh cong', 'Da xoa co so luu tru');
      fetchProperties();
    } catch {
      Alert.alert('Loi', 'Khong the xoa co so luu tru');
    }
  };

  const columns = [
    { key: 'name', label: 'Ten co so', render: (val: string) => <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{val}</Text> },
    { key: 'address', label: 'Dia chi', render: (val: string) => <Text style={{ color: '#94A3B8', fontSize: 13 }} numberOfLines={1}>{val}</Text> },
    { key: 'type', label: 'Loai', render: (val: string) => <Text style={{ color: '#60A5FA' }}>{val}</Text> },
    {
      key: 'status',
      label: 'Trang thai',
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
            <Text style={[styles.badgeText, { color }]}>{status}</Text>
          </View>
        );
      },
    },
    { key: 'owner', label: 'Chu so huu', render: (val: any) => <Text style={{ color: '#CBD5E1' }}>{val?.username || 'N/A'}</Text> },
  ];

  const actions = [
    ...(permissions.canApprove || permissions.canEdit
      ? [
          { label: 'Kich hoat', icon: CheckCircle, color: '#10B981', onPress: (item: any) => handleUpdateStatus(item.id, 'ACTIVE') },
          { label: 'Tam ngung', icon: XCircle, color: '#F59E0B', onPress: (item: any) => handleUpdateStatus(item.id, 'INACTIVE') },
        ]
      : []),
    ...(permissions.canDelete ? [{ label: 'Xoa', icon: Trash2, color: '#EF4444', onPress: (item: any) => handleDelete(item.id) }] : []),
  ];

  if (loading) return <View style={styles.container}><Text style={{ color: '#FFF' }}>Dang tai du lieu luu tru...</Text></View>;

  return (
    <View style={styles.container}>
      <DataTable title="Quan ly co so luu tru" columns={columns} data={properties} onSearch={() => {}} actions={actions} />
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
