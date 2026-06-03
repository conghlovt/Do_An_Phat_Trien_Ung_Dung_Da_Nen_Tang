import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
  Image, RefreshControl, Modal,
} from 'react-native';
import { hotelService } from '../../services/hotel.service';
import { Hotel, HotelListItem } from '../../types/hotel.type';
import { AmenityIcon } from '../shared/AmenityIcon';
import { StatusBadge } from '../shared/StatusBadge';
import { LoadingSpinner, EmptyState } from '../shared/LoadingSpinner';
import { Pencil, Camera, ImageIcon, Info, Trash2 } from 'lucide-react-native';


const isMobile = Platform.OS !== 'web';

const COLORS = {
  primary: '#0D9488',
  primaryLight: '#F0FDFA',
  background: isMobile ? '#F1F5F9' : '#f0f2f5',
  card: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
};

interface Props {
  onNavigate?: (screen: string, params?: Record<string, any>) => void;
}

export function PartnerOverview({ onNavigate }: Props) {
  const [hotels, setHotels] = useState<HotelListItem[]>([]);
  const [currentHotel, setCurrentHotel] = useState<Hotel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    hotelService.getHotels().then(({ items }) => {
      setHotels(items);
      if (items.length > 0) {
        hotelService.getHotel(items[0].id).then(setCurrentHotel);
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (hotels.length > 0 && !currentHotel) {
      hotelService.getHotel(hotels[0].id).then(setCurrentHotel);
    }
  }, [hotels, currentHotel]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const { items } = await hotelService.getHotels();
      setHotels(items);
      if (items.length > 0) {
        const h = await hotelService.getHotel(items[0].id);
        setCurrentHotel(h);
      }
    } catch {}
    setRefreshing(false);
  };

  const submitForReview = async (id: string) => {
    await hotelService.submitHotelForReview(id);
    onRefresh();
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const performDelete = async () => {
    if (!currentHotel) return;
    try {
      setIsLoading(true);
      await hotelService.deleteHotel(currentHotel.id);
      setHotels([]);
      setCurrentHotel(null);
    } catch {
      // Handle error if needed
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading && !currentHotel) return <LoadingSpinner />;

  if (!currentHotel && hotels.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyWrapper}>
          <EmptyState icon="🏨" title="Chưa có khách sạn nào" subtitle="Tạo khách sạn đầu tiên để bắt đầu" />
          <TouchableOpacity style={styles.centerCreateBtn} onPress={() => onNavigate?.('hotel-edit')}>
            <Text style={styles.centerCreateText}>+ Tạo khách sạn mới</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const hotel = currentHotel;
  const images = hotel?.images || [];

  return (
    <View style={styles.container}>
      {isMobile ? (
        <View style={styles.mobilePageHeader}>
          <Text style={styles.mobilePageTitle}>Trang chủ</Text>
          <Text style={styles.mobileHotelName}>{hotel?.name || 'Khách sạn'}</Text>
          <View style={styles.mobileHeaderMeta}>
            <StatusBadge status={hotel?.hotelStatus || 'draft'} />
            {hotel?.starRating ? <Text style={styles.starText}>{'⭐'.repeat(hotel.starRating)}</Text> : null}
            {hotel?.hotelStatus === 'draft' && (
              <TouchableOpacity style={styles.submitBtnMobile} onPress={async () => { try { await submitForReview(hotel!.id); } catch { } }}>
                <Text style={styles.submitBtnText}>Gửi duyệt</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Thông tin khách sạn</Text>
            <View style={styles.breadcrumb}>
              <Text style={styles.breadcrumbText}>Thiết lập</Text>
              <Text style={styles.breadcrumbSeparator}> {'>'} </Text>
              <Text style={styles.breadcrumbActive}>Thông tin khách sạn</Text>
            </View>
          </View>
          {hotel?.hotelStatus === 'draft' && (
            <TouchableOpacity style={styles.submitBtn} onPress={async () => { try { await submitForReview(hotel!.id); } catch { } }}>
              <Text style={styles.submitBtnText}>Gửi duyệt</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainCard}>
          <View style={styles.actionBar}>
            <StatusBadge status={hotel?.hotelStatus || 'draft'} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[styles.editBtn, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]} onPress={handleDelete}>
                <Trash2 size={14} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={[styles.editBtnText, { color: '#EF4444' }]}>Xóa</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editBtn} onPress={() => onNavigate?.('hotel-edit', { editHotelId: hotel?.id })}>
                <Pencil size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
                <Text style={styles.editBtnText}>Cập nhật</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.contentSection}>
            <View style={styles.gridContainer}>
              <View style={styles.gridColumn}>
                <InfoRow label="Tên khách sạn" value={`${hotel?.name} ${hotel?.starRating ? '(' + '⭐'.repeat(hotel.starRating) + ')' : ''}`} />
                <InfoRow label="Loại hình" value={hotel?.propertyType?.toUpperCase() || 'HOTEL'} />
                <InfoRow label="Giờ check-in / check-out" value={`${hotel?.checkInTime || '14:00'} - ${hotel?.checkOutTime || '12:00'}`} />
                <InfoRow label="Địa chỉ" value={hotel?.address?.fullAddress || hotel?.address?.addressLine || 'Chưa cập nhật'} />
                <InfoRow label="Tỉnh / Thành phố" value={hotel?.address?.city || 'Chưa cập nhật'} />
              </View>
              <View style={styles.gridColumn}>
                <InfoRow label="Tổng số phòng" value={hotel?.totalRooms?.toString() || '0'} />
                <InfoRow label="Tổng lượt đánh giá" value={hotel?.totalReviews?.toString() || '0'} />
                <InfoRow label="Điểm đánh giá" value={Number(hotel?.avgRating || 0).toFixed(1)} />
                <InfoRow label="Chính sách hủy" value={hotel?.cancellationPolicy || 'Linh hoạt'} />
                <InfoRow label="Thời gian hủy miễn phí" value={hotel?.cancellationHours ? `${hotel.cancellationHours} giờ` : 'Không'} />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.sectionHeader}>
              <Info size={16} color={COLORS.text} />
              <Text style={styles.sectionTitle}>Mô tả</Text>
            </View>
            <Text style={styles.descriptionText}>{hotel?.description || 'Chưa có mô tả'}</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Tiện ích</Text>
            <View style={styles.amenitiesGrid}>
              {hotel?.hotelAmenities?.length ? hotel.hotelAmenities.map((ha) => (
                <View key={ha.amenity.id} style={styles.amenityChip}>
                  <AmenityIcon name={ha.amenity.name} size={14} color="#0D9488" />
                  <Text style={styles.amenityText}>{ha.amenity.name}</Text>
                </View>
              )) : (
                <Text style={styles.textSecondary}>Chưa có tiện ích nào được thêm.</Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.sectionHeader}>
              <ImageIcon size={16} color={COLORS.text} />
              <Text style={styles.sectionTitle}>Hình ảnh</Text>
              {images.length > 0 && (
                <View style={styles.imageCountBadge}>
                  <Text style={styles.imageCountText}>{images.length} ảnh</Text>
                </View>
              )}
            </View>

            {images.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageScrollContent}>
                {images.map((img) => (
                  <Image key={img.id} source={{ uri: img.imageUrl }} style={styles.galleryImage} resizeMode="cover" />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noImagePlaceholder}>
                <Camera size={28} color={COLORS.textSecondary} />
                <Text style={[styles.textSecondary, { marginTop: 8, fontSize: 13 }]}>Chưa có hình ảnh nào</Text>
                <Text style={[styles.textSecondary, { fontSize: 12, marginTop: 4 }]}>Nhấn &quot;Cập nhật&quot; để thêm ảnh cho khách sạn</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal xác nhận xóa */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Trash2 size={24} color="#EF4444" />
              <Text style={styles.modalTitle}>Xác nhận xóa</Text>
            </View>
            <Text style={styles.modalMessage}>
              Bạn có chắc chắn muốn xóa khách sạn này không? {'\n'}Tất cả dữ liệu liên quan sẽ bị xóa.
            </Text>
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
    </View>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: isMobile ? '#FFF' : COLORS.background },
  scroll: { flex: 1, paddingHorizontal: isMobile ? 0 : 16, paddingBottom: isMobile ? 0 : 16 },
  mobilePageHeader: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  mobilePageTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  mobileHotelName: { fontSize: 16, fontWeight: '600', color: '#475569', marginBottom: 8 },
  mobileHeaderMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  starText: { fontSize: 12 },
  submitBtnMobile: { backgroundColor: '#0D9488', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6, marginLeft: 'auto' },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  pageTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  breadcrumb: { flexDirection: 'row', alignItems: 'center' },
  breadcrumbText: { fontSize: 13, color: COLORS.textSecondary },
  breadcrumbSeparator: { fontSize: 13, color: COLORS.textSecondary, marginHorizontal: 4 },
  breadcrumbActive: { fontSize: 13, color: COLORS.primary, fontWeight: '500' },
  mainCard: { marginTop: isMobile ? 0 : 16, backgroundColor: COLORS.card, borderRadius: isMobile ? 16 : 8, borderWidth: isMobile ? 0 : 1, borderColor: COLORS.border, overflow: 'hidden', ...(isMobile ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 } : Platform.select({ web: { boxShadow: '0 1px 3px rgba(0,0,0,0.05)' as any }, default: {} }) as any) },
  actionBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? 12 : 16, backgroundColor: isMobile ? COLORS.primaryLight : '#fafafa', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  editBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: isMobile ? 14 : 16, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.primary, borderRadius: isMobile ? 10 : 4, backgroundColor: '#fff' },
  editBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  contentSection: { padding: isMobile ? 16 : 24 },
  gridContainer: { flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 0 : 32 },
  gridColumn: { flex: 1, gap: isMobile ? 0 : 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: isMobile ? 12 : 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoLabel: { fontSize: isMobile ? 13 : 14, color: COLORS.textSecondary, fontWeight: '500', flex: 1 },
  infoValue: { fontSize: isMobile ? 13 : 14, color: COLORS.text, fontWeight: '600', textAlign: isMobile ? 'right' as const : undefined, flexShrink: 1, maxWidth: isMobile ? '55%' as any : undefined },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: isMobile ? 16 : 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: isMobile ? 12 : 16 },
  sectionTitle: { fontSize: isMobile ? 15 : 16, fontWeight: '700', color: COLORS.text, marginBottom: isMobile ? 12 : 16 },
  descriptionText: { fontSize: 14, color: COLORS.text, lineHeight: 22 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: { backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: '#99F6E4', borderRadius: isMobile ? 20 : 4, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 6 },
  amenityText: { fontSize: 13, color: COLORS.primary },
  textSecondary: { color: COLORS.textSecondary, fontSize: 14 },
  imageCountBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, borderWidth: 1, borderColor: '#99F6E4', marginLeft: 'auto' },
  imageCountText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  imageScrollContent: { paddingBottom: 4, gap: 10 },
  galleryImage: { width: isMobile ? 220 : 280, height: isMobile ? 160 : 200, borderRadius: 10, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: COLORS.border },
  noImagePlaceholder: { height: isMobile ? 140 : 180, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', borderRadius: 10, backgroundColor: '#FAFAFA' },
  submitBtn: { backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 4 },
  submitBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  emptyWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', ...(Platform.OS === 'web' ? { minHeight: '70vh' as any } : {}) },
  centerCreateBtn: { marginTop: 20, backgroundColor: '#0D9488', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12 },
  centerCreateText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400, alignItems: 'center', ...Platform.select({ web: { boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' as any }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 10 } }) },
  modalHeader: { alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginTop: 12 },
  modalMessage: { fontSize: 14, color: '#475569', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center' },
  modalCancelText: { color: '#475569', fontSize: 14, fontWeight: '600' },
  modalDeleteBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center' },
  modalDeleteText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
});
