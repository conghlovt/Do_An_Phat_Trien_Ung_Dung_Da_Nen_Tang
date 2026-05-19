import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, Image, ActivityIndicator, Modal } from 'react-native';
import { useLocation } from '../../hooks/useLocation';
import { SelectDropdown, SelectOption, SelectDropdownRef } from '../shared/SelectDropdown';
import { ImageUploader } from '../shared/ImageUploader';
import { partnerService } from '../../services/partner.service';
import type { Hotel, Amenity } from '../../services/partner.service';
import { ClipboardList, MapPin, ImageIcon, Hotel as HotelIcon, Pencil, ArrowLeft, CheckSquare, Square, Sparkles, Trash2 } from 'lucide-react-native';

const isMobile = Platform.OS !== 'web';

const PROPERTY_TYPES: SelectOption[] = [
  { label: 'Khách sạn', value: 'hotel' },
  { label: 'Homestay', value: 'homestay' },
  { label: 'Resort', value: 'resort' },
  { label: 'Nhà nghỉ', value: 'motel' },
  { label: 'Căn hộ', value: 'apartment' },
];

const STAR_OPTIONS: SelectOption[] = [
  { label: '1 ⭐', value: 1 }, { label: '2 ⭐⭐', value: 2 },
  { label: '3 ⭐⭐⭐', value: 3 }, { label: '4 ⭐⭐⭐⭐', value: 4 },
  { label: '5 ⭐⭐⭐⭐⭐', value: 5 },
];

const CATEGORY_LABELS: Record<string, string> = {
  general: 'Tổng quan', room: 'Phòng', bathroom: 'Phòng tắm',
  entertainment: 'Giải trí', safety: 'An ninh', service: 'Dịch vụ',
};

interface Props {
  /** Existing hotel id to edit; undefined = create new */
  hotelId?: string;
  onBack?: () => void;
}

