import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Image } from 'expo-image';
import { useLocation } from '../../hooks/useLocation'; 
import { SelectDropdown, SelectOption } from '../shared/SelectDropdown';
import { ImageUploader } from '../shared/ImageUploader';
import { AmenityIcon } from '../shared/AmenityIcon';

import { hotelService } from '../../services/hotel.service';
import { Hotel, CreateHotelInput } from '../../types/hotel.type';
import { Amenity } from '../../types/common.type';

import { ClipboardList, MapPin, ImageIcon, Hotel as HotelIcon, Pencil, ArrowLeft, Sparkles, Trash2 } from 'lucide-react-native';

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

const hotelSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên khách sạn'),
  description: z.string().optional(),
  propertyType: z.string(),
  starRating: z.number().min(1).max(5),
  checkInTime: z.string(),
  checkOutTime: z.string(),
  addressLine: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  provinceCode: z.number({ message: 'Vui lòng chọn Tỉnh/Thành phố' }),
  districtCode: z.number({ message: 'Vui lòng chọn Quận/Huyện' }),
  wardCode: z.number({ message: 'Vui lòng chọn Phường/Xã' }),
  provinceName: z.string(),
  districtName: z.string(),
  wardName: z.string(),
});

type HotelFormData = z.infer<typeof hotelSchema>;

interface Props {
  hotelId?: string;
  onBack?: () => void;
}

