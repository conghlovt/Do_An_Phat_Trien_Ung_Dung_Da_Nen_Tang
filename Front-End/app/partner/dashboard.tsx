import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
  RefreshControl, Dimensions, Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { partnerService } from '../../src/partner/services/partner.service';
import type { HotelListItem } from '../../src/partner/services/partner.service';
import { StatusBadge } from '../../src/partner/components/shared/StatusBadge';
import { LoadingSpinner, EmptyState } from '../../src/partner/components/shared/LoadingSpinner';
import { Plus, Hotel as HotelIcon, Trash2, Pencil, MapPin, Send } from 'lucide-react-native';
import { Image } from 'expo-image';
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

export default function PartnerDashboardScreen() {
  const router = useRouter();
  const [hotels, setHotels] = useState<HotelListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Delete confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState<string | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadHotels = async () => {
    try {
      const { items } = await partnerService.getHotels();
      setHotels(items);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHotels();
  }, []);

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
      setIsLoading(true);
      await partnerService.deleteHotel(hotelToDelete);
      setSuccessMsg('Đã xóa khách sạn thành công');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      await loadHotels();
    } catch (err) {
      console.error(err);
    } finally {
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
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={hotels.length === 0 ? styles.scrollContentEmpty : styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />}
      >
        {hotels.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <EmptyState icon="🏨" title="Chưa có khách sạn nào" subtitle="Tạo khách sạn đầu tiên để bắt đầu" />
            <TouchableOpacity style={styles.centerCreateBtn} onPress={() => router.push('/partner/hotel/new-hotel' as any)}>
              <Text style={styles.centerCreateText}>+ Thêm khách sạn mới</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {hotels.map((hotel) => (
              <View key={hotel.id} style={styles.hotelCard}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.hotelName} numberOfLines={1}>{hotel.name}</Text>
                    <View style={styles.addressRow}>
                      <MapPin size={14} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={styles.hotelAddress} numberOfLines={1}>{hotel.address?.fullAddress || hotel.address?.city || ''}</Text>
                    </View>
                  </View>
                  <StatusBadge status={hotel.status} />
                </View>
                
                <View style={styles.cardStats}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{hotel.totalRooms || 0}</Text>
                    <Text style={styles.statLabel}>Phòng</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{(hotel as any).totalReviews || 0}</Text>
                    <Text style={styles.statLabel}>Đánh giá</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{Number(hotel.avgRating || 0).toFixed(1)} ⭐</Text>
                    <Text style={styles.statLabel}>Điểm</Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.actionBtnDanger]} 
                    onPress={() => confirmDelete(hotel.id)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                  {hotel.status === 'draft' && (
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.actionBtnSubmit]} 
                      onPress={() => handleSubmitForApproval(hotel.id)}
                    >
                      <Send size={16} color="#F59E0B" style={{ marginRight: 6 }} />
                      <Text style={styles.actionBtnTextSubmit}>Gửi duyệt</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.actionBtnOutline]} 
                    onPress={() => router.push(`/partner/hotel/edit-hotel?id=${hotel.id}` as any)}
                  >
                    <Pencil size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.actionBtnTextOutline}>Cập nhật</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.actionBtnPrimary]} 
                    onPress={() => router.push(`/partner/rooms?hotelId=${hotel.id}` as any)}
                  >
                    <HotelIcon size={16} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.actionBtnTextPrimary}>Xem phòng</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal Delete */}
      <Modal visible={showDeleteConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Trash2 size={24} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Xác nhận xóa</Text>
            <Text style={styles.modalMessage}>Bạn có chắc chắn muốn xóa khách sạn này không? Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowDeleteConfirm(false)}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDeleteBtn} onPress={performDelete}>
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
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary },
  addBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.primary, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 8 
  },
  addBtnText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  scrollContentEmpty: { flexGrow: 1, justifyContent: 'center' },
  emptyWrapper: { alignItems: 'center', justifyContent: 'center', padding: 20 },
  centerCreateBtn: { marginTop: 20, backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  centerCreateText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  
  grid: { gap: 16 },
  hotelCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      web: { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' as any },
      default: { elevation: 2 }
    })
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  hotelName: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  hotelAddress: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  
  cardStats: { 
    flexDirection: 'row', 
    backgroundColor: '#F8FAFC', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 16 
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  statLabel: { fontSize: 12, color: COLORS.textSecondary },
  statDivider: { width: 1, backgroundColor: COLORS.border },

  cardActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  actionBtnDanger: { backgroundColor: '#FEF2F2' },
  actionBtnSubmit: { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A' },
  actionBtnTextSubmit: { color: '#D97706', fontSize: 13, fontWeight: '600' },
  actionBtnOutline: { borderWidth: 1, borderColor: COLORS.primary, backgroundColor: '#FFF' },
  actionBtnPrimary: { backgroundColor: COLORS.primary },
  actionBtnTextOutline: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  actionBtnTextPrimary: { color: '#FFF', fontWeight: '600', fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400, alignItems: 'center' },
  modalIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  modalMessage: { fontSize: 14, color: '#475569', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center' },
  modalCancelText: { color: '#475569', fontSize: 14, fontWeight: '600' },
  modalDeleteBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center' },
  modalDeleteText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
});
