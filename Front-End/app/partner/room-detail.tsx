import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, RefreshControl, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRooms } from '../../src/partner/hooks/useRooms';
import { Header } from '../../src/partner/components/Header';
import { StatusBadge } from '../../src/partner/components/StatusBadge';
import { LoadingSpinner, EmptyState } from '../../src/partner/components/LoadingSpinner';
import { ImageUploader } from '../../src/partner/components/ImageUploader';
import { ConfirmModal } from '../../src/partner/components/ConfirmModal';
import { roomApi } from '../../src/partner/api/room.api';
import type { RoomType, RoomUnit, RoomMedia } from '../../src/partner/types/room.types';
import {
  ArrowLeft, Pencil, Trash2, Users, BedDouble,
  Maximize, DoorOpen, ImagePlus, Plus, X,
} from 'lucide-react-native';

const isMobile = Platform.OS !== 'web';

export default function RoomDetailPage() {
  const { hotelId, roomTypeId } = useLocalSearchParams<{ hotelId: string; roomTypeId: string }>();
  const router = useRouter();
  
  const { roomTypes, fetchRoomTypes, deleteRoomType } = useRooms(hotelId || '');
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  
  const [units, setUnits] = useState<RoomUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Modal states
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newUnit, setNewUnit] = useState({ roomNumber: '', floor: '', notes: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadData = async () => {
    try {
      const typeData = await roomApi.getRoomType(hotelId, roomTypeId);
      setRoomType(typeData);
      
      const unitsData = await roomApi.listUnits(hotelId, roomTypeId);
      setUnits(unitsData);
    } catch (err: any) {
      if (Platform.OS === 'web') alert(err.message);
      else Alert.alert('Lỗi', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hotelId && roomTypeId) {
      loadData();
    }
  }, [hotelId, roomTypeId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddUnit = async () => {
    try {
      if (!newUnit.roomNumber) return;
      await roomApi.createUnit(hotelId, roomTypeId, {
        roomNumber: newUnit.roomNumber,
        floor: newUnit.floor ? parseInt(newUnit.floor) : undefined,
        notes: newUnit.notes,
      });
      setNewUnit({ roomNumber: '', floor: '', notes: '' });
      setShowAddUnit(false);
      await loadData();
    } catch (err: any) {
      if (Platform.OS === 'web') alert(err.message);
      else Alert.alert('Lỗi', err.message);
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    try {
      await roomApi.deleteUnit(hotelId, roomTypeId, unitId);
      await loadData();
    } catch (err: any) {
      if (Platform.OS === 'web') alert(err.message);
      else Alert.alert('Lỗi', err.message);
    }
  };

  const handleUploadMedia = async (files: any[]) => {
    try {
      setIsUploading(true);
      await roomApi.uploadMedia(hotelId, roomTypeId, files);
      await loadData();
    } catch (err: any) {
      if (Platform.OS === 'web') alert('Lỗi tải ảnh: ' + err.message);
      else Alert.alert('Lỗi', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      await roomApi.deleteMedia(hotelId, roomTypeId, mediaId);
      await loadData();
    } catch (err: any) {
      if (Platform.OS === 'web') alert(err.message);
      else Alert.alert('Lỗi', err.message);
    }
  };

  const handleDeleteRoomType = async () => {
    try {
      await deleteRoomType(roomTypeId);
      router.back();
    } catch (err: any) {
      if (Platform.OS === 'web') alert(err.message);
      else Alert.alert('Lỗi', err.message);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!roomType) return <EmptyState title="Không tìm thấy loại phòng" />;

  return (
    <View style={styles.container}>
      {isMobile ? (
        <View style={styles.mobileBackHeader}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <ArrowLeft size={20} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.mobileBackTitle} numberOfLines={1}>{roomType.name}</Text>
          <View style={styles.mobileHeaderActions}>
            <TouchableOpacity style={styles.mobileActionBtn} onPress={() => {}}>
              <Pencil size={16} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mobileDeleteActionBtn} onPress={() => setShowDeleteConfirm(true)}>
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.pageHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={16} color="#64748B" />
            <Text style={styles.backText}>Quay lại</Text>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.editBtn} onPress={() => {}}>
              <Pencil size={14} color="#334155" />
              <Text style={styles.editBtnText}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => setShowDeleteConfirm(true)}>
              <Trash2 size={14} color="#DC2626" />
              <Text style={styles.deleteBtnText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView 
        style={styles.scroll} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#008080']} />}
      >
        {/* Basic Info */}
        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Text style={styles.roomName}>{roomType.name}</Text>
            <StatusBadge status={roomType.status} />
          </View>
          {roomType.description ? <Text style={styles.description}>{roomType.description}</Text> : null}
          
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <View style={styles.metaIconRow}>
                <Users size={14} color="#94A3B8" />
                <Text style={styles.metaLabel}>Sức chứa</Text>
              </View>
              <Text style={styles.metaValue}>{roomType.maxGuests} người</Text>
            </View>
            <View style={styles.metaItem}>
              <View style={styles.metaIconRow}>
                <BedDouble size={14} color="#94A3B8" />
                <Text style={styles.metaLabel}>Giường</Text>
              </View>
              <Text style={styles.metaValue}>{roomType.bedType || 'N/A'}</Text>
            </View>
            <View style={styles.metaItem}>
              <View style={styles.metaIconRow}>
                <Maximize size={14} color="#94A3B8" />
                <Text style={styles.metaLabel}>Diện tích</Text>
              </View>
              <Text style={styles.metaValue}>{roomType.roomSizeSqm ? `${roomType.roomSizeSqm}m²` : 'N/A'}</Text>
            </View>
            <View style={styles.metaItem}>
              <View style={styles.metaIconRow}>
                <DoorOpen size={14} color="#94A3B8" />
                <Text style={styles.metaLabel}>Phòng trống / Tổng</Text>
              </View>
              <Text style={styles.metaValue}>{units.filter(u => u.status === 'available').length} / {roomType.totalUnits}</Text>
            </View>
          </View>
        </View>

        {/* Media Section */}
        <View style={styles.section}>
          <View style={styles.titleRow}>
            <View style={styles.sectionTitleRow}>
              <ImagePlus size={16} color="#1E293B" />
              <Text style={styles.sectionTitle}>Hình ảnh & Video</Text>
            </View>
          </View>
          <ImageUploader onUpload={handleUploadMedia} isUploading={isUploading} multiple={true} />
          
          {roomType.media && roomType.media.length > 0 ? (
            <View style={styles.mediaGrid}>
              {roomType.media.map((item) => (
                <View key={item.id} style={styles.mediaItem}>
                  {/* Using standard View/Text for placeholder if image component fails, you could use Image here */}
                  <View style={styles.mediaPlaceholder}>
                     <Text style={styles.mediaPlaceholderText}>Hình {item.sortOrder}</Text>
                  </View>
                  <TouchableOpacity style={styles.deleteMediaBtn} onPress={() => handleDeleteMedia(item.id)}>
                    <X size={12} color="#FFF" />
                  </TouchableOpacity>
                  {item.isCover && <View style={styles.coverBadge}><Text style={styles.coverText}>Ảnh bìa</Text></View>}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Chưa có hình ảnh nào. Tải lên để thu hút khách hàng.</Text>
          )}
        </View>

        {/* Units Section */}
        <View style={styles.section}>
          <View style={styles.titleRow}>
            <View style={styles.sectionTitleRow}>
              <DoorOpen size={16} color="#1E293B" />
              <Text style={styles.sectionTitle}>Danh sách phòng ({units.length}/{roomType.totalUnits})</Text>
            </View>
            <TouchableOpacity style={styles.addUnitBtn} onPress={() => setShowAddUnit(!showAddUnit)}>
              {showAddUnit ? (
                <Text style={styles.addUnitText}>Đóng form</Text>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Plus size={12} color="#0F766E" />
                  <Text style={styles.addUnitText}>Thêm phòng</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {showAddUnit && (
            <View style={styles.addUnitForm}>
              <TextInput 
                style={styles.input} 
                placeholder="Số phòng (VD: 101)" 
                value={newUnit.roomNumber} 
                onChangeText={v => setNewUnit({...newUnit, roomNumber: v})} 
              />
              <TextInput 
                style={styles.input} 
                placeholder="Tầng (Tùy chọn)" 
                keyboardType="numeric" 
                value={newUnit.floor} 
                onChangeText={v => setNewUnit({...newUnit, floor: v})} 
              />
              <TextInput 
                style={styles.input} 
                placeholder="Ghi chú (Tùy chọn)" 
                value={newUnit.notes} 
                onChangeText={v => setNewUnit({...newUnit, notes: v})} 
              />
              <TouchableOpacity style={styles.saveUnitBtn} onPress={handleAddUnit}>
                <Text style={styles.saveUnitText}>Lưu phòng</Text>
              </TouchableOpacity>
            </View>
          )}

          {units.length > 0 ? (
            <View style={styles.unitsList}>
              {units.map((unit) => (
                <View key={unit.id} style={styles.unitCard}>
                  <View style={styles.unitLeft}>
                    <Text style={styles.unitNumber}>Phòng {unit.roomNumber}</Text>
                    {unit.floor && <Text style={styles.unitFloor}>Tầng {unit.floor}</Text>}
                    {unit.notes && <Text style={styles.unitNotes}>{unit.notes}</Text>}
                  </View>
                  <View style={styles.unitRight}>
                    <StatusBadge status={unit.status} size="sm" />
                    <TouchableOpacity style={styles.deleteUnitBtn} onPress={() => handleDeleteUnit(unit.id)}>
                      <Trash2 size={14} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Chưa có phòng nào được tạo.</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <ConfirmModal
        visible={showDeleteConfirm}
        title="Xóa loại phòng"
        message={`Bạn có chắc chắn muốn xóa loại phòng "${roomType.name}"? Hành động này không thể hoàn tác.`}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteRoomType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: isMobile ? '#FFF' : '#F8FAFC' },
  mobileBackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  mobileBackTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', flex: 1 },
  mobileHeaderActions: { flexDirection: 'row', gap: 8 },
  mobileActionBtn: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 8 },
  mobileDeleteActionBtn: { padding: 8, backgroundColor: '#FEF2F2', borderRadius: 8 },
  pageHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    backgroundColor: '#FFF',
    borderBottomWidth: 1, 
    borderBottomColor: '#E2E8F0' 
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 4 },
  backText: { color: '#64748B', fontSize: 14, fontWeight: '600' },
  headerRight: { flexDirection: 'row', gap: 10 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#F1F5F9', borderRadius: 8 },
  editBtnText: { color: '#334155', fontSize: 13, fontWeight: '600' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FEE2E2', borderRadius: 8 },
  deleteBtnText: { color: '#DC2626', fontSize: 13, fontWeight: '600' },
  scroll: { flex: 1 },
  section: { 
    marginHorizontal: isMobile ? 16 : 20, 
    marginTop: isMobile ? 16 : 20, 
    backgroundColor: '#FFF', 
    borderRadius: isMobile ? 16 : 14, 
    padding: isMobile ? 16 : 20, 
    borderWidth: isMobile ? 0 : 1, 
    borderColor: '#E2E8F0',
    ...(isMobile ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 } : {}),
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roomName: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  description: { fontSize: 14, color: '#64748B', marginBottom: 16, lineHeight: 22 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  metaItem: { 
    backgroundColor: '#F8FAFC', 
    borderRadius: 10, 
    padding: 12, 
    width: '48%',
    ...Platform.select({ web: { width: 'calc(50% - 6px)' as any }, default: {} })
  },
  metaIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  metaLabel: { fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', fontWeight: '600' },
  metaValue: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  mediaItem: { width: 100, height: 100, borderRadius: 8, backgroundColor: '#E2E8F0', overflow: 'hidden', position: 'relative' },
  mediaPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mediaPlaceholderText: { fontSize: 12, color: '#94A3B8' },
  deleteMediaBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  coverBadge: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,128,128,0.8)', paddingVertical: 4 },
  coverText: { color: '#FFF', fontSize: 10, textAlign: 'center', fontWeight: 'bold' },
  addUnitBtn: { backgroundColor: '#F0FDFA', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#CCFBF1' },
  addUnitText: { color: '#0F766E', fontSize: 12, fontWeight: '600' },
  addUnitForm: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 10, marginBottom: 16, gap: 10 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  saveUnitBtn: { backgroundColor: '#008080', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  saveUnitText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  unitsList: { gap: 10 },
  unitCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  unitLeft: { flex: 1 },
  unitNumber: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  unitFloor: { fontSize: 12, color: '#64748B' },
  unitNotes: { fontSize: 12, color: '#94A3B8', marginTop: 2, fontStyle: 'italic' },
  unitRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deleteUnitBtn: { padding: 6 },
  emptyCard: { padding: 20, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  emptyText: { color: '#94A3B8', fontSize: 13 },
});
