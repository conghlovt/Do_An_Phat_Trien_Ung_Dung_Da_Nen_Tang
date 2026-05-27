import React, { useEffect, useMemo, useState } from 'react';

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
import { partnerVoucherService } from '../../src/partner/services/voucher.service';

const isMobile = Platform.OS !== 'web';
const DEFAULT_TEST_HOTEL_ID = 'cmpm3a1uy0000lwm8s527oy7q';

const customerTierOptions = [
  { id: 'REGULAR', name: 'Khách thường' },
  { id: 'RETURNING', name: 'Khách quay lại' },
  { id: 'LOYAL', name: 'Khách thân thiết' },
  { id: 'VIP', name: 'Khách VIP' },
];




type DiscountType = 'percent' | 'fixed';

type RoomOption = {
  id: string;
  name: string;
};

type NoticeState = {
  type: 'success' | 'error';
  message: string;
} | null;

const hourOptions = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, '0')
);

const minuteOptions = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, '0')
);

const splitDateTime = (value: string) => {
  if (!value) {
    return {
      date: '',
      time: '',
    };
  }

  const [date, timeWithSeconds] = value.split('T');

  return {
    date: date || '',
    time: timeWithSeconds ? timeWithSeconds.slice(0, 5) : '',
  };
};

const mergeDateTime = (date: string, time: string) => {
  if (!date && !time) return '';
  if (!date) return '';
  if (!time) return `${date}T00:00`;

  return `${date}T${time}`;
};

const DateTimePickerInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const current = splitDateTime(value);

  const rawHour = current.time ? current.time.slice(0, 2) : '00';
  const rawMinute = current.time ? current.time.slice(3, 5) : '00';

  const currentHour = hourOptions.includes(rawHour) ? rawHour : '12';
  const currentMinute = minuteOptions.includes(rawMinute) ? rawMinute : '00';
  const webDateInputStyle: any = {
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
  const handleDateChange = (date: string) => {
    onChange(mergeDateTime(date, `${currentHour}:${currentMinute}`));
  };

  const handleHourChange = (hour: string) => {
    onChange(mergeDateTime(current.date, `${hour}:${currentMinute}`));
  };

  const handleMinuteChange = (minute: string) => {
    onChange(mergeDateTime(current.date, `${currentHour}:${minute}`));
  };

  return (
    <View style={s.dateTimePickerBox}>
      {Platform.OS === 'web' ? (

        React.createElement('input' as any, {
          type: 'date',
          value: current.date,
          onChange: (e: any) => handleDateChange(e.target.value),
          style: webDateInputStyle,
        })

      ) : (
        <TextInput
          style={s.input}
          value={current.date}
          onChangeText={handleDateChange}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#94A3B8"
        />
      )}

      <View style={s.timeWheelWrap}>
        <View style={s.timeWheelColumn}>
          <Text style={s.timeWheelLabel}>Giờ</Text>

          <ScrollView
            style={s.timeWheel}
            showsVerticalScrollIndicator={false}
          >
            {hourOptions.map((hour) => {
              const selected = hour === currentHour;

              return (
                <TouchableOpacity
                  key={hour}
                  style={[
                    s.timeWheelItem,
                    selected && s.timeWheelItemActive,
                  ]}
                  onPress={() => handleHourChange(hour)}
                >
                  <Text
                    style={[
                      s.timeWheelText,
                      selected && s.timeWheelTextActive,
                    ]}
                  >
                    {hour}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={s.timeWheelColumn}>
          <Text style={s.timeWheelLabel}>Phút</Text>

          <ScrollView
            style={s.timeWheel}
            showsVerticalScrollIndicator={false}
          >
            {minuteOptions.map((minute) => {
              const selected = minute === currentMinute;

              return (
                <TouchableOpacity
                  key={minute}
                  style={[
                    s.timeWheelItem,
                    selected && s.timeWheelItemActive,
                  ]}
                  onPress={() => handleMinuteChange(minute)}
                >
                  <Text
                    style={[
                      s.timeWheelText,
                      selected && s.timeWheelTextActive,
                    ]}
                  >
                    {minute}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const toDateTimeInputValue = (value?: string | null) => {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toIsoDateTime = (value: string) => {
  if (!value) return undefined;

  return new Date(value).toISOString();
};

export default function VoucherFormPage() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    id?: string;
    voucherId?: string;
    hotelId?: string;
  }>();

  const hotelId =
    typeof params.hotelId === 'string' && params.hotelId
      ? params.hotelId
      : DEFAULT_TEST_HOTEL_ID;

  // Hỗ trợ cả id cũ và voucherId mới
  const voucherId =
    typeof params.voucherId === 'string' && params.voucherId
      ? params.voucherId
      : typeof params.id === 'string' && params.id
        ? params.id
        : '';

  const isEdit = Boolean(voucherId);

  const [form, setForm] = useState({
    code: '',
    name: '',
    discountType: 'percent' as DiscountType,
    discountValue: '',
    minOrderValue: '',
    maxDiscount: '',
    usageLimit: '100',
    perUser: '1',
    startDate: '',
    endDate: '',
    applicableRoomTypeIds: ['all'] as string[],
    customerTiers: ['REGULAR', 'RETURNING', 'LOYAL', 'VIP'] as string[],
    status: 'ACTIVE',
  });

  const [roomTypeOptions, setRoomTypeOptions] = useState<RoomOption[]>([
    { id: 'all', name: 'Tất cả loại phòng' },
  ]);

  const [notice, setNotice] = useState<NoticeState>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const pageTitle = useMemo(() => {
    return isEdit ? 'Chỉnh sửa voucher' : 'Tạo voucher mới';
  }, [isEdit]);

  const submitText = useMemo(() => {
    if (loading) return isEdit ? 'Đang cập nhật...' : 'Đang tạo...';
    return isEdit ? 'Cập nhật voucher' : 'Tạo voucher';
  }, [loading, isEdit]);

  const showNotice = (
    message: string,
    type: 'success' | 'error' = 'error'
  ) => {
    setNotice({ message, type });

    setTimeout(() => {
      setNotice(null);
    }, 3000);
  };

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    if (!hotelId) return;

    const loadRoomTypes = async () => {
      try {
        const roomTypes = await partnerService.getRoomTypes(String(hotelId));

        setRoomTypeOptions([
          { id: 'all', name: 'Tất cả loại phòng' },
          ...roomTypes.map((room: any) => ({
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

  useEffect(() => {
    if (!isEdit || !voucherId || !hotelId) return;

    const loadVoucher = async () => {
      try {
        setLoadingDetail(true);

        const voucher = await partnerVoucherService.getVoucherById(
          String(hotelId),
          String(voucherId)
        );

        const customerTierRule = voucher.rules?.find(
          (rule: any) => rule.type === 'customerTier'
        );

        setForm({
          code: voucher.code || '',
          name: voucher.name || '',
          discountType: (voucher.discountType || 'percent') as DiscountType,
          discountValue: String(voucher.discountValue || ''),
          minOrderValue: String(voucher.minOrderValue || ''),
          maxDiscount: String(voucher.maxDiscount || ''),
          usageLimit: String(voucher.usageLimit || '100'),
          perUser: String(voucher.constraints?.perUser || '1'),

          startDate: toDateTimeInputValue(voucher.startDate),
          endDate: toDateTimeInputValue(voucher.endDate),

          applicableRoomTypeIds:
            voucher.applicableRoomTypeIds?.length
              ? voucher.applicableRoomTypeIds
              : ['all'],
          customerTiers:
            customerTierRule?.values?.length
              ? customerTierRule.values
              : ['REGULAR', 'RETURNING', 'LOYAL', 'VIP'],
          status: voucher.status || 'ACTIVE',
        });
      } catch (err: any) {
        console.error('Không tải được voucher:', err);
        showNotice(
          err?.response?.data?.message ||
            err?.message ||
            'Không tải được voucher',
          'error'
        );
      } finally {
        setLoadingDetail(false);
      }
    };

    loadVoucher();
  }, [voucherId, hotelId, isEdit]);

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
  const toggleCustomerTier = (tierId: string) => {
    setForm((prev) => {
      let nextTiers = [...prev.customerTiers];

      if (nextTiers.includes(tierId)) {
        nextTiers = nextTiers.filter((item) => item !== tierId);
      } else {
        nextTiers.push(tierId); 
      }

      if (nextTiers.length === 0) {
        nextTiers = ['REGULAR'];
      }

      return {
        ...prev,
        customerTiers: nextTiers,
      };
    });
  };
  const validateForm = () => {
    if (!hotelId) {
      showNotice('Không tìm thấy khách sạn để lưu voucher', 'error');
      return false;
    }

    if (!form.code.trim()) {
      showNotice('Vui lòng nhập mã voucher', 'error');
      return false;
    }

    if (!/^[A-Z0-9_-]+$/i.test(form.code.trim())) {
      showNotice('Mã voucher chỉ nên gồm chữ, số, dấu gạch ngang hoặc gạch dưới', 'error');
      return false;
    }

    if (!form.name.trim()) {
      showNotice('Vui lòng nhập tên chương trình', 'error');
      return false;
    }

    if (!form.discountValue.trim()) {
      showNotice('Vui lòng nhập giá trị giảm', 'error');
      return false;
    }

    const discountValue = Number(form.discountValue);

    if (Number.isNaN(discountValue) || discountValue <= 0) {
      showNotice('Giá trị giảm không hợp lệ', 'error');
      return false;
    }

    if (form.discountType === 'percent' && discountValue > 100) {
      showNotice('Phần trăm giảm không được vượt quá 100%', 'error');
      return false;
    }

    if (form.discountType === 'fixed' && discountValue < 1000) {
      showNotice('Số tiền giảm nên lớn hơn hoặc bằng 1.000đ', 'error');
      return false;
    }

    if (form.maxDiscount && Number(form.maxDiscount) < 0) {
      showNotice('Giảm tối đa không hợp lệ', 'error');
      return false;
    }

    if (form.minOrderValue && Number(form.minOrderValue) < 0) {
      showNotice('Đơn tối thiểu không hợp lệ', 'error');
      return false;
    }

    if (form.usageLimit && Number(form.usageLimit) <= 0) {
      showNotice('Số lượt sử dụng phải lớn hơn 0', 'error');
      return false;
    }

    if (!form.applicableRoomTypeIds.length) {
      showNotice('Vui lòng chọn loại phòng áp dụng', 'error');
      return false;
    }


    if (!form.startDate) {
      showNotice('Vui lòng chọn thời gian bắt đầu', 'error');
      return false;
    }

    if (!form.endDate) {
      showNotice('Vui lòng chọn thời gian kết thúc', 'error');
      return false;
    }




    const startTime = new Date(form.startDate).getTime();
    const endTime = new Date(form.endDate).getTime();

    if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
      showNotice('Thời gian áp dụng không hợp lệ', 'error');
      return false;
    }

    if (endTime <= startTime) {
      showNotice('Thời gian kết thúc phải lớn hơn thời gian bắt đầu', 'error');
      return false;
    }



    if (form.perUser && Number(form.perUser) <= 0) {
      showNotice('Số lần mỗi khách được dùng phải lớn hơn 0', 'error');
      return false;
    }

    if (!form.customerTiers.length) {
      showNotice('Vui lòng chọn ít nhất một hạng khách hàng', 'error');
      return false;
    }

    return true;
  };

  const buildPayload = () => {
    const rules: any[] = [];

    if (form.customerTiers.length > 0) {
      rules.push({
        type: 'customerTier',
        values: form.customerTiers,
      });
    }

    if (Number(form.minOrderValue) > 0) {
      rules.push({
        type: 'minOrder',
        value: Number(form.minOrderValue),
      });
    }

    if (
      form.applicableRoomTypeIds.length > 0 &&
      !form.applicableRoomTypeIds.includes('all')
    ) {
      rules.push({
        type: 'roomType',
        ids: form.applicableRoomTypeIds,
      });
    }

    const action: any = {
      type: form.discountType,
      value: Number(form.discountValue),
    };

    if (form.discountType === 'percent' && Number(form.maxDiscount) > 0) {
      action.max = Number(form.maxDiscount);
    }

    if (form.discountType === 'fixed') {
      // fixed không nhất thiết cần max, nhưng nếu bạn nhập thì vẫn lưu để tương thích UI
      if (Number(form.maxDiscount) > 0) {
        action.max = Number(form.maxDiscount);
      }
    }


    const constraints: any = {
      usageLimit: Number(form.usageLimit || 100),
      usedCount: 0,
      perUser: Number(form.perUser || 1),
    };


    if (form.startDate) {
      constraints.startDate = toIsoDateTime(form.startDate);
    }

    if (form.endDate) {

      constraints.endDate = toIsoDateTime(form.endDate);
    }

    return {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      rules,
      actions: [action],
      constraints,
      status: form.status || 'ACTIVE',
    };
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = buildPayload();

      if (isEdit && voucherId) {
        await partnerVoucherService.updateVoucher(
          String(hotelId),
          String(voucherId),
          payload
        );
      } else {
        await partnerVoucherService.createVoucher(String(hotelId), payload);
      }

      showNotice(
        isEdit ? 'Cập nhật voucher thành công' : 'Tạo voucher thành công',
        'success'
      );

      setTimeout(() => {
        router.push({
          pathname: '/partner/vouchers' as any,
          params: { hotelId },
        });
      }, 700);
    } catch (err: any) {
      console.error('Lỗi lưu voucher:', err);

      showNotice(
        err?.response?.data?.message ||
          err?.message ||
          'Lưu voucher thất bại',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTestApply = async () => {
    try {
      const result = await partnerVoucherService.applyVoucher(String(hotelId), {
        code: form.code || 'FLASH30',
        totalPrice: 1000000,
        bookingType: 'overnight',
        stayDays: 2,
                
        customerTier: 'VIP',
        userUsage: 0,

      });

      showNotice(
        `Test OK: giảm ${Number(result.discount || 0).toLocaleString(
          'vi-VN'
        )}đ, thanh toán ${Number(result.finalPrice || 0).toLocaleString(
          'vi-VN'
        )}đ`,
        'success'
      );
    } catch (err: any) {
      showNotice(
        err?.response?.data?.message ||
          err?.message ||
          'Test apply voucher thất bại',
        'error'
      );
    }
  };


  const applyTemplate = (type: string) => {
    const startAt = new Date();

    startAt.setHours(20, 0, 0, 0);

    const endAt = new Date();
    endAt.setMonth(endAt.getMonth() + 1);
    endAt.setHours(23, 59, 0, 0);


    const formatDateTimeLocal = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const commonDates = {
      startDate: formatDateTimeLocal(startAt),
      endDate: formatDateTimeLocal(endAt),
    };


    const templates: Record<string, any> = {
      flash: {
        code: 'FLASH30',
        name: 'Flash sale giờ vàng',
        discountType: 'percent',
        discountValue: '30',
        minOrderValue: '500000',
        maxDiscount: '200000',
        usageLimit: '100',
        perUser: '1',
        customerTiers: ['REGULAR', 'RETURNING', 'LOYAL', 'VIP'],
      },

      flashNight: {
        code: 'FLASHNIGHT30',
        name: 'Flash sale đêm',
        discountType: 'percent',
        discountValue: '30',
        minOrderValue: '500000',
        maxDiscount: '220000',
        usageLimit: '80',
        perUser: '1',
        customerTiers: ['REGULAR', 'RETURNING', 'LOYAL', 'VIP'],
      },

      loyal: {
        code: 'LOYAL15',
        name: 'Ưu đãi khách hàng thân thiết',
        discountType: 'percent',
        discountValue: '15',
        minOrderValue: '700000',
        maxDiscount: '150000',
        usageLimit: '300',
        perUser: '2',
        customerTiers: ['LOYAL', 'VIP'],
      },

      vip: {
        code: 'VIP25',
        name: 'Ưu đãi khách VIP',
        discountType: 'percent',
        discountValue: '25',
        minOrderValue: '1000000',
        maxDiscount: '300000',
        usageLimit: '100',
        perUser: '2',
        customerTiers: ['VIP'],
      },

      hourly: {
        code: 'HOURLY20',
        name: 'Giảm 20% đặt phòng theo giờ',
        discountType: 'percent',
        discountValue: '20',
        minOrderValue: '',
        maxDiscount: '80000',
        usageLimit: '200',
        perUser: '2',
        customerTiers: ['REGULAR', 'RETURNING', 'LOYAL', 'VIP'],
      },

      stay3days: {
        code: 'STAY3DAYS',
        name: 'Ở từ 3 ngày giảm thêm',
        discountType: 'fixed',
        discountValue: '250000',
        minOrderValue: '1500000',
        maxDiscount: '',
        usageLimit: '150',
        perUser: '1',
        customerTiers: ['REGULAR', 'RETURNING', 'LOYAL', 'VIP'],
      },
    };

    const selected = templates[type];

    if (!selected) return;

    setForm((prev) => ({
      ...prev,
      ...selected,
      ...commonDates,
    }));
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

          <Text style={s.mobileBackTitle}>{pageTitle}</Text>
        </View>
      ) : null}

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {!isMobile && (
          <View style={s.pageHeader}>
            <View style={s.pageTitleRow}>
              <TicketPercent size={22} color="#0F172A" />

              <Text style={s.pageTitle}>{pageTitle}</Text>
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

        {loadingDetail ? (
          <View style={s.formSection}>
            <Text style={s.sectionTitle}>Đang tải voucher...</Text>
          </View>
        ) : (
          <View style={s.formSection}>
            <Text style={s.sectionTitle}>Thông tin voucher</Text>
            <View style={s.templateRow}>
              <TouchableOpacity style={s.templateBtn} onPress={() => applyTemplate('flash')}>
                <Text style={s.templateText}>Flash sale</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.templateBtn} onPress={() => applyTemplate('flashNight')}>
                <Text style={s.templateText}>Flash đêm</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.templateBtn} onPress={() => applyTemplate('loyal')}>
                <Text style={s.templateText}>Thân thiết</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.templateBtn} onPress={() => applyTemplate('vip')}>
                <Text style={s.templateText}>VIP</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.templateBtn} onPress={() => applyTemplate('hourly')}>
                <Text style={s.templateText}>Theo giờ</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.templateBtn} onPress={() => applyTemplate('stay3days')}>
                <Text style={s.templateText}>Ở 3 ngày</Text>
              </TouchableOpacity>
            </View>
            <View style={s.field}>
              <Text style={s.label}>
                Mã voucher <Text style={s.required}>*</Text>
              </Text>

              <TextInput
                style={s.input}
                value={form.code}
                onChangeText={(v) => updateField('code', v.toUpperCase())}
                placeholder="VD: FLASH30, VIP25, LOYAL15"
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
            <View style={s.field}>
              <Text style={s.label}>Hạng khách hàng áp dụng</Text>

              <View style={s.roomTypeGrid}>
                {customerTierOptions.map((tier) => {
                  const selected = form.customerTiers.includes(tier.id);

                  return (
                    <TouchableOpacity
                      key={tier.id}
                      style={[
                        s.roomTypeItem,
                        selected && s.roomTypeItemSelected,
                      ]}
                      onPress={() => toggleCustomerTier(tier.id)}
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
                        {tier.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={s.roomTypeHint}>
                Voucher chỉ áp dụng cho các hạng khách hàng đã chọn.
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
                <Text style={s.label}>Mỗi khách dùng tối đa</Text>

                <TextInput
                  style={s.input}
                  value={form.perUser}
                  onChangeText={(v) =>
                    updateField('perUser', v.replace(/[^0-9]/g, ''))
                  }
                  placeholder="1"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>

              <View style={[s.field, { flex: 1 }]}>
                <Text style={s.label}>Trạng thái</Text>

                <View style={s.segment}>
                  <TouchableOpacity
                    style={[
                      s.segmentItem,
                      form.status === 'ACTIVE' && s.segmentItemActive,
                    ]}
                    onPress={() => updateField('status', 'ACTIVE')}
                  >
                    <Text
                      style={[
                        s.segmentText,
                        form.status === 'ACTIVE' && s.segmentTextActive,
                      ]}
                    >
                      Hoạt động
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      s.segmentItem,
                      form.status === 'INACTIVE' && s.segmentItemActive,
                    ]}
                    onPress={() => updateField('status', 'INACTIVE')}
                  >
                    <Text
                      style={[
                        s.segmentText,
                        form.status === 'INACTIVE' && s.segmentTextActive,
                      ]}
                    >
                      Tạm tắt
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={s.row}>
              <View style={[s.field, { flex: 1 }]}>
                <Text style={s.label}>Thời gian bắt đầu</Text>


                <DateTimePickerInput
                  value={form.startDate}
                  onChange={(v) => updateField('startDate', v)}
                />

              </View>

              <View style={[s.field, { flex: 1 }]}>
                <Text style={s.label}>Thời gian kết thúc</Text>


                <DateTimePickerInput
                  value={form.endDate}
                  onChange={(v) => updateField('endDate', v)}
                />

              </View>
            </View>
          </View>
        )}

        <View style={s.actions}>
          <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()}>
            <Text style={s.cancelText}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.submitBtn, loading && s.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={s.submitText}>{submitText}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.testActions}>
          <TouchableOpacity style={s.testBtn} onPress={handleTestApply}>
            <Text style={s.testText}>Test apply voucher</Text>
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
  submitBtnDisabled: {
    opacity: 0.6,
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
  testActions: {
    marginHorizontal: isMobile ? 16 : 20,
    marginTop: 12,
  },
  testBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#99F6E4',
    alignItems: 'center',
  },
  testText: {
    color: '#0F766E',
    fontWeight: '800',
  },
  templateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },

  templateBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#99F6E4',
  },

  templateText: {
    color: '#0F766E',
    fontWeight: '700',
    fontSize: 12, 
  },
  
  dateTimePickerBox: {
    gap: 10,
  },

  timeWheelWrap: {
    flexDirection: 'row',
    gap: 12,
  },

  timeWheelColumn: {
    flex: 1,
  },

  timeWheelLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },

  timeWheel: {
    height: 150,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 6,
  },

  timeWheelItem: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    borderRadius: 8,
  },

  timeWheelItemActive: {
    backgroundColor: '#0D9488',
  },

  timeWheelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },

  timeWheelTextActive: {
    color: '#FFFFFF',
  },

});
