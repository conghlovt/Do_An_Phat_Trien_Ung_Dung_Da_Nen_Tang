import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DataTable } from '../Management/DataTable';
import { AlertCircle, CheckCircle2, DollarSign } from 'lucide-react-native';

const MOCK_FINANCE = [
  { id: 'RC001', month: 'Tháng 04/2024', total: '$12,400', fee: '$1,240', net: '$11,160', status: 'Chờ thanh toán' },
  { id: 'RC002', month: 'Tháng 03/2024', total: '$15,800', fee: '$1,580', net: '$14,220', status: 'Đã hoàn tất' },
  { id: 'RC003', month: 'Tháng 02/2024', total: '$10,200', fee: '$1,020', net: '$9,180', status: 'Lỗi thanh toán' },
  { id: 'RC004', month: 'Tháng 01/2024', total: '$14,000', fee: '$1,400', net: '$12,600', status: 'Đã hoàn tất' },
];

export const FinanceView = () => {
  const columns = [
    { key: 'month', label: 'Kỳ đối soát' },
    { key: 'total', label: 'Tổng tiền khách trả' },
    { key: 'fee', label: 'Phí nền tảng (10%)' },
    { key: 'net', label: 'Tiền thực nhận đối tác' },
    { 
      key: 'status', 
      label: 'Trạng thái',
      render: (status: string) => {
        let bgColor = '#DEF7EC';
        let textColor = '#03543F';
        let Icon = CheckCircle2;
        
        if (status === 'Lỗi thanh toán') {
          bgColor = '#FDE8E8';
          textColor = '#9B1C1C';
          Icon = AlertCircle;
        } else if (status === 'Chờ thanh toán') {
          bgColor = '#E1EFFE';
          textColor = '#1E429F';
          Icon = DollarSign;
        }
        
        return (
          <View style={[styles.badge, { backgroundColor: bgColor }]}>
            <Icon size={14} color={textColor} />
            <Text style={[styles.badgeText, { color: textColor }]}>{status}</Text>
          </View>
        );
      }
    },
  ];

  const actions = [
    { label: 'Xác nhận', icon: CheckCircle2, color: '#10B981', onPress: (item: any) => console.log('Confirm', item) },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.alertContainer}>
        <AlertCircle size={20} color="#B91C1C" />
        <Text style={styles.alertText}>
          Có 1 kỳ đối soát (Tháng 02/2024) đang gặp lỗi thanh toán. Cần can thiệp thủ công.
        </Text>
      </View>

      <DataTable 
        title="Đối soát & Doanh thu"
        columns={columns}
        data={MOCK_FINANCE}
        onSearch={(q) => console.log('Searching', q)}
        actions={actions}
      />

      <View style={styles.batchActions}>
        <TouchableOpacity style={styles.batchBtn}>
          <Text style={styles.batchBtnText}>Xác nhận thanh toán hàng loạt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE8E8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F8B4B4',
  },
  alertText: {
    color: '#9B1C1C',
    fontSize: 14,
    fontWeight: '600',
  },
  batchActions: {
    marginTop: 24,
    alignItems: 'flex-end',
  },
  batchBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  batchBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
