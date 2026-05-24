import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  TicketPercent,
  CheckSquare,
  Square,
} from 'lucide-react-native';

import { partnerService } from '../../src/partner/services/partner.service';

const isMobile = Platform.OS !== 'web';

const webDateInputStyle = {
  width: '100%',
  height: 44,
  borderRadius: 10,
  border: '1px solid #E2E8F0',
  backgroundColor: '#F8FAFC',
  padding: '0 14px',
  fontSize: 14,
  color: '#1E293B',
  outline: 'none',
  boxSizing: 'border-box',
};

type DiscountType = 'percent' | 'fixed';

const DatePickerInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => {
  if (Platform.OS === 'web') {
    return React.createElement('input' as any, {
      type: 'date',
      value,
      onChange: (e: any) => onChange(e.target.value),
      style: webDateInputStyle as any,
    });
  }

  return (
    <TextInput
      style={s.input}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder || 'YYYY-MM-DD'}
      placeholderTextColor="#94A3B8"
    />
  );
};

export default function VoucherFormPage() {
  const router = useRouter();

  const { id, hotelId } = useLocalSearchParams<{
    id?: string;
    hotelId?: string;
  }>();

  const isEdit = !!id;

  const [form, setForm] = useState({
    code: '',
    name: '',
    discountType: 'percent' as DiscountType,
    discountValue: '',
    minOrderValue: '',
    maxDiscount: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
    applicableRoomTypeIds: ['all'] as string[],
  });

  const [roomTypeOptions, setRoomTypeOptions] = useState([
    { id: 'all', name: 'Tất cả loại phòng' },
  ]);

  const [notice, setNotice] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotice = (
    message: string,
    type: 'success' | 'error' = 'error'
  ) => {
    setNotice({ message, type });

    setTimeout(() => {
      setNotice(null);
    }, 3000);
  };

  React.useEffect(() => {
    if (!hotelId) return;

    const loadRoomTypes = async () => {
      try {
        const roomTypes = await partnerService.getRoomTypes(String(hotelId));

        setRoomTypeOptions([
          { id: 'all', name: 'Tất cả loại phòng' },
          ...roomTypes.map((room) => ({
            id: room.id,
            name: room.name,
          })),
        ]);
      } catch (err) {
        console.error('Không tải được loại phòng:', err);
      }
    };

    loadRoomTypes();
  }, [hotelId]);

  React.useEffect(() => {
    if (!isEdit || !id || !hotelId) return;

    const loadVoucher = async () => {
      try {
        const voucher = await partnerService.getVoucher(
          String(hotelId),
          String(id)
        );

        setForm({
          code: voucher.code || '',
          name: voucher.name || '',
          discountType: voucher.discountType as DiscountType,
          discountValue: String(voucher.discountValue || ''),
          minOrderValue: String(voucher.minOrderValue || ''),
          maxDiscount: String(voucher.maxDiscount || ''),
          usageLimit: String(voucher.usageLimit || ''),
          startDate: voucher.startDate ? voucher.startDate.slice(0, 10) : '',
          endDate: voucher.endDate ? voucher.endDate.slice(0, 10) : '',
          applicableRoomTypeIds:
            voucher.applicableRoomTypeIds?.length
              ? voucher.applicableRoomTypeIds
              : ['all'],
        });
      } catch (err) {
        console.error('Không tải được voucher:', err);
        showNotice('Không tải được voucher', 'error');
      }
    };

    loadVoucher();
  }, [id, hotelId, isEdit]);

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleRoomType = (roomTypeId: string) => {
    setForm((prev) => {
      let nextIds = [...prev.applicableRoomTypeIds];

      if (roomTypeId === 'all') {
        return {
          ...prev,
          applicableRoomTypeIds: ['all'],
        };
      }

      nextIds = nextIds.filter((item) => item !== 'all');

      if (nextIds.includes(roomTypeId)) {
        nextIds = nextIds.filter((item) => item !== roomTypeId);
      } else {
        nextIds.push(roomTypeId);
      }

      if (nextIds.length === 0) {
        nextIds = ['all'];
      }

      return {
        ...prev,
        applicableRoomTypeIds: nextIds,
      };
    });
  };

  const handleSubmit = async () => {
    if (!form.code.trim()) {
      showNotice('Vui lòng nhập mã voucher', 'error');
      return;
    }

    if (!form.name.trim()) {
      showNotice('Vui lòng nhập tên chương trình', 'error');
      return;
    }

    if (!form.discountValue.trim()) {
      showNotice('Vui lòng nhập giá trị giảm', 'error');
      return;
    }

    if (form.discountType === 'percent' && Number(form.discountValue) > 100) {
      showNotice('Phần trăm giảm không được vượt quá 100%', 'error');
      return;
    }

    if (!form.applicableRoomTypeIds.length) {
      showNotice('Vui lòng chọn loại phòng áp dụng', 'error');
      return;
    }

    if (!form.startDate) {
      showNotice('Vui lòng chọn ngày bắt đầu', 'error');
      return;
    }

    if (!form.endDate) {
      showNotice('Vui lòng chọn ngày kết thúc', 'error');
      return;
    }

    if (form.endDate < form.startDate) {
      showNotice('Ngày kết thúc không được nhỏ hơn ngày bắt đầu', 'error');
      return;
    }

    if (!hotelId) {
      showNotice('Không tìm thấy khách sạn để tạo voucher', 'error');
      return;
    }

    const payload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderValue: Number(form.minOrderValue || 0),
      maxDiscount: Number(form.maxDiscount || 0),
      usageLimit: Number(form.usageLimit || 100),
      startDate: form.startDate,
      endDate: form.endDate,
      applicableRoomTypeIds: form.applicableRoomTypeIds,
    };

    try {
      if (isEdit && id) {
        await partnerService.updateVoucher(String(hotelId), String(id), payload);
      } else {
        await partnerService.createVoucher(String(hotelId), payload);
      }

      showNotice(
        isEdit ? 'Cập nhật voucher thành công' : 'Tạo voucher thành công',
        'success'
      );

      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (err: any) {
      console.error('Lỗi lưu voucher:', err);

      showNotice(
        err?.response?.data?.message ||
          err?.message ||
          'Lưu voucher thất bại',
        'error'
      );
    }
  };

  return (
    <View style={s.container}>
      {isMobile ? (
        <View style={s.mobileBackHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 4 }}
          >
            <ArrowLeft size={20} color="#1E293B" />
          </TouchableOpacity>

          <Text style={s.mobileBackTitle}>
            {isEdit ? 'Chỉnh sửa voucher' : 'Tạo voucher mới'}
          </Text>
        </View>
      ) : null}

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {!isMobile && (
          <View style={s.pageHeader}>
            <View style={s.pageTitleRow}>
              <TicketPercent size={22} color="#0F172A" />

              <Text style={s.pageTitle}>
                {isEdit ? 'Chỉnh sửa voucher' : 'Tạo voucher mới'}
              </Text>
            </View>

            <Text style={s.pageSubtitle}>
              {isEdit
                ? 'Cập nhật thông tin mã giảm giá'
                : 'Thiết lập mã giảm giá cho khách hàng đặt phòng'}
            </Text>
          </View>
        )}

        {notice && (
          <View
            style={[
              s.noticeBox,
              notice.type === 'success' ? s.noticeSuccess : s.noticeError,
            ]}
          >
            <Text
              style={[
                s.noticeText,
                notice.type === 'success'
                  ? s.noticeSuccessText
                  : s.noticeErrorText,
              ]}
            >
              {notice.message}
            </Text>
          </View>
        )}

        <View style={s.formSection}>
          <Text style={s.sectionTitle}>Thông tin voucher</Text>

          <View style={s.field}>
            <Text style={s.label}>
              Mã voucher <Text style={s.required}>*</Text>
            </Text>

            <TextInput
              style={s.input}
              value={form.code}
              onChangeText={(v) => updateField('code', v.toUpperCase())}
              placeholder="VD: SUMMER30"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>
              Tên chương trình <Text style={s.required}>*</Text>
            </Text>

            <TextInput
              style={s.input}
              value={form.name}
              onChangeText={(v) => updateField('name', v)}
              placeholder="VD: Giảm giá mùa hè"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Loại giảm giá</Text>

            <View style={s.segment}>
              <TouchableOpacity
                style={[
                  s.segmentItem,
                  form.discountType === 'percent' && s.segmentItemActive,
                ]}
                onPress={() => updateField('discountType', 'percent')}
              >
                <Text
                  style={[
                    s.segmentText,
                    form.discountType === 'percent' && s.segmentTextActive,
                  ]}
                >
                  Theo %
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  s.segmentItem,
                  form.discountType === 'fixed' && s.segmentItemActive,
                ]}
                onPress={() => updateField('discountType', 'fixed')}
              >
                <Text
                  style={[
                    s.segmentText,
                    form.discountType === 'fixed' && s.segmentTextActive,
                  ]}
                >
                  Số tiền
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Loại phòng áp dụng</Text>

            <View style={s.roomTypeGrid}>
              {roomTypeOptions.map((room) => {
                const selected = form.applicableRoomTypeIds.includes(room.id);

                return (
                  <TouchableOpacity
                    key={room.id}
                    style={[
                      s.roomTypeItem,
                      selected && s.roomTypeItemSelected,
                    ]}
                    onPress={() => toggleRoomType(room.id)}
                  >
                    {selected ? (
                      <CheckSquare size={16} color="#0D9488" />
                    ) : (
                      <Square size={16} color="#94A3B8" />
                    )}

                    <Text
                      style={[
                        s.roomTypeText,
                        selected && s.roomTypeTextSelected,
                      ]}
                    >
                      {room.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={s.roomTypeHint}>
              Nếu chọn “Tất cả loại phòng”, voucher sẽ áp dụng cho toàn bộ loại phòng.
            </Text>
          </View>

          <View style={s.row}>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>
                Giá trị giảm {form.discountType === 'percent' ? '(%)' : '(đ)'}
              </Text>

              <TextInput
                style={s.input}
                value={form.discountValue}
                onChangeText={(v) =>
                  updateField('discountValue', v.replace(/[^0-9]/g, ''))
                }
                placeholder={form.discountType === 'percent' ? '30' : '100000'}
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            </View>

            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>Đơn tối thiểu</Text>

              <TextInput
                style={s.input}
                value={form.minOrderValue}
                onChangeText={(v) =>
                  updateField('minOrderValue', v.replace(/[^0-9]/g, ''))
                }
                placeholder="500000"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={s.row}>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>Giảm tối đa</Text>

              <TextInput
                style={s.input}
                value={form.maxDiscount}
                onChangeText={(v) =>
                  updateField('maxDiscount', v.replace(/[^0-9]/g, ''))
                }
                placeholder="200000"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            </View>

            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>Số lượt sử dụng</Text>

              <TextInput
                style={s.input}
                value={form.usageLimit}
                onChangeText={(v) =>
                  updateField('usageLimit', v.replace(/[^0-9]/g, ''))
                }
                placeholder="100"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={s.row}>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>Ngày bắt đầu</Text>

              <DatePickerInput
                value={form.startDate}
                onChange={(v) => updateField('startDate', v)}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>Ngày kết thúc</Text>

              <DatePickerInput
                value={form.endDate}
                onChange={(v) => updateField('endDate', v)}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>
        </View>

        <View style={s.actions}>
          <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()}>
            <Text style={s.cancelText}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit}>
            <Text style={s.submitText}>
              {isEdit ? 'Cập nhật voucher' : 'Tạo voucher'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isMobile ? '#FFF' : '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
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
  mobileBackTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  pageHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  pageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    marginLeft: 32,
  },
  formSection: {
    marginHorizontal: isMobile ? 16 : 20,
    marginTop: isMobile ? 16 : 20,
    backgroundColor: '#FFF',
    borderRadius: isMobile ? 16 : 14,
    padding: isMobile ? 16 : 20,
    borderWidth: isMobile ? 0 : 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  required: {
    color: '#EF4444',
  },
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
  row: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: 12,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentItemActive: {
    backgroundColor: '#0D9488',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#FFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: isMobile ? 16 : 20,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0D9488',
    alignItems: 'center',
  },
  submitText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  roomTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  roomTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    minWidth: isMobile ? ('100%' as any) : 180,
  },
  roomTypeItemSelected: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  roomTypeText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  roomTypeTextSelected: {
    color: '#0D9488',
    fontWeight: '800',
  },
  roomTypeHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#94A3B8',
  },
  noticeBox: {
    marginHorizontal: isMobile ? 16 : 20,
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  noticeSuccess: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  noticeError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  noticeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  noticeSuccessText: {
    color: '#0F766E',
  },
  noticeErrorText: {
    color: '#DC2626',
  },
});