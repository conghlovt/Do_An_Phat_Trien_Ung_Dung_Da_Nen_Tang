import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DataTable } from '../Management/DataTable';
import { AlertCircle, CheckCircle2, DollarSign } from 'lucide-react-native';
import { adminService } from '../../services/admin.service';
import { ModuleAccess } from '../../utils/permissions';

const fullAccess: ModuleAccess = { canView: true, canEdit: true, canDelete: false, canApprove: true, canExport: false };

export const FinanceView = ({ permissions = fullAccess }: { permissions?: ModuleAccess }) => {
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchFinance = useCallback(async () => {
    try {
      setLoading(true);
      const result = await adminService.getFinance({
        search: searchQuery,
        status: statusFilter,
        page,
        limit: 10,
      });
      const records = result.finance || result.records || result.items || [];
      setData(records.map((r: any) => ({
        ...r,
        total: `${Number(r.totalRevenue || 0).toLocaleString('vi-VN')} VND`,
        fee: `${Number(r.platformFee || 0).toLocaleString('vi-VN')} VND`,
        net: `${Number(r.partnerNet || 0).toLocaleString('vi-VN')} VND`,
      })));
      setTotalCount(result.pagination?.total ?? result.total ?? 0);
    } catch (error) {
      console.error('Fetch finance error:', error);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter]);

  useEffect(() => {
    fetchFinance();
  }, [fetchFinance]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await adminService.downloadExport('finance', {
        search: searchQuery,
        status: statusFilter,
      }, 'finance');
    } catch (error: any) {
      Alert.alert('Lỗi', error?.response?.status === 403 ? 'Bạn không có quyền xuất dữ liệu' : 'Xuất file thất bại');
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    { key: 'month', label: 'Kỳ đối soát' },
    { key: 'total', label: 'Tổng tiền khách trả' },
    { key: 'fee', label: 'Phí nền tảng' },
    { key: 'net', label: 'Tiền đối tác nhận' },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (status: string) => {
        const isError = status === 'FAILED';
        const isPending = status === 'PENDING';
        const bgColor = isError ? '#FDE8E8' : isPending ? '#E1EFFE' : '#DEF7EC';
        const textColor = isError ? '#9B1C1C' : isPending ? '#1E429F' : '#03543F';
        const Icon = isError ? AlertCircle : isPending ? DollarSign : CheckCircle2;
        return (
          <View style={[styles.badge, { backgroundColor: bgColor }]}>
            <Icon size={14} color={textColor} />
            <Text style={[styles.badgeText, { color: textColor }]}>{status}</Text>
          </View>
        );
      },
    },
  ];

  return (
    <View style={styles.container}>
      <DataTable
        title="Đối soát & Doanh thu"
        columns={columns}
        data={data}
        onSearch={handleSearch}
        onExport={permissions.canExport ? () => handleExport() : undefined}
        exporting={exporting}
        serverSide
        loading={loading}
        totalCount={totalCount}
        page={page}
        onPageChange={setPage}
        filterContent={
          <View style={styles.filterRow}>
            {['', 'PENDING', 'COMPLETED', 'FAILED'].map((status) => (
              <TouchableOpacity key={status || 'ALL'} style={[styles.filterChip, statusFilter === status && styles.filterChipActive]} onPress={() => { setStatusFilter(status); setPage(1); }}>
                <Text style={[styles.filterChipText, statusFilter === status && styles.filterChipTextActive]}>{status || 'Tất cả'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
  filterChipActive: { borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  filterChipText: { color: '#64748B', fontSize: 12, fontWeight: '700' },
  filterChipTextActive: { color: '#2563EB' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '700' },
});