export function HotelEditForm({ hotelId: editHotelId, onBack }: Props) {
  const isEdit = !!editHotelId;
  const router = useRouter();

  const [currentHotel, setCurrentHotel] = useState<Hotel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [imagesError, setImagesError] = useState('');

  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [isDeletingImage, setIsDeletingImage] = useState(false);

  const { provinces, districts, wards, loadingProvinces, loadingDistricts, loadingWards, fetchDistricts, fetchWards, resetDistricts, resetWards } = useLocation();

  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<Set<string>>(new Set());
  const [loadingAmenities, setLoadingAmenities] = useState(false);
  const [pendingImages, setPendingImages] = useState<any[]>([]);

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<HotelFormData>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      name: '', description: '', propertyType: 'hotel', starRating: 3,
      checkInTime: '14:00', checkOutTime: '12:00', addressLine: '',
    }
  });

  const watchProvinceCode = watch('provinceCode');
  const watchProvinceName = watch('provinceName');
  const watchDistrictCode = watch('districtCode');
  const watchDistrictName = watch('districtName');
  const watchWardCode = watch('wardCode');
  const watchWardName = watch('wardName');

  const [checkInHour, setCheckInHour] = useState('14');
  const [checkInMinute, setCheckInMinute] = useState('00');
  const [checkOutHour, setCheckOutHour] = useState('12');
  const [checkOutMinute, setCheckOutMinute] = useState('00');

  useEffect(() => {
    setLoadingAmenities(true);
    hotelService.getAmenities()
      .then(setAllAmenities)
      .catch(err => console.warn('Failed to load amenities:', err))
      .finally(() => setLoadingAmenities(false));
  }, []);

  useEffect(() => {
    if (isEdit && editHotelId) {
      setIsLoading(true);
      hotelService.getHotel(editHotelId).then(h => { setCurrentHotel(h); setIsLoading(false); });
    }
  }, [isEdit, editHotelId]);

  useEffect(() => {
    if (isEdit && currentHotel) {
      const [h1 = '14', m1 = '00'] = (currentHotel.checkInTime || '14:00').split(':');
      const [h2 = '12', m2 = '00'] = (currentHotel.checkOutTime || '12:00').split(':');
      setCheckInHour(h1); setCheckInMinute(m1);
      setCheckOutHour(h2); setCheckOutMinute(m2);
      
      reset({
        name: currentHotel.name || '',
        description: currentHotel.description || '',
        propertyType: currentHotel.propertyType || 'hotel',
        starRating: currentHotel.starRating || 3,
        checkInTime: currentHotel.checkInTime || '14:00',
        checkOutTime: currentHotel.checkOutTime || '12:00',
        addressLine: currentHotel.address?.addressLine || '',
        provinceName: currentHotel.address?.province || currentHotel.address?.city || '',
        districtName: currentHotel.address?.district || '',
        wardName: currentHotel.address?.ward || '',
      });
      if (currentHotel.hotelAmenities?.length) {
        setSelectedAmenityIds(new Set(currentHotel.hotelAmenities.map(ha => ha.amenity.id)));
      }
    }
  }, [isEdit, currentHotel, reset]);

  // Auto-map loaded address strings to codes
  useEffect(() => {
    if (isEdit && currentHotel && provinces.length > 0 && !watchProvinceCode && watchProvinceName) {
      const p = provinces.find(x => x.name === watchProvinceName || watchProvinceName.includes(x.name) || x.name.includes(watchProvinceName));
      if (p) {
        setValue('provinceCode', p.code); setValue('provinceName', p.name);
        fetchDistricts(p.code);
      }
    }
  }, [isEdit, currentHotel, provinces, watchProvinceCode, watchProvinceName, setValue, fetchDistricts]);

  useEffect(() => {
    if (isEdit && currentHotel && districts.length > 0 && !watchDistrictCode && watchDistrictName) {
      const d = districts.find(x => x.name === watchDistrictName || watchDistrictName.includes(x.name) || x.name.includes(watchDistrictName));
      if (d) {
        setValue('districtCode', d.code); setValue('districtName', d.name);
        fetchWards(d.code);
      }
    }
  }, [isEdit, currentHotel, districts, watchDistrictCode, watchDistrictName, setValue, fetchWards]);

  useEffect(() => {
    if (isEdit && currentHotel && wards.length > 0 && !watchWardCode && watchWardName) {
      const w = wards.find(x => x.name === watchWardName || watchWardName.includes(x.name) || x.name.includes(watchWardName));
      if (w) {
        setValue('wardCode', w.code); setValue('wardName', w.name);
      }
    }
  }, [isEdit, currentHotel, wards, watchWardCode, watchWardName, setValue]);

  const groupedAmenities = useMemo(() => {
    const groups: Record<string, Amenity[]> = {};
    allAmenities.forEach(a => { if (!groups[a.category]) groups[a.category] = []; groups[a.category].push(a); });
    return groups;
  }, [allAmenities]);

  const provinceOptions = useMemo<SelectOption[]>(() => provinces.map(p => ({ label: p.name, value: p.code })), [provinces]);
  const districtOptions = useMemo<SelectOption[]>(() => districts.map(d => ({ label: d.name, value: d.code })), [districts]);
  const wardOptions = useMemo<SelectOption[]>(() => wards.map(w => ({ label: w.name, value: w.code })), [wards]);

  const handleProvinceChange = (opt: SelectOption) => {
    setValue('provinceCode', opt.value as number); setValue('provinceName', opt.label);
    setValue('districtCode', undefined as any); setValue('districtName', '');
    setValue('wardCode', undefined as any); setValue('wardName', '');
    resetDistricts(); fetchDistricts(opt.value as number);
  };
  const handleDistrictChange = (opt: SelectOption) => {
    setValue('districtCode', opt.value as number); setValue('districtName', opt.label);
    setValue('wardCode', undefined as any); setValue('wardName', '');
    resetWards(); fetchWards(opt.value as number);
  };
  const handleWardChange = (opt: SelectOption) => { 
    setValue('wardCode', opt.value as number); setValue('wardName', opt.label); 
  };
  
  const toggleAmenity = (id: string) => setSelectedAmenityIds(prev => { const next = new Set(prev); if (next.has(id)) { next.delete(id); } else { next.add(id); } return next; });
  const handlePickImages = async (files: any[]) => {
    setPendingImages(prev => [...prev, ...files]);
    setImagesError('');
  };
  const removePendingImage = (index: number) => setPendingImages(prev => prev.filter((_, i) => i !== index));

  const confirmDeleteImage = async () => {
    if (!imageToDelete || !currentHotel?.id) return;
    try {
      setIsDeletingImage(true);
      await hotelService.deleteHotelImage(currentHotel.id, imageToDelete);
      setCurrentHotel(prev => prev ? { ...prev, images: prev.images.filter(img => img.id !== imageToDelete) } : prev);
      setImageToDelete(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi xóa ảnh');
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.replace('/partner/dashboard' as any);
    }
  };

  const onSubmit = async (data: HotelFormData) => {
    setErrorMsg('');
    setSuccessMsg('');
    setImagesError('');
    
    const totalImages = (currentHotel?.images?.length || 0) + pendingImages.length;
    if (totalImages < 3) {
      setImagesError('Vui lòng chọn ít nhất 3 hình ảnh');
      return;
    }

    try {
      setIsSaving(true);

      const amenityArray: string[] = [];
      selectedAmenityIds.forEach(id => amenityArray.push(id));

      const payload = {
        name: data.name.trim(),
        description: data.description?.trim() || '',
        propertyType: data.propertyType,
        starRating: data.starRating,
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        address: {
          addressLine: data.addressLine.trim(),
          ward: data.wardName || '',
          district: data.districtName,
          city: data.provinceName,
          province: data.provinceName,
          country: 'Vietnam',
        },
        amenityIds: amenityArray,
      } as CreateHotelInput;

      let hotelResult: Hotel;
      if (isEdit && editHotelId) {
        hotelResult = await hotelService.updateHotel(editHotelId, payload);
      } else {
        hotelResult = await hotelService.createHotel(payload);
      }

      // Xử lý upload ảnh (nếu có ảnh mới)
      if (pendingImages.length > 0 && hotelResult?.id) {
        try {
          setIsUploading(true);
          await hotelService.uploadHotelImages(hotelResult.id, pendingImages);
        } catch {
          setErrorMsg('Khách sạn đã được lưu nhưng upload ảnh thất bại. Bạn có thể thêm ảnh sau.');
        } finally {
          setIsUploading(false);
        }
      }
      
      setSuccessMsg(isEdit ? 'Cập nhật khách sạn thành công!' : 'Tạo khách sạn thành công!');
      setTimeout(() => {
        handleGoBack();
      }, 1500);
      
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi lưu khách sạn');
    } finally {
      setIsSaving(false);
    }
  };

  const busy = isSaving || isUploading;

  if (isLoading) return <ActivityIndicator size="large" color="#0D9488" style={{ marginTop: 50 }} />;

  return (
    <View style={s.container}>
      {isMobile ? (
        <View style={s.mobileBackHeader}>
          <TouchableOpacity onPress={handleGoBack} style={{ padding: 4 }}><ArrowLeft size={20} color="#1E293B" /></TouchableOpacity>
          <Text style={s.mobileBackTitle}>{isEdit ? 'Chỉnh sửa khách sạn' : 'Tạo khách sạn mới'}</Text>
        </View>
      ) : null}
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {!isMobile && (
          <View style={s.pageHeader}>
            <View style={s.pageTitleRow}>
              <HotelIcon size={22} color="#0F172A" />
              <Text style={s.pageTitle}>{isEdit ? 'Chỉnh sửa khách sạn' : 'Tạo khách sạn mới'}</Text>
            </View>
            <Text style={s.pageSubtitle}>Điền đầy đủ thông tin để được duyệt nhanh hơn</Text>
          </View>
        )}

        {errorMsg ? <View style={s.errorBox}><Text style={s.errorText}>{errorMsg}</Text></View> : null}
        {successMsg ? <View style={s.successBox}><Text style={s.successText}>{successMsg}</Text></View> : null}

        {/* Thông tin cơ bản */}
        <View style={s.formSection}>
          <View style={s.sectionTitleRow}><ClipboardList size={18} color="#1E293B" /><Text style={s.sectionTitle}>Thông tin cơ bản</Text></View>
          
          <View style={s.field}>
            <Text style={s.label}>Tên khách sạn <Text style={s.required}>*</Text></Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <TextInput style={[s.input, errors.name && s.inputError]} value={value} onChangeText={onChange} placeholder="Nhập tên khách sạn" placeholderTextColor="#94A3B8" />
              )}
            />
            {errors.name && <Text style={s.fieldErrorText}>{errors.name.message}</Text>}
          </View>
          
          <View style={s.field}>
            <Text style={s.label}>Mô tả</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput style={[s.input, s.textarea]} value={value} onChangeText={onChange} placeholder="Mô tả về khách sạn..." placeholderTextColor="#94A3B8" multiline numberOfLines={4} />
              )}
            />
          </View>
          
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Controller control={control} name="propertyType" render={({ field: { onChange, value } }) => (
                <SelectDropdown label="Loại hình" options={PROPERTY_TYPES} value={value} onChange={opt => onChange(opt.value)} searchable={false} />
              )} />
            </View>
            <View style={{ flex: 1 }}>
              <Controller control={control} name="starRating" render={({ field: { onChange, value } }) => (
                <SelectDropdown label="Số sao" options={STAR_OPTIONS} value={value} onChange={opt => onChange(opt.value)} searchable={false} />
              )} />
            </View>
          </View>
          
          <View style={s.row}>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>Giờ nhận phòng</Text>
              <View style={s.timeRow}>
                <TextInput style={s.timeInput} value={checkInHour} onChangeText={v => { if (isNaN(Number(v))) return; setCheckInHour(v); let h = Number(v); if (h > 23) h = 23; if (h < 0) h = 0; setValue('checkInTime', `${h.toString().padStart(2,'0')}:${checkInMinute}`); }} keyboardType="numeric" maxLength={2} placeholder="HH" />
                <Text style={s.timeColon}>:</Text>
                <TextInput style={s.timeInput} value={checkInMinute} onChangeText={v => { if (isNaN(Number(v))) return; setCheckInMinute(v); let m = Number(v); if (m > 59) m = 59; if (m < 0) m = 0; setValue('checkInTime', `${checkInHour}:${m.toString().padStart(2,'0')}`); }} keyboardType="numeric" maxLength={2} placeholder="MM" />
              </View>
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>Giờ trả phòng</Text>
              <View style={s.timeRow}>
                <TextInput style={s.timeInput} value={checkOutHour} onChangeText={v => { if (isNaN(Number(v))) return; setCheckOutHour(v); let h = Number(v); if (h > 23) h = 23; if (h < 0) h = 0; setValue('checkOutTime', `${h.toString().padStart(2,'0')}:${checkOutMinute}`); }} keyboardType="numeric" maxLength={2} placeholder="HH" />
                <Text style={s.timeColon}>:</Text>
                <TextInput style={s.timeInput} value={checkOutMinute} onChangeText={v => { if (isNaN(Number(v))) return; setCheckOutMinute(v); let m = Number(v); if (m > 59) m = 59; if (m < 0) m = 0; setValue('checkOutTime', `${checkOutHour}:${m.toString().padStart(2,'0')}`); }} keyboardType="numeric" maxLength={2} placeholder="MM" />
              </View>
            </View>
          </View>
        </View>

        {/* Địa chỉ */}
        <View style={s.formSection}>
          <View style={s.sectionTitleRow}><MapPin size={18} color="#1E293B" /><Text style={s.sectionTitle}>Địa chỉ</Text></View>
          <View style={s.field}>
            <Text style={s.label}>Địa chỉ chi tiết <Text style={s.required}>*</Text></Text>
            <Controller
              control={control}
              name="addressLine"
              render={({ field: { onChange, value } }) => (
                <TextInput style={[s.input, errors.addressLine && s.inputError]} value={value} onChangeText={onChange} placeholder="Số nhà, tên đường..." placeholderTextColor="#94A3B8" />
              )}
            />
            {errors.addressLine && <Text style={s.fieldErrorText}>{errors.addressLine.message}</Text>}
          </View>
          
          <Controller control={control} name="provinceCode" render={({ field: { value } }) => (
            <SelectDropdown label="Tỉnh / Thành phố" required placeholder="Chọn Tỉnh/Thành phố..." options={provinceOptions} value={value} onChange={handleProvinceChange} loading={loadingProvinces} error={errors.provinceCode?.message} />
          )} />
          
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Controller control={control} name="districtCode" render={({ field: { value } }) => (
                <SelectDropdown label="Quận / Huyện" required placeholder="Chọn Quận/Huyện..." options={districtOptions} value={value} onChange={handleDistrictChange} loading={loadingDistricts} disabled={!watchProvinceCode} error={errors.districtCode?.message} />
              )} />
            </View>
            <View style={{ flex: 1 }}>
              <Controller control={control} name="wardCode" render={({ field: { value } }) => (
                <SelectDropdown label="Phường / Xã" required placeholder="Chọn Phường/Xã..." options={wardOptions} value={value} onChange={handleWardChange} loading={loadingWards} disabled={!watchDistrictCode} error={errors.wardCode?.message} />
              )} />
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
                        <AmenityIcon name={amenity.name} size={18} color={isSelected ? '#0F766E' : '#64748B'} />
                        <Text style={[s.amenityLabel, isSelected && s.amenityLabelSelected]}>{amenity.name}</Text>
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
                    {/* Using expo-image here as required by the teacher */}
                    <Image source={{ uri: img.imageUrl }} style={s.galleryImage} contentFit="cover" cachePolicy="memory-disk" />
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
                      <Image source={{ uri }} style={s.pendingImage} contentFit="cover" />
                      <TouchableOpacity style={s.removeBtn} onPress={() => removePendingImage(index)}>
                        <Text style={s.removeBtnText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}
          {imagesError ? <Text style={s.fieldErrorText}>{imagesError}</Text> : null}
        </View>

        {/* Actions */}
        <View style={s.actions}>
          <TouchableOpacity style={s.cancelBtn} onPress={handleGoBack} disabled={busy}>
            <Text style={s.cancelBtnText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.submitBtn, busy && { opacity: 0.6 }]} onPress={handleSubmit(onSubmit)} disabled={busy}>
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

      {/* Delete Image Modal */}
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