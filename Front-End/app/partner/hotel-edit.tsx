import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Platform, Alert, Image, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useHotels } from '../../src/partner/hooks/useHotels';
import { useLocation } from '../../src/partner/hooks/useLocation';
import { Header } from '../../src/partner/components/Header';
import { SelectDropdown, SelectOption } from '../../src/partner/components/SelectDropdown';
import { ImageUploader } from '../../src/partner/components/ImageUploader';
import { amenityApi } from '../../src/partner/api/amenity.api';
import type { Amenity } from '../../src/partner/types/hotel.types';
import {
  ClipboardList, MapPin, ImageIcon, Hotel, Pencil, ArrowLeft,
  CheckSquare, Square, Sparkles,
} from 'lucide-react-native';

const isMobile = Platform.OS !== 'web';

// ============================================================
// Hotel Edit / Create Screen
// - Tích hợp API Tỉnh/Thành Việt Nam cho địa chỉ
// - Hỗ trợ upload ảnh sau khi tạo/cập nhật khách sạn
// - Hỗ trợ chọn tiện ích (Amenities)
// ============================================================

const PROPERTY_TYPES: SelectOption[] = [
  { label: 'Khách sạn', value: 'hotel' },
  { label: 'Homestay', value: 'homestay' },
  { label: 'Resort', value: 'resort' },
  { label: 'Nhà nghỉ', value: 'motel' },
  { label: 'Căn hộ', value: 'apartment' },
];

const STAR_OPTIONS: SelectOption[] = [
  { label: '1 ⭐', value: 1 },
  { label: '2 ⭐⭐', value: 2 },
  { label: '3 ⭐⭐⭐', value: 3 },
  { label: '4 ⭐⭐⭐⭐', value: 4 },
  { label: '5 ⭐⭐⭐⭐⭐', value: 5 },
];

const CATEGORY_LABELS: Record<string, string> = {
  general: 'Tổng quan',
  room: 'Phòng',
  bathroom: 'Phòng tắm',
  entertainment: 'Giải trí',
  safety: 'An ninh',
  service: 'Dịch vụ',
};