export function HotelEditForm({ hotelId: editHotelId, onBack }: Props) {
  const isEdit = !!editHotelId;

  const [currentHotel, setCurrentHotel] = useState<Hotel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [isDeletingImage, setIsDeletingImage] = useState(false);

  const nameRef = useRef<TextInput>(null);
  const addressLineRef = useRef<TextInput>(null);
  const provinceRef = useRef<SelectDropdownRef>(null);
  const districtRef = useRef<SelectDropdownRef>(null);
  const wardRef = useRef<SelectDropdownRef>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const clearError = (key: string) => setErrors(prev => ({ ...prev, [key]: '' }));

  const { provinces, districts, wards, loadingProvinces, loadingDistricts, loadingWards, fetchDistricts, fetchWards, resetDistricts, resetWards } = useLocation();

  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<Set<string>>(new Set());
  const [loadingAmenities, setLoadingAmenities] = useState(false);
  const [pendingImages, setPendingImages] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: '', description: '', propertyType: 'hotel' as string, starRating: 3,
    checkInTime: '14:00', checkOutTime: '12:00', addressLine: '',
    provinceCode: null as number | null, provinceName: '',
    districtCode: null as number | null, districtName: '',
    wardCode: null as number | null, wardName: '',
  });
  const [checkInHour, setCheckInHour] = useState('14');
  const [checkInMinute, setCheckInMinute] = useState('00');
  const [checkOutHour, setCheckOutHour] = useState('12');
  const [checkOutMinute, setCheckOutMinute] = useState('00');

  // Load amenities
  useEffect(() => {
    setLoadingAmenities(true);
    partnerService.getAmenities()
      .then(setAllAmenities)
      .catch(err => console.warn('Failed to load amenities:', err))
      .finally(() => setLoadingAmenities(false));
  }, []);

  // Load hotel for edit
  useEffect(() => {
    if (isEdit && editHotelId) {
      setIsLoading(true);
      partnerService.getHotel(editHotelId).then(h => { setCurrentHotel(h); setIsLoading(false); });
    }
  }, [isEdit, editHotelId]);

  // Populate form when hotel loaded
  useEffect(() => {
    if (isEdit && currentHotel) {
      const [h1 = '14', m1 = '00'] = (currentHotel.checkInTime || '14:00').split(':');
      const [h2 = '12', m2 = '00'] = (currentHotel.checkOutTime || '12:00').split(':');
      setCheckInHour(h1); setCheckInMinute(m1);
      setCheckOutHour(h2); setCheckOutMinute(m2);
      
      const provName = currentHotel.address?.province || currentHotel.address?.city || '';
      const distName = currentHotel.address?.district || '';
      const wardName = currentHotel.address?.ward || '';
      
      setForm({
        name: currentHotel.name || '',
        description: currentHotel.description || '',
        propertyType: currentHotel.propertyType || 'hotel',
        starRating: currentHotel.starRating || 3,
        checkInTime: currentHotel.checkInTime || '14:00',
        checkOutTime: currentHotel.checkOutTime || '12:00',
        addressLine: currentHotel.address?.addressLine || '',
        provinceCode: null, provinceName: provName,
        districtCode: null, districtName: distName,
        wardCode: null, wardName: wardName,
      });
      if (currentHotel.hotelAmenities?.length) {
        setSelectedAmenityIds(new Set(currentHotel.hotelAmenities.map(ha => ha.amenity.id)));
      }
    }
  }, [isEdit, currentHotel]);

  // Auto-map loaded address strings to codes
  useEffect(() => {
    if (isEdit && currentHotel && provinces.length > 0 && form.provinceCode === null && form.provinceName) {
      const p = provinces.find(x => x.name === form.provinceName || form.provinceName.includes(x.name) || x.name.includes(form.provinceName));
      if (p) {
        setForm(prev => ({ ...prev, provinceCode: p.code, provinceName: p.name }));
        fetchDistricts(p.code);
      }
    }
  }, [isEdit, currentHotel, provinces, form.provinceCode, form.provinceName]);

  useEffect(() => {
    if (isEdit && currentHotel && districts.length > 0 && form.districtCode === null && form.districtName) {
      const d = districts.find(x => x.name === form.districtName || form.districtName.includes(x.name) || x.name.includes(form.districtName));
      if (d) {
        setForm(prev => ({ ...prev, districtCode: d.code, districtName: d.name }));
        fetchWards(d.code);
      }
    }
  }, [isEdit, currentHotel, districts, form.districtCode, form.districtName]);

  useEffect(() => {
    if (isEdit && currentHotel && wards.length > 0 && form.wardCode === null && form.wardName) {
      const w = wards.find(x => x.name === form.wardName || form.wardName.includes(x.name) || x.name.includes(form.wardName));
      if (w) {
        setForm(prev => ({ ...prev, wardCode: w.code, wardName: w.name }));
      }
    }
  }, [isEdit, currentHotel, wards, form.wardCode, form.wardName]);

  const groupedAmenities = useMemo(() => {
    const groups: Record<string, Amenity[]> = {};
    allAmenities.forEach(a => { if (!groups[a.category]) groups[a.category] = []; groups[a.category].push(a); });
    return groups;
  }, [allAmenities]);

  const provinceOptions = useMemo<SelectOption[]>(() => provinces.map(p => ({ label: p.name, value: p.code })), [provinces]);
  const districtOptions = useMemo<SelectOption[]>(() => districts.map(d => ({ label: d.name, value: d.code })), [districts]);
  const wardOptions = useMemo<SelectOption[]>(() => wards.map(w => ({ label: w.name, value: w.code })), [wards]);

  const updateField = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const handleProvinceChange = (opt: SelectOption) => {
    updateField('provinceCode', opt.value); updateField('provinceName', opt.label);
    updateField('districtCode', null); updateField('districtName', '');
    updateField('wardCode', null); updateField('wardName', '');
    clearError('provinceCode');
    resetDistricts(); fetchDistricts(opt.value as number);
  };
  const handleDistrictChange = (opt: SelectOption) => {
    updateField('districtCode', opt.value); updateField('districtName', opt.label);
    updateField('wardCode', null); updateField('wardName', '');
    clearError('districtCode');
    resetWards(); fetchWards(opt.value as number);
  };
  const handleWardChange = (opt: SelectOption) => { updateField('wardCode', opt.value); updateField('wardName', opt.label); clearError('wardCode'); };
  const toggleAmenity = (id: string) => setSelectedAmenityIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const handlePickImages = async (files: any[]) => {
    setPendingImages(prev => [...prev, ...files]);
    clearError('images');
  };
  const removePendingImage = (index: number) => setPendingImages(prev => prev.filter((_, i) => i !== index));

  const showAlert = (msg: string) => setErrorMsg(msg);

  const confirmDeleteImage = async () => {
    if (!imageToDelete || !currentHotel?.id) return;
    try {
      setIsDeletingImage(true);
      await partnerService.deleteHotelImage(currentHotel.id, imageToDelete);
      setCurrentHotel(prev => prev ? { ...prev, images: prev.images.filter(img => img.id !== imageToDelete) } : prev);
      setImageToDelete(null);
    } catch (err: any) {
      showAlert(err.message || 'Có lỗi xảy ra khi xóa ảnh');
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setErrors({});
    
    let hasError = false;
    let newErrors: Record<string, string> = {};

    if (!form.name.trim()) { newErrors.name = 'Vui lòng nhập tên khách sạn'; hasError = true; }
    if (!form.addressLine.trim() || form.addressLine.trim().length < 5) { newErrors.addressLine = 'Địa chỉ phải có ít nhất 5 ký tự'; hasError = true; }
    if (!form.provinceCode) { newErrors.provinceCode = 'Vui lòng chọn Tỉnh/Thành phố'; hasError = true; }
    if (!form.districtCode) { newErrors.districtCode = 'Vui lòng chọn Quận/Huyện'; hasError = true; }
    if (!form.wardCode) { newErrors.wardCode = 'Vui lòng chọn Phường/Xã'; hasError = true; }
    
    const totalImages = (currentHotel?.images?.length || 0) + pendingImages.length;
    if (totalImages < 3) { newErrors.images = 'Vui lòng chọn ít nhất 3 hình ảnh'; hasError = true; }

    if (hasError) {
      setErrors(newErrors);
      if (newErrors.name) { 
        nameRef.current?.focus(); 
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } else if (newErrors.addressLine) { 
        addressLineRef.current?.focus(); 
        scrollViewRef.current?.scrollTo({ y: 150, animated: true });
      } else if (newErrors.provinceCode) { 
        provinceRef.current?.focus(); 
        scrollViewRef.current?.scrollTo({ y: 250, animated: true });
      } else if (newErrors.districtCode) { 
        districtRef.current?.focus(); 
        scrollViewRef.current?.scrollTo({ y: 300, animated: true });
      } else if (newErrors.wardCode) { 
        wardRef.current?.focus(); 
        scrollViewRef.current?.scrollTo({ y: 300, animated: true });
      } else if (newErrors.images) {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
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
          city: form.provinceName,
          province: form.provinceName,
          country: 'Vietnam',
        },
        amenityIds: Array.from(selectedAmenityIds),
      };

      let hotelResult: Hotel;
      if (isEdit && editHotelId) {
        hotelResult = await partnerService.updateHotel(editHotelId, payload);
      } else {
        hotelResult = await partnerService.createHotel(payload);
      }

      if (pendingImages.length > 0 && hotelResult?.id) {
        try {
          setIsUploading(true);
          await partnerService.uploadHotelImages(hotelResult.id, pendingImages);
        } catch {
          showAlert('Khách sạn đã được lưu nhưng upload ảnh thất bại. Bạn có thể thêm ảnh sau.');
        } finally {
          setIsUploading(false);
        }
      }
      setSuccessMsg(isEdit ? 'Cập nhật khách sạn thành công!' : 'Tạo khách sạn thành công!');
      setTimeout(() => {
        setSuccessMsg('');
        onBack?.();
      }, 1500);
    } catch (err: any) {
      showAlert(err.message || 'Có lỗi xảy ra khi lưu khách sạn');
    } finally {
      setIsSaving(false);
    }
  };

  const busy = isSaving || isUploading;

  return (
    <View style={s.container}>
      {isMobile ? (
        <View style={s.mobileBackHeader}>
          <TouchableOpacity onPress={() => onBack?.()} style={{ padding: 4 }}><ArrowLeft size={20} color="#1E293B" /></TouchableOpacity>
          <Text style={s.mobileBackTitle}>{isEdit ? 'Chỉnh sửa khách sạn' : 'Tạo khách sạn mới'}</Text>
        </View>
      ) : null}
      <ScrollView ref={scrollViewRef} style={s.scroll} showsVerticalScrollIndicator={false}>
        {!isMobile && (
          <View style={s.pageHeader}>
            <View style={s.pageTitleRow}>
              <HotelIcon size={22} color="#0F172A" />
              <Text style={s.pageTitle}>{isEdit ? 'Chỉnh sửa khách sạn' : 'Tạo khách sạn mới'}</Text>
            </View>
            <Text style={s.pageSubtitle}>Điền đầy đủ thông tin để được duyệt nhanh hơn</Text>
          </View>
        )}

        {/* Error/Success Messages at top (only for API errors/success now) */}
        {errorMsg ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{errorMsg}</Text>
          </View>
        ) : null}
        {successMsg ? (
          <View style={s.successBox}>
            <Text style={s.successText}>{successMsg}</Text>
          </View>
        ) : null}

        {/* Thông tin cơ bản */}
        <View style={s.formSection}>
          <View style={s.sectionTitleRow}><ClipboardList size={18} color="#1E293B" /><Text style={s.sectionTitle}>Thông tin cơ bản</Text></View>
          <View style={s.field}>
            <Text style={s.label}>Tên khách sạn <Text style={s.required}>*</Text></Text>
            <TextInput ref={nameRef} style={[s.input, errors.name ? s.inputError : null]} value={form.name} onChangeText={v => { updateField('name', v); clearError('name'); }} placeholder="Nhập tên khách sạn" placeholderTextColor="#94A3B8" />
            {errors.name ? <Text style={s.fieldErrorText}>{errors.name}</Text> : null}
          </View>
          <View style={s.field}>
            <Text style={s.label}>Mô tả</Text>
            <TextInput style={[s.input, s.textarea]} value={form.description} onChangeText={v => updateField('description', v)} placeholder="Mô tả về khách sạn..." placeholderTextColor="#94A3B8" multiline numberOfLines={4} />
          </View>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <SelectDropdown label="Loại hình" options={PROPERTY_TYPES} value={form.propertyType} onChange={opt => updateField('propertyType', opt.value)} searchable={false} />
            </View>
            <View style={{ flex: 1 }}>
              <SelectDropdown label="Số sao" options={STAR_OPTIONS} value={form.starRating} onChange={opt => updateField('starRating', opt.value)} searchable={false} />
            </View>
          </View>
          <View style={s.row}>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>Giờ nhận phòng</Text>
              <View style={s.timeRow}>
                <TextInput style={s.timeInput} value={checkInHour} onChangeText={v => { if (isNaN(Number(v))) return; setCheckInHour(v); let h = Number(v); if (h > 23) h = 23; if (h < 0) h = 0; updateField('checkInTime', `${h.toString().padStart(2,'0')}:${checkInMinute}`); }} keyboardType="numeric" maxLength={2} placeholder="HH" />
                <Text style={s.timeColon}>:</Text>
                <TextInput style={s.timeInput} value={checkInMinute} onChangeText={v => { if (isNaN(Number(v))) return; setCheckInMinute(v); let m = Number(v); if (m > 59) m = 59; if (m < 0) m = 0; updateField('checkInTime', `${checkInHour}:${m.toString().padStart(2,'0')}`); }} keyboardType="numeric" maxLength={2} placeholder="MM" />
              </View>
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>Giờ trả phòng</Text>
              <View style={s.timeRow}>
                <TextInput style={s.timeInput} value={checkOutHour} onChangeText={v => { if (isNaN(Number(v))) return; setCheckOutHour(v); let h = Number(v); if (h > 23) h = 23; if (h < 0) h = 0; updateField('checkOutTime', `${h.toString().padStart(2,'0')}:${checkOutMinute}`); }} keyboardType="numeric" maxLength={2} placeholder="HH" />
                <Text style={s.timeColon}>:</Text>
                <TextInput style={s.timeInput} value={checkOutMinute} onChangeText={v => { if (isNaN(Number(v))) return; setCheckOutMinute(v); let m = Number(v); if (m > 59) m = 59; if (m < 0) m = 0; updateField('checkOutTime', `${checkOutHour}:${m.toString().padStart(2,'0')}`); }} keyboardType="numeric" maxLength={2} placeholder="MM" />
              </View>
            </View>
          </View>
        </View>

        {/* Địa chỉ */}
        <View style={s.formSection}>
          <View style={s.sectionTitleRow}><MapPin size={18} color="#1E293B" /><Text style={s.sectionTitle}>Địa chỉ</Text></View>
          <View style={s.field}>
            <Text style={s.label}>Địa chỉ chi tiết <Text style={s.required}>*</Text></Text>
            <TextInput ref={addressLineRef} style={[s.input, errors.addressLine ? s.inputError : null]} value={form.addressLine} onChangeText={v => { updateField('addressLine', v); clearError('addressLine'); }} placeholder="Số nhà, tên đường..." placeholderTextColor="#94A3B8" />
            {errors.addressLine ? <Text style={s.fieldErrorText}>{errors.addressLine}</Text> : null}
          </View>
          <SelectDropdown ref={provinceRef} label="Tỉnh / Thành phố" required placeholder="Chọn Tỉnh/Thành phố..." options={provinceOptions} value={form.provinceCode} onChange={handleProvinceChange} loading={loadingProvinces} error={errors.provinceCode} />
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <SelectDropdown ref={districtRef} label="Quận / Huyện" required placeholder="Chọn Quận/Huyện..." options={districtOptions} value={form.districtCode} onChange={handleDistrictChange} loading={loadingDistricts} disabled={!form.provinceCode} error={errors.districtCode} />
            </View>
            <View style={{ flex: 1 }}>
              <SelectDropdown ref={wardRef} label="Phường / Xã" required placeholder="Chọn Phường/Xã..." options={wardOptions} value={form.wardCode} onChange={handleWardChange} loading={loadingWards} disabled={!form.districtCode} error={errors.wardCode} />
            </View>
          </View>
        </View>

        {/* Tiện ích */}
        <View style={s.formSection}>
          <View style={s.sectionTitleRow}>
            <Sparkles size={18} color="#1E293B" /><Text style={s.sectionTitle}>Tiện ích</Text>
            <View style={s.selectedBadge}><Text style={s.selectedBadgeText}>{selectedAmenityIds.size} đã chọn</Text></View>
          </View>
          <Text style={s.sectionHint}>Chọn các tiện ích mà khách sạn của bạn cung cấp</Text>
          {loadingAmenities ? (
            <ActivityIndicator size="small" color="#008080" style={{ padding: 20 }} />
          ) : (
            Object.entries(groupedAmenities).map(([category, amenities]) => (
              <View key={category} style={s.amenityCategory}>
                <Text style={s.categoryLabel}>{CATEGORY_LABELS[category] || category}</Text>
                <View style={s.amenityGrid}>
                  {amenities.map(amenity => {
                    const isSelected = selectedAmenityIds.has(amenity.id);
                    return (
                      <TouchableOpacity key={amenity.id} style={[s.amenityItem, isSelected && s.amenityItemSelected]} onPress={() => toggleAmenity(amenity.id)}>
                        {isSelected ? <CheckSquare size={16} color="#008080" /> : <Square size={16} color="#94A3B8" />}
                        <Text style={[s.amenityLabel, isSelected && s.amenityLabelSelected]}>{amenity.icon || '•'} {amenity.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Hình ảnh */}
        <View style={s.formSection}>
          <View style={s.sectionTitleRow}><ImageIcon size={18} color="#1E293B" /><Text style={s.sectionTitle}>Hình ảnh <Text style={s.required}>*</Text></Text></View>
          <Text style={s.sectionHint}>{isEdit ? 'Thêm ảnh mới hoặc xem ảnh hiện tại' : 'Chọn ảnh trước, ảnh sẽ được tải lên sau khi tạo khách sạn'}</Text>
          {isEdit && currentHotel?.images && currentHotel.images.length > 0 && (
            <View style={s.existingImages}>
              <Text style={s.existingImagesTitle}>Ảnh hiện tại ({currentHotel.images.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {currentHotel.images.map(img => (
                  <View key={img.id} style={s.pendingImageWrapper}>
                    <Image source={{ uri: img.imageUrl }} style={s.galleryImage} />
                    <TouchableOpacity style={s.removeBtn} onPress={() => setImageToDelete(img.id)}>
                      <Text style={s.removeBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
          <ImageUploader onUpload={handlePickImages} isUploading={false} multiple />
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
          {errors.images ? <Text style={s.fieldErrorText}>{errors.images}</Text> : null}
        </View>

        {/* Actions */}
        <View style={s.actions}>
          <TouchableOpacity style={s.cancelBtn} onPress={() => onBack?.()} disabled={busy}>
            <Text style={s.cancelBtnText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.submitBtn, busy && { opacity: 0.6 }]} onPress={handleSubmit} disabled={busy}>
            {busy ? (
              <View style={s.busyRow}>
                <ActivityIndicator size="small" color="#FFF" />
                <Text style={s.submitBtnText}>{isUploading ? 'Đang tải ảnh...' : 'Đang lưu...'}</Text>
              </View>
            ) : (
              <View style={s.busyRow}>
                {isEdit ? <Pencil size={16} color="#FFF" /> : <HotelIcon size={16} color="#FFF" />}
                <Text style={s.submitBtnText}>{isEdit ? 'Cập nhật' : 'Tạo khách sạn'}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Delete Image Confirmation Modal */}
      <Modal visible={!!imageToDelete} transparent animationType="fade" onRequestClose={() => !isDeletingImage && setImageToDelete(null)}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Trash2 size={24} color="#EF4444" />
              <Text style={s.modalTitle}>Xóa hình ảnh</Text>
            </View>
            <Text style={s.modalMessage}>Bạn có chắc chắn muốn xóa hình ảnh này khỏi khách sạn không?</Text>
            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={() => setImageToDelete(null)} disabled={isDeletingImage}>
                <Text style={s.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalDeleteBtn, isDeletingImage && { opacity: 0.6 }]} onPress={confirmDeleteImage} disabled={isDeletingImage}>
                {isDeletingImage ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={s.modalDeleteText}>Xóa</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: isMobile ? '#FFF' : '#F8FAFC' },
  scroll: { flex: 1 },
  mobileBackHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  mobileBackTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  pageHeader: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  pageTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  pageSubtitle: { fontSize: 13, color: '#94A3B8', marginTop: 4, marginLeft: 32 },
  formSection: { marginHorizontal: isMobile ? 16 : 20, marginTop: isMobile ? 16 : 20, backgroundColor: '#FFF', borderRadius: isMobile ? 16 : 14, padding: isMobile ? 16 : 20, borderWidth: isMobile ? 0 : 1, borderColor: '#E2E8F0', ...(isMobile ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 } : {}) },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  sectionHint: { fontSize: 12, color: '#94A3B8', marginBottom: 14, marginTop: -8 },
  field: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 },
  required: { color: '#EF4444' },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#1E293B', ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {} as any) },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2', ...(Platform.OS === 'web' ? { outlineColor: '#EF4444' } : {} as any) },
  fieldErrorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  row: { flexDirection: isMobile ? 'column' : 'row', gap: 12 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeInput: { flex: 1, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 16, fontWeight: '700', textAlign: 'center', color: '#1E293B' },
  timeColon: { fontSize: 20, fontWeight: '700', color: '#94A3B8' },
  selectedBadge: { backgroundColor: '#F0FDFA', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, borderWidth: 1, borderColor: '#CCFBF1', marginLeft: 'auto' },
  selectedBadgeText: { fontSize: 11, color: '#0F766E', fontWeight: '700' },
  amenityCategory: { marginBottom: 18 },
  categoryLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', minWidth: 140 },
  amenityItemSelected: { backgroundColor: '#F0FDFA', borderColor: '#99F6E4' },
  amenityLabel: { fontSize: 13, color: '#64748B' },
  amenityLabelSelected: { color: '#0F766E', fontWeight: '600' },
  existingImages: { marginBottom: 14 },
  existingImagesTitle: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8 },
  galleryImage: { width: 100, height: 75, borderRadius: 10, marginRight: 8, backgroundColor: '#E2E8F0' },
  pendingSection: { marginTop: 12 },
  pendingTitle: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8 },
  pendingImageWrapper: { position: 'relative', marginRight: 10 },
  pendingImage: { width: 90, height: 70, borderRadius: 8, backgroundColor: '#E2E8F0' },
  removeBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.55)', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  removeBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 12, marginHorizontal: isMobile ? 16 : 20, marginTop: isMobile ? 20 : 28 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { color: '#64748B', fontSize: 14, fontWeight: '700' },
  submitBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: '#0D9488', alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700', marginLeft: 6 },
  busyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  errorBox: { marginHorizontal: isMobile ? 16 : 20, marginTop: 16, backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FECACA' },
  errorText: { color: '#EF4444', fontSize: 14, textAlign: 'center' },
  successBox: { marginHorizontal: isMobile ? 16 : 20, marginTop: 16, backgroundColor: '#F0FDFA', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#CCFBF1' },
  successText: { color: '#0D9488', fontSize: 14, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, width: '100%', maxWidth: 340, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  modalMessage: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 24 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#F1F5F9', alignItems: 'center' },
  modalCancelText: { color: '#64748B', fontSize: 14, fontWeight: '600' },
  modalDeleteBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#EF4444', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  modalDeleteText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
});
