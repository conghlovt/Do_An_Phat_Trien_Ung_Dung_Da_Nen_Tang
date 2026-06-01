import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { partnerService } from '../../src/partner/services/partner.service';
import type { HotelListItem } from '../../src/partner/services/partner.service';
import { StatusBadge } from '../../src/partner/components/shared/StatusBadge';
import {
  LoadingSpinner,
  EmptyState,
} from '../../src/partner/components/shared/LoadingSpinner';
import {
  Plus,
  Hotel as HotelIcon,
  Trash2,
  Pencil,
  MapPin,
  Send,
  Search,
} from 'lucide-react-native';
import { SuccessModal } from '../../src/partner/components/shared/SuccessModal';

const isMobile = Platform.OS !== 'web';

const COLORS = {
  primary: '#0D9488',
  background: isMobile ? '#F1F5F9' : '#f0f2f5',
  card: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
};

function getHotelAddressText(hotel: HotelListItem) {
  return (
    hotel.address?.fullAddress ||
    hotel.address?.district ||
    hotel.address?.city ||
    ''
  );
}

export default function PartnerDashboardScreen() {
  const router = useRouter();

  const [hotels, setHotels] = useState<HotelListItem[]>([]);
  const [hotelKeyword, setHotelKeyword] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState<string | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadHotels = async () => {
    try {

      const { items } = await partnerService.getHotels({
        sort: 'created_at',
        order: 'desc',
        limit: 10,
      });

      setHotels(Array.isArray(items) ? items : []);
    } catch (e) {
      console.error('Không tải được danh sách khách sạn:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHotels();
  }, []);

  const filteredHotels = useMemo(() => {
    const q = hotelKeyword.trim().toLowerCase();

    if (!q) return hotels;

    return hotels.filter((hotel: any) => {
      const name = String(hotel.name || '').toLowerCase();
      const city = String(hotel.address?.city || hotel.city || '').toLowerCase();
      const district = String(
        hotel.address?.district || hotel.district || ''
      ).toLowerCase();
      const fullAddress = String(
        hotel.address?.fullAddress || hotel.address || ''
      ).toLowerCase();

      return (
        name.includes(q) ||
        city.includes(q) ||
        district.includes(q) ||
        fullAddress.includes(q)
      );
    });
  }, [hotels, hotelKeyword]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadHotels();
  };

  const confirmDelete = (id: string) => {
    setHotelToDelete(id);
    setShowDeleteConfirm(true);
  };

  const performDelete = async () => {
    if (!hotelToDelete) return;

    try {
      setErrorMsg('');
      setIsLoading(true);

      await partnerService.deleteHotel(hotelToDelete);

      setSuccessMsg('Đã xóa khách sạn thành công');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      await loadHotels();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể xóa khách sạn. Vui lòng thử lại.';

      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setHotelToDelete(null);
    }
  };

  const handleSubmitForApproval = async (hotelId: string) => {
    try {
      setIsLoading(true);

      await partnerService.submitHotelForReview(hotelId);

      setSuccessMsg('Đã gửi yêu cầu duyệt khách sạn!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      await loadHotels();
    } catch (err: any) {
      console.error('Lỗi gửi duyệt khách sạn:', err);

      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          'Không thể gửi duyệt khách sạn.'
      );

      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Danh sách khách sạn</Text>
          <Text style={styles.subtitle}>Quản lý các cơ sở lưu trú của bạn</Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/partner/hotel/new-hotel' as any)}
        >
          <Plus size={18} color="#FFF" style={{ marginRight: 4 }} />
          <Text style={styles.addBtnText}>Thêm khách sạn</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Search size={16} color="#94A3B8" />

          <TextInput
            style={styles.searchInput}
            value={hotelKeyword}
            onChangeText={setHotelKeyword}
            placeholder="Tìm theo tên khách sạn, quận/huyện, thành phố hoặc địa chỉ..."
            placeholderTextColor="#94A3B8"
          />
        </View>

        <Text style={styles.searchHint}>
          Hiển thị {filteredHotels.length}/{hotels.length} khách sạn
        </Text>
      </View>

      {errorMsg ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{errorMsg}</Text>
        </View>
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          hotels.length === 0 ? styles.scrollContentEmpty : styles.scrollContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {hotels.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <EmptyState
              icon="🏨"
              title="Chưa có khách sạn nào"
              subtitle="Tạo khách sạn đầu tiên để bắt đầu"
            />

            <TouchableOpacity
              style={styles.centerCreateBtn}
              onPress={() => router.push('/partner/hotel/new-hotel' as any)}
            >
              <Text style={styles.centerCreateText}>+ Thêm khách sạn mới</Text>
            </TouchableOpacity>
          </View>
        ) : filteredHotels.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <EmptyState
              icon="🔎"
              title="Không tìm thấy khách sạn"
              subtitle="Thử nhập tên khách sạn, quận/huyện hoặc thành phố khác"
            />
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredHotels.map((hotel) => (
              <View key={hotel.id} style={styles.hotelCard}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.hotelName} numberOfLines={1}>
                      {hotel.name}
                    </Text>

                    <View style={styles.addressRow}>
                      <MapPin
                        size={14}
                        color={COLORS.textSecondary}
                        style={{ marginRight: 4 }}
                      />

                      <Text style={styles.hotelAddress} numberOfLines={1}>
                        {getHotelAddressText(hotel)}
                      </Text>
                    </View>
                  </View>

                  <StatusBadge status={hotel.status} />
                </View>

                <View style={styles.cardStats}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>
                      {hotel.totalRooms || 0}
                    </Text>
                    <Text style={styles.statLabel}>Phòng</Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>
                      {(hotel as any).totalReviews || 0}
                    </Text>
                    <Text style={styles.statLabel}>Đánh giá</Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>
                      {Number(hotel.avgRating || 0).toFixed(1)} ⭐
                    </Text>
                    <Text style={styles.statLabel}>Điểm</Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  {hotel.status !== 'approved' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnDanger]}
                      onPress={() => confirmDelete(hotel.id)}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  )}

                  {hotel.status === 'draft' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnSubmit]}
                      onPress={() => handleSubmitForApproval(hotel.id)}
                    >
                      <Send
                        size={16}
                        color="#F59E0B"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.actionBtnTextSubmit}>Gửi duyệt</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnOutline]}
                    onPress={() =>
                      router.push(
                        `/partner/hotel/edit-hotel?id=${hotel.id}` as any
                      )
                    }
                  >
                    <Pencil
                      size={16}
                      color={COLORS.primary}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.actionBtnTextOutline}>Cập nhật</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnPrimary]}
                    onPress={() =>
                      router.push(`/partner/rooms?hotelId=${hotel.id}` as any)
                    }
                  >
                    <HotelIcon
                      size={16}
                      color="#FFF"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.actionBtnTextPrimary}>Xem phòng</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={showDeleteConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Trash2 size={24} color="#EF4444" />
            </View>

            <Text style={styles.modalTitle}>Xác nhận xóa</Text>

            <Text style={styles.modalMessage}>
              Bạn có chắc chắn muốn xóa khách sạn này không? Tất cả dữ liệu liên
              quan sẽ bị xóa vĩnh viễn.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalDeleteBtn}
                onPress={performDelete}
              >
                <Text style={styles.modalDeleteText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <SuccessModal
        visible={showSuccess}
        message={successMsg}
        onClose={() => setShowSuccess(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },

  addBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },

  searchSection: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  searchBox: {
    maxWidth: 620,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
  },

  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    paddingVertical: 10,
  },

  searchHint: {
    marginTop: 8,
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
  },

  scrollContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  centerCreateBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },

  centerCreateText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },

  grid: {
    gap: 16,
  },

  hotelCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)' as any,
      },
      default: {
        elevation: 2,
      },
    }),
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },

  hotelName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },

  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  hotelAddress: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },

  cardStats: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },

  statBox: {
    flex: 1,
    alignItems: 'center',
  },

  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },

  cardActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  actionBtnDanger: {
    backgroundColor: '#FEF2F2',
  },

  actionBtnSubmit: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  actionBtnTextSubmit: {
    color: '#D97706',
    fontSize: 13,
    fontWeight: '600',
  },

  actionBtnOutline: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: '#FFF',
  },

  actionBtnPrimary: {
    backgroundColor: COLORS.primary,
  },

  actionBtnTextOutline: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 13,
  },

  actionBtnTextPrimary: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },

  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },

  modalMessage: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },

  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },

  modalCancelText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },

  modalDeleteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },

  modalDeleteText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },

  errorBanner: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
  },

  errorBannerText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});