import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Plus,
  TicketPercent,
  Search,
  Pencil,
  Trash2,
} from 'lucide-react-native';

import {
  partnerService,
  type Voucher,
} from '../../src/partner/services/partner.service';

const isMobile = Platform.OS !== 'web';

function formatCurrency(value?: number) {
  if (!value) return 'Không giới hạn';
  return value.toLocaleString('vi-VN') + 'đ';
}

function formatDate(value?: string) {
  if (!value) return '';
  return value.slice(0, 10);
}

function getDiscountText(item: Voucher) {
  if (item.discountType === 'percent') {
    return `${item.discountValue}%`;
  }

  return formatCurrency(item.discountValue);
}

function getStatusText(status: string) {
  const normalized = String(status).toLowerCase();

  if (normalized === 'active') return 'Hoạt động';
  if (normalized === 'inactive') return 'Tạm tắt';
  if (normalized === 'expired') return 'Hết hạn';

  return status;
}

function getRoomText(item: Voucher) {
  const ids = item.applicableRoomTypeIds || [];

  if (!ids.length || ids.includes('all')) {
    return 'Tất cả loại phòng';
  }

  if (item.roomTypes?.length) {
    return item.roomTypes.map((room) => room.name).filter(Boolean).join(', ');
  }

  return ids.join(', ');
}

export default function PartnerVouchersPage() {
  const router = useRouter();

  const [hotelId, setHotelId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  const loadVouchers = async () => {
    try {
      setLoading(true);
      setErrorText('');


        const hotelRes = await partnerService.getHotels();

        console.log('HOTEL RESPONSE FRONTEND:', hotelRes);

        const firstHotel = hotelRes.items?.[0];


      if (!firstHotel?.id) {
        setHotelId('');
        setVouchers([]);
        setErrorText('Bạn chưa có khách sạn nào.');
        return;
      }

      setHotelId(firstHotel.id);

      const data = await partnerService.getVouchers(firstHotel.id);
      setVouchers(data);
    } catch (err: any) {
      console.error('Lỗi load voucher:', err);
      setErrorText(
        err?.response?.data?.message ||
          err?.message ||
          'Không tải được danh sách voucher'
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadVouchers();
    }, [])
  );

  const filteredVouchers = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    if (!q) return vouchers;

    return vouchers.filter((item) => {
      return (
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q)
      );
    });
  }, [keyword, vouchers]);

  const handleDelete = async (voucherId: string) => {
    if (!hotelId) return;

    const ok =
      Platform.OS === 'web'
        ? window.confirm('Bạn có chắc muốn xóa voucher này?')
        : true;

    if (!ok) return;

    try {
      await partnerService.deleteVoucher(hotelId, voucherId);
      await loadVouchers();
    } catch (err: any) {
      console.error('Lỗi xóa voucher:', err);
      setErrorText(
        err?.response?.data?.message || err?.message || 'Xóa voucher thất bại'
      );
    }
  };

  const goToCreate = () => {
    if (!hotelId) {
      setErrorText('Không tìm thấy khách sạn để tạo voucher.');
      return;
    }

    router.push({
      pathname: '/partner/voucher-form' as any,
      params: { hotelId },
    });
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View>
          <View style={s.titleRow}>
            <TicketPercent size={22} color="#0F172A" />
            <Text style={s.title}>Quản lý Voucher</Text>
          </View>

          <Text style={s.subtitle}>
            Tạo và quản lý mã giảm giá cho khách hàng
          </Text>
        </View>

        <TouchableOpacity style={s.addBtn} onPress={goToCreate}>
          <Plus size={16} color="#FFF" />
          <Text style={s.addBtnText}>Tạo voucher</Text>
        </TouchableOpacity>
      </View>

      <View style={s.searchWrap}>
        <View style={s.searchBox}>
          <Search size={16} color="#94A3B8" />

          <TextInput
            style={s.searchInput}
            value={keyword}
            onChangeText={setKeyword}
            placeholder="Tìm theo mã hoặc tên voucher..."
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      {errorText ? (
        <View style={s.errorBox}>
          <Text style={s.errorText}>{errorText}</Text>
        </View>
      ) : null}

      <ScrollView style={s.scroll}>
        {loading ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyTitle}>Đang tải voucher...</Text>
          </View>
        ) : filteredVouchers.length === 0 ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyIcon}>🎟️</Text>
            <Text style={s.emptyTitle}>Chưa có voucher nào</Text>
            <Text style={s.emptySubtitle}>
              Tạo voucher để thu hút khách đặt phòng
            </Text>
          </View>
        ) : (
          filteredVouchers.map((item) => (
            <View key={item.id} style={s.card}>
              <View style={s.cardHeader}>
                <View style={s.codeBox}>
                  <Text style={s.codeText}>{item.code}</Text>
                </View>

                <View style={s.statusBadge}>
                  <Text style={s.statusText}>{getStatusText(item.status)}</Text>
                </View>
              </View>

              <Text style={s.name}>{item.name}</Text>

              <View style={s.discountRow}>
                <View>
                  <Text style={s.label}>Giảm giá</Text>
                  <Text style={s.discount}>{getDiscountText(item)}</Text>
                </View>

                <Text style={s.usage}>
                  Đã dùng {item.usedCount}/{item.usageLimit || '∞'}
                </Text>
              </View>

              <View style={s.infoGrid}>
                <InfoItem
                  label="Đơn tối thiểu"
                  value={formatCurrency(item.minOrderValue)}
                />
                <InfoItem
                  label="Giảm tối đa"
                  value={formatCurrency(item.maxDiscount)}
                />
                <InfoItem
                  label="Ngày bắt đầu"
                  value={formatDate(item.startDate)}
                />
                <InfoItem
                  label="Ngày kết thúc"
                  value={formatDate(item.endDate)}
                />
                <InfoItem label="Loại phòng" value={getRoomText(item)} />
              </View>

              <View style={s.actions}>
                <TouchableOpacity
                  style={s.editBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/partner/voucher-form' as any,
                      params: {
                        id: item.id,
                        hotelId,
                      },
                    })
                  }
                >
                  <Pencil size={14} color="#334155" />
                  <Text style={s.editText}>Sửa</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.deleteBtn}
                  onPress={() => handleDelete(item.id)}
                >
                  <Trash2 size={14} color="#DC2626" />
                  <Text style={s.deleteText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoItem}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isMobile ? '#FFF' : '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: isMobile ? 16 : 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#94A3B8',
  },
  addBtn: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addBtnText: {
    color: '#FFF',
    fontWeight: '700',
  },
  searchWrap: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBox: {
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: '#1E293B',
  },
  scroll: {
    flex: 1,
    padding: 16,
  },
  errorBox: {
    margin: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    color: '#DC2626',
    fontWeight: '700',
  },
  emptyBox: {
    minHeight: 420,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#94A3B8',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codeBox: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  codeText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0D9488',
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '700',
  },
  name: {
    marginTop: 12,
    fontSize: 15,
    color: '#334155',
    fontWeight: '700',
  },
  discountRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    color: '#94A3B8',
  },
  discount: {
    marginTop: 2,
    fontSize: 26,
    color: '#0D9488',
    fontWeight: '900',
  },
  usage: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#475569',
    fontWeight: '700',
  },
  infoGrid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoItem: {
    width: isMobile ? '100%' : '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700',
  },
  actions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editText: {
    color: '#334155',
    fontWeight: '700',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteText: {
    color: '#DC2626',
    fontWeight: '700',
  },
});