export default function HotelEditPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { currentHotel, createHotel, updateHotel, uploadHotelImages, loadHotel, isLoading } = useHotels(false);
  const isEdit = !!id;

  // ---- Location Hook ----
  const {
    provinces, districts, wards,
    loadingProvinces, loadingDistricts, loadingWards,
    fetchDistricts, fetchWards, resetDistricts, resetWards,
  } = useLocation();

  // ---- Amenities State ----
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<Set<string>>(new Set());
  const [loadingAmenities, setLoadingAmenities] = useState(false);

  // ---- Form State ----
  const [form, setForm] = useState({
    name: '',
    description: '',
    propertyType: 'hotel' as string,
    starRating: 3,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    addressLine: '',
    // Lưu cả code (để cascade API) lẫn name (để gửi payload)
    provinceCode: null as number | null,
    provinceName: '',
    districtCode: null as number | null,
    districtName: '',
    wardCode: null as number | null,
    wardName: '',
  });

  // Ảnh mới chọn từ máy, chưa upload
  const [pendingImages, setPendingImages] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ---- Load Amenities ----
  useEffect(() => {
    const loadAmenities = async () => {
      try {
        setLoadingAmenities(true);
        const data = await amenityApi.listAll();
        setAllAmenities(data);
      } catch (err) {
        console.warn('Failed to load amenities:', err);
      } finally {
        setLoadingAmenities(false);
      }
    };
    loadAmenities();
  }, []);

  // ---- Populate form khi Edit ----
  useEffect(() => {
    if (isEdit && id && !currentHotel) {
      loadHotel(id);
    }
  }, [isEdit, id]);

  useEffect(() => {
    if (isEdit && currentHotel) {
      setForm({
        name: currentHotel.name || '',
        description: currentHotel.description || '',
        propertyType: currentHotel.propertyType || 'hotel',
        starRating: currentHotel.starRating || 3,
        checkInTime: currentHotel.checkInTime || '14:00',
        checkOutTime: currentHotel.checkOutTime || '12:00',
        addressLine: currentHotel.address?.addressLine || '',
        provinceCode: null,
        provinceName: currentHotel.address?.province || currentHotel.address?.city || '',
        districtCode: null,
        districtName: currentHotel.address?.district || '',
        wardCode: null,
        wardName: currentHotel.address?.ward || '',
      });

      // Pre-select existing amenities
      if (currentHotel.hotelAmenities?.length) {
        const ids = new Set(currentHotel.hotelAmenities.map(ha => ha.amenity.id));
        setSelectedAmenityIds(ids);
      }
    }
  }, [isEdit, currentHotel]);

  // ---- Group amenities by category ----
  const groupedAmenities = useMemo(() => {
    const groups: Record<string, Amenity[]> = {};
    allAmenities.forEach((a) => {
      if (!groups[a.category]) groups[a.category] = [];
      groups[a.category].push(a);
    });
    return groups;
  }, [allAmenities]);

  // ---- Dropdown options mapping ----
  const provinceOptions = useMemo<SelectOption[]>(
    () => provinces.map((p) => ({ label: p.name, value: p.code })),
    [provinces],
  );
  const districtOptions = useMemo<SelectOption[]>(
    () => districts.map((d) => ({ label: d.name, value: d.code })),
    [districts],
  );
  const wardOptions = useMemo<SelectOption[]>(
    () => wards.map((w) => ({ label: w.name, value: w.code })),
    [wards],
  );

  // ---- Handlers ----
  const updateField = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleProvinceChange = (opt: SelectOption) => {
    updateField('provinceCode', opt.value);
    updateField('provinceName', opt.label);
    // Reset con
    updateField('districtCode', null);
    updateField('districtName', '');
    updateField('wardCode', null);
    updateField('wardName', '');
    resetDistricts();
    fetchDistricts(opt.value as number);
  };

  const handleDistrictChange = (opt: SelectOption) => {
    updateField('districtCode', opt.value);
    updateField('districtName', opt.label);
    updateField('wardCode', null);
    updateField('wardName', '');
    resetWards();
    fetchWards(opt.value as number);
  };

  const handleWardChange = (opt: SelectOption) => {
    updateField('wardCode', opt.value);
    updateField('wardName', opt.label);
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenityIds((prev) => {
      const next = new Set(prev);
      if (next.has(amenityId)) {
        next.delete(amenityId);
      } else {
        next.add(amenityId);
      }
      return next;
    });
  };

  // Chọn ảnh mới (chưa upload, chỉ lưu tạm)
  const handlePickImages = async (files: any[]) => {
    setPendingImages((prev) => [...prev, ...files]);
  };

  const removePendingImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ---- Submit ----
  const handleSubmit = async () => {
    // Validate cơ bản
    if (!form.name.trim()) {
      showAlert('Vui lòng nhập tên khách sạn');
      return;
    }
    if (!form.addressLine.trim() || form.addressLine.trim().length < 5) {
      showAlert('Địa chỉ phải có ít nhất 5 ký tự');
      return;
    }
    if (!form.provinceName) {
      showAlert('Vui lòng chọn Tỉnh/Thành phố');
      return;
    }
    if (!form.districtName) {
      showAlert('Vui lòng chọn Quận/Huyện');
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        propertyType: form.propertyType,
        starRating: form.starRating,
        checkInTime: form.checkInTime,
        checkOutTime: form.checkOutTime,
        address: {
          addressLine: form.addressLine.trim(),
          ward: form.wardName || undefined,
          district: form.districtName,
          city: form.provinceName,     // city = tên tỉnh/thành
          province: form.provinceName, // FIX: trường bắt buộc backend
          country: 'Vietnam',
        },
        amenityIds: Array.from(selectedAmenityIds),
      };

      let hotelResult;
      if (isEdit && id) {
        hotelResult = await updateHotel(id, payload);
      } else {
        hotelResult = await createHotel(payload);
      }

      // Upload ảnh nếu có
      if (pendingImages.length > 0 && hotelResult?.id) {
        try {
          setIsUploading(true);
          await uploadHotelImages(hotelResult.id, pendingImages);
        } catch {
          showAlert('Khách sạn đã được lưu nhưng upload ảnh thất bại. Bạn có thể thêm ảnh sau.');
        } finally {
          setIsUploading(false);
        }
      }

      router.back();
    } catch (err: any) {
      showAlert(err.message || 'Có lỗi xảy ra khi lưu khách sạn');
    } finally {
      setIsSaving(false);
    }
  };

  const showAlert = (msg: string) => {
    if (Platform.OS === 'web') alert(msg);
    else Alert.alert('Thông báo', msg);
  };

  const busy = isSaving || isUploading;

  return (
    <View style={s.container}>
      {isMobile ? (
        <View style={s.mobileBackHeader}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <ArrowLeft size={20} color="#1E293B" />
          </TouchableOpacity>
          <Text style={s.mobileBackTitle}>{isEdit ? 'Chỉnh sửa khách sạn' : 'Tạo khách sạn mới'}</Text>
        </View>
      ) : null}
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Page header (Web) */}
        {!isMobile && (
          <View style={s.pageHeader}>
            <View style={s.pageTitleRow}>
              <Hotel size={22} color="#0F172A" />
              <Text style={s.pageTitle}>{isEdit ? 'Chỉnh sửa khách sạn' : 'Tạo khách sạn mới'}</Text>
            </View>
            <Text style={s.pageSubtitle}>Điền đầy đủ thông tin để khách sạn được duyệt nhanh hơn</Text>
          </View>
        )}

        {/* === Thông tin cơ bản === */}
        <View style={s.formSection}>
          <View style={s.sectionTitleRow}>
            <ClipboardList size={18} color="#1E293B" />
            <Text style={s.sectionTitle}>Thông tin cơ bản</Text>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Tên khách sạn <Text style={s.required}>*</Text></Text>
            <TextInput
              style={s.input}
              value={form.name}
              onChangeText={(v) => updateField('name', v)}
              placeholder="Nhập tên khách sạn"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Mô tả</Text>
            <TextInput
              style={[s.input, s.textarea]}
              value={form.description}
              onChangeText={(v) => updateField('description', v)}
              placeholder="Mô tả về khách sạn, dịch vụ nổi bật..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <SelectDropdown
                label="Loại hình"
                options={PROPERTY_TYPES}
                value={form.propertyType}
                onChange={(opt) => updateField('propertyType', opt.value)}
                searchable={false}
              />
            </View>
            <View style={{ flex: 1 }}>
              <SelectDropdown
                label="Số sao"
                options={STAR_OPTIONS}
                value={form.starRating}
                onChange={(opt) => updateField('starRating', opt.value)}
                searchable={false}
              />
            </View>
          </View>

          <View style={s.row}>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>Giờ nhận phòng</Text>
              <TextInput
                style={s.input}
                value={form.checkInTime}
                onChangeText={(v) => updateField('checkInTime', v)}
                placeholder="14:00"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>Giờ trả phòng</Text>
              <TextInput
                style={s.input}
                value={form.checkOutTime}
                onChangeText={(v) => updateField('checkOutTime', v)}
                placeholder="12:00"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
        </View>

        {/* === Địa chỉ === */}
        <View style={s.formSection}>
          <View style={s.sectionTitleRow}>
            <MapPin size={18} color="#1E293B" />
            <Text style={s.sectionTitle}>Địa chỉ</Text>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Địa chỉ chi tiết <Text style={s.required}>*</Text></Text>
            <TextInput
              style={s.input}
              value={form.addressLine}
              onChangeText={(v) => updateField('addressLine', v)}
              placeholder="Số nhà, tên đường..."
              placeholderTextColor="#94A3B8"
            />
          </View>

          <SelectDropdown
            label="Tỉnh / Thành phố"
            required
            placeholder="Chọn Tỉnh/Thành phố..."
            options={provinceOptions}
            value={form.provinceCode}
            onChange={handleProvinceChange}
            loading={loadingProvinces}
          />

          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <SelectDropdown
                label="Quận / Huyện"
                required
                placeholder="Chọn Quận/Huyện..."
                options={districtOptions}
                value={form.districtCode}
                onChange={handleDistrictChange}
                loading={loadingDistricts}
                disabled={!form.provinceCode}
              />
            </View>
            <View style={{ flex: 1 }}>
              <SelectDropdown
                label="Phường / Xã"
                placeholder="Chọn Phường/Xã..."
                options={wardOptions}
                value={form.wardCode}
                onChange={handleWardChange}
                loading={loadingWards}
                disabled={!form.districtCode}
              />
            </View>
          </View>
        </View>

        {/* === Tiện ích (Amenities) === */}
        <View style={s.formSection}>
          <View style={s.sectionTitleRow}>
            <Sparkles size={18} color="#1E293B" />
            <Text style={s.sectionTitle}>Tiện ích</Text>
            <View style={s.selectedBadge}>
              <Text style={s.selectedBadgeText}>{selectedAmenityIds.size} đã chọn</Text>
            </View>
          </View>
          <Text style={s.sectionHint}>Chọn các tiện ích mà khách sạn của bạn cung cấp</Text>

          {loadingAmenities ? (
            <ActivityIndicator size="small" color="#008080" style={{ padding: 20 }} />
          ) : (
            Object.entries(groupedAmenities).map(([category, amenities]) => (
              <View key={category} style={s.amenityCategory}>
                <Text style={s.categoryLabel}>{CATEGORY_LABELS[category] || category}</Text>
                <View style={s.amenityGrid}>
                  {amenities.map((amenity) => {
                    const isSelected = selectedAmenityIds.has(amenity.id);
                    return (
                      <TouchableOpacity
                        key={amenity.id}
                        style={[s.amenityItem, isSelected && s.amenityItemSelected]}
                        onPress={() => toggleAmenity(amenity.id)}
                      >
                        {isSelected ? (
                          <CheckSquare size={16} color="#008080" />
                        ) : (
                          <Square size={16} color="#94A3B8" />
                        )}
                        <Text style={[s.amenityLabel, isSelected && s.amenityLabelSelected]}>
                          {amenity.icon || '•'} {amenity.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </View>

        {/* === Hình ảnh === */}
        <View style={s.formSection}>
          <View style={s.sectionTitleRow}>
            <ImageIcon size={18} color="#1E293B" />
            <Text style={s.sectionTitle}>Hình ảnh</Text>
          </View>
          <Text style={s.sectionHint}>
            {isEdit
              ? 'Thêm ảnh mới hoặc xem ảnh hiện tại'
              : 'Chọn ảnh trước, ảnh sẽ được tải lên sau khi tạo khách sạn'}
          </Text>

          {/* Ảnh hiện tại (chế độ Edit) */}
          {isEdit && currentHotel?.images && currentHotel.images.length > 0 && (
            <View style={s.existingImages}>
              <Text style={s.existingImagesTitle}>Ảnh hiện tại ({currentHotel.images.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {currentHotel.images.map((img) => (
                  <Image key={img.id} source={{ uri: img.imageUrl }} style={s.galleryImage} />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Chọn ảnh mới */}
          <ImageUploader onUpload={handlePickImages} isUploading={false} multiple />

          {/* Preview ảnh đã chọn */}
          {pendingImages.length > 0 && (
            <View style={s.pendingSection}>
              <Text style={s.pendingTitle}>Ảnh mới đã chọn ({pendingImages.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {pendingImages.map((file, index) => {
                  const uri = file.uri || (typeof file === 'string' ? file : URL.createObjectURL(file));
                  return (
                    <View key={index} style={s.pendingImageWrapper}>
                      <Image source={{ uri }} style={s.pendingImage} />
                      <TouchableOpacity style={s.removeBtn} onPress={() => removePendingImage(index)}>
                        <Text style={s.removeBtnText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>

        {/* === Actions === */}
        <View style={s.actions}>
          <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()} disabled={busy}>
            <Text style={s.cancelBtnText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.submitBtn, busy && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={busy}
          >
            {busy ? (
              <View style={s.busyRow}>
                <ActivityIndicator size="small" color="#FFF" />
                <Text style={s.submitBtnText}>
                  {isUploading ? 'Đang tải ảnh...' : 'Đang lưu...'}
                </Text>
              </View>
            ) : (
              <View style={s.busyRow}>
                {isEdit ? <Pencil size={16} color="#FFF" /> : <Hotel size={16} color="#FFF" />}
                <Text style={s.submitBtnText}>{isEdit ? 'Cập nhật' : 'Tạo khách sạn'}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: isMobile ? '#FFF' : '#F8FAFC' },
  scroll: { flex: 1 },
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
  mobileBackTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },

  // Header (Web)
  pageHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  pageTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  pageSubtitle: { fontSize: 13, color: '#94A3B8', marginTop: 4, marginLeft: 32 },

  // Form
  formSection: {
    marginHorizontal: isMobile ? 16 : 20,
    marginTop: isMobile ? 16 : 20,
    backgroundColor: '#FFF',
    borderRadius: isMobile ? 16 : 14,
    padding: isMobile ? 16 : 20,
    borderWidth: isMobile ? 0 : 1,
    borderColor: '#E2E8F0',
    ...(isMobile ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 } : {}),
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  sectionHint: { fontSize: 12, color: '#94A3B8', marginBottom: 14, marginTop: -8 },

  field: { marginBottom: 14 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  required: { color: '#EF4444' },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#1E293B',
  },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  row: { flexDirection: isMobile ? 'column' : 'row', gap: 12 },

  // Amenities
  selectedBadge: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginLeft: 'auto',
  },
  selectedBadgeText: { fontSize: 11, color: '#0F766E', fontWeight: '700' },
  amenityCategory: { marginBottom: 18 },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  amenityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FAFAFA',
    minWidth: 140,
  },
  amenityItemSelected: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  amenityLabel: { fontSize: 13, color: '#64748B' },
  amenityLabelSelected: { color: '#0F766E', fontWeight: '600' },

  // Existing images (edit mode)
  existingImages: { marginBottom: 14 },
  existingImagesTitle: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8 },
  galleryImage: { width: 100, height: 75, borderRadius: 10, marginRight: 8, backgroundColor: '#E2E8F0' },

  // Pending images (preview)
  pendingSection: { marginTop: 14 },
  pendingTitle: { fontSize: 13, fontWeight: '600', color: '#008080', marginBottom: 8 },
  pendingImageWrapper: { position: 'relative', marginRight: 8 },
  pendingImage: { width: 100, height: 75, borderRadius: 10, backgroundColor: '#E2E8F0' },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { color: '#FFF', fontSize: 11, fontWeight: '700' },

  // Actions
  actions: { flexDirection: 'row', gap: 12, marginHorizontal: 20, marginTop: 24 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: { color: '#64748B', fontSize: 14, fontWeight: '700' },
  submitBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#008080',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  busyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
