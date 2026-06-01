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

const getHotelAddressText = (hotel: any) => {
  const district = hotel?.address?.district || '';
  const city = hotel?.address?.city || '';
  const fullAddress = hotel?.address?.fullAddress || '';

  if (fullAddress) return fullAddress;
  if (district && city) return `${district}, ${city}`;
  if (city) return city;
  if (district) return district;

  return 'Chưa có địa chỉ';
};

const hourOptions = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, '0')
);

const minuteOptions = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, '0')
);

const splitDateTimeValue = (value: string) => {
  if (!value) {
    return {
      date: '',
      hour: '00',
      minute: '00',
    };
  }

  const [datePart, timePart] = value.split('T');
  const [hourPart, minutePart] = (timePart || '').split(':');

  return {
    date: datePart || '',
    hour: hourOptions.includes(hourPart || '') ? hourPart! : '00',
    minute: minuteOptions.includes(minutePart || '') ? minutePart! : '00',
  };
};

const mergeDateTimeValue = (date: string, hour: string, minute: string) => {
  if (!date) return '';

  return `${date}T${hour}:${minute}`;
};

const DateTimePickerInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const current = splitDateTimeValue(value);

  const handleDateChange = (date: string) => {
    onChange(mergeDateTimeValue(date, current.hour, current.minute));
  };

  const handleHourChange = (hour: string) => {
    onChange(mergeDateTimeValue(current.date, hour, current.minute));
  };

  const handleMinuteChange = (minute: string) => {
    onChange(mergeDateTimeValue(current.date, current.hour, minute));
  };

  if (Platform.OS === 'web') {
    return (
      <View style={s.dateTimeInline}>
        {React.createElement('input' as any, {
          type: 'date',
          value: current.date,
          onChange: (e: any) => handleDateChange(e.target.value),
          style: {
            flex: 1,
            minWidth: 160,
            height: 44,
            borderRadius: 10,
            border: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            padding: '0 12px',
            fontSize: 14,
            color: '#1E293B',
            outline: 'none',
            boxSizing: 'border-box',
          },
        })}

        {React.createElement(
          'select' as any,
          {
            value: current.hour,
            onChange: (e: any) => handleHourChange(e.target.value),
            style: {
              width: 76,
              height: 44,
              borderRadius: 10,
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              padding: '0 10px',
              fontSize: 14,
              color: '#1E293B',
              outline: 'none',
              boxSizing: 'border-box',
              fontWeight: 700,
            },
          },
          hourOptions.map((hour) =>
            React.createElement(
              'option' as any,
              {
                key: hour,
                value: hour,
              },
              hour
            )
          )
        )}

        <Text style={s.timeColon}>:</Text>

        {React.createElement(
          'select' as any,
          {
            value: current.minute,
            onChange: (e: any) => handleMinuteChange(e.target.value),
            style: {
              width: 76,
              height: 44,
              borderRadius: 10,
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              padding: '0 10px',
              fontSize: 14,
              color: '#1E293B',
              outline: 'none',
              boxSizing: 'border-box',
              fontWeight: 700,
            },
          },
          minuteOptions.map((minute) =>
            React.createElement(
              'option' as any,
              {
                key: minute,
                value: minute,
              },
              minute
            )
          )
        )}
      </View>
    );
  }

  return (
    <View style={s.dateTimeInline}>
      <TextInput
        style={[s.input, { flex: 1 }]}
        value={current.date}
        onChangeText={handleDateChange}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#94A3B8"
      />

      <TextInput
        style={[s.input, s.timeInput]}
        value={current.hour}
        onChangeText={(text) => {
          const clean = text.replace(/[^0-9]/g, '').slice(0, 2);
          const numeric = Number(clean);

          if (clean.length === 2 && numeric >= 0 && numeric <= 23) {
            handleHourChange(clean);
          } else if (!clean) {
            handleHourChange('00');
          }
        }}
        placeholder="00"
        placeholderTextColor="#94A3B8"
        keyboardType="numeric"
        maxLength={2}
      />

      <Text style={s.timeColon}>:</Text>

      <TextInput
        style={[s.input, s.timeInput]}
        value={current.minute}
        onChangeText={(text) => {
          const clean = text.replace(/[^0-9]/g, '').slice(0, 2);
          const numeric = Number(clean);

          if (clean.length === 2 && numeric >= 0 && numeric <= 59) {
            handleMinuteChange(clean);
          } else if (!clean) {
            handleMinuteChange('00');
          }
        }}
        placeholder="00"
        placeholderTextColor="#94A3B8"
        keyboardType="numeric"
        maxLength={2}
      />
    </View>
  );
};

export default function VoucherFormPage() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    id?: string;
    voucherId?: string;
    hotelId?: string;
  }>();

  const initialHotelId =
    typeof params.hotelId === 'string' && params.hotelId
      ? params.hotelId
      : '';

  const [activeHotelId, setActiveHotelId] = useState(initialHotelId);

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

  const [hotels, setHotels] = useState<any[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [hotelSearch, setHotelSearch] = useState('');
  const [showHotelSuggestions, setShowHotelSuggestions] = useState(false);

  const pageTitle = useMemo(() => {
    return isEdit ? 'Chỉnh sửa voucher' : 'Tạo voucher mới';
  }, [isEdit]);

  const submitText = useMemo(() => {
    if (loading) return isEdit ? 'Đang cập nhật...' : 'Đang tạo...';
    return isEdit ? 'Cập nhật voucher' : 'Tạo voucher';
  }, [loading, isEdit]);

  const hotelSuggestions = useMemo(() => {
    const q = hotelSearch.trim().toLowerCase();

    if (!q) {
      return hotels.slice(0, 8);
    }

    return hotels
      .filter((hotel: any) => {
        const name = String(hotel.name || '').toLowerCase();
        const city = String(hotel.address?.city || '').toLowerCase();
        const district = String(hotel.address?.district || '').toLowerCase();
        const fullAddress = String(
          hotel.address?.fullAddress || ''
        ).toLowerCase();

        return (
          name.includes(q) ||
          city.includes(q) ||
          district.includes(q) ||
          fullAddress.includes(q)
        );
      })
      .slice(0, 8);
  }, [hotels, hotelSearch]);

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
    const loadHotels = async () => {
      try {
        const hotelRes = await partnerService.getHotels();
        const hotelItems = Array.isArray(hotelRes.items) ? hotelRes.items : [];

        setHotels(hotelItems);

        if (!hotelItems.length) {
          setSelectedHotel(null);
          setHotelSearch('');
          setActiveHotelId('');
          return;
        }

        const matchedHotel = initialHotelId
          ? hotelItems.find((hotel: any) => hotel.id === initialHotelId)
          : null;

        const initialHotel = matchedHotel || hotelItems[0];

        setSelectedHotel(initialHotel);
        setHotelSearch(initialHotel.name || '');
        setActiveHotelId(initialHotel.id);
      } catch (err) {
        console.error('Không tải được danh sách khách sạn:', err);
      }
    };

    loadHotels();
  }, [initialHotelId]);

  useEffect(() => {
    if (!activeHotelId) return;

    const loadRoomTypes = async () => {
      try {
        const roomTypes = await partnerService.getRoomTypes(
          String(activeHotelId)
        );

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
  }, [activeHotelId]);

  useEffect(() => {
    if (!isEdit || !voucherId || !activeHotelId) return;

    const loadVoucher = async () => {
      try {
        setLoadingDetail(true);

        const voucher = await partnerVoucherService.getVoucherById(
          String(activeHotelId),
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

          applicableRoomTypeIds: voucher.applicableRoomTypeIds?.length
            ? voucher.applicableRoomTypeIds
            : ['all'],

          customerTiers: customerTierRule?.values?.length
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
  }, [voucherId, activeHotelId, isEdit]);

  const handleHotelSearchChange = (value: string) => {
    setHotelSearch(value);

    if (!isEdit) {
      setShowHotelSuggestions(true);
    }
  };

  const closeHotelSuggestions = () => {
    setTimeout(() => {
      setShowHotelSuggestions(false);
    }, 150);
  };

  const handleSelectHotel = (hotel: any) => {
    if (isEdit) return;

    setSelectedHotel(hotel);
    setActiveHotelId(hotel.id);
    setHotelSearch(hotel.name || '');
    setShowHotelSuggestions(false);

    setForm((prev) => ({
      ...prev,
      applicableRoomTypeIds: ['all'],
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
    if (!activeHotelId) {
      showNotice('Không tìm thấy khách sạn để lưu voucher', 'error');
      return false;
    }

    if (!form.code.trim()) {
      showNotice('Vui lòng nhập mã voucher', 'error');
      return false;
    }

    if (!/^[A-Z0-9_-]+$/i.test(form.code.trim())) {
      showNotice(
        'Mã voucher chỉ nên gồm chữ, số, dấu gạch ngang hoặc gạch dưới',
        'error'
      );
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

    if (Number(form.maxDiscount) > 0) {
      action.max = Number(form.maxDiscount);
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
          String(activeHotelId),
          String(voucherId),
          payload
        );
      } else {
        await partnerVoucherService.createVoucher(
          String(activeHotelId),
          payload
        );
      }

      showNotice(
        isEdit ? 'Cập nhật voucher thành công' : 'Tạo voucher thành công',
        'success'
      );

      setTimeout(() => {
        router.push({
          pathname: '/partner/vouchers' as any,
          params: { hotelId: activeHotelId },
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
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <ArrowLeft size={20} color="#1E293B" />
          </TouchableOpacity>

          <Text style={s.mobileBackTitle}>{pageTitle}</Text>
        </View>
      ) : null}

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {!isMobile && (
          <View style={s.pageHeader}>
            <View style={s.pageTitleRow}>
              <TicketPercent size={22} color="#0D9488" />

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

            <View style={[s.field, s.hotelSelectField]}>
              <Text style={s.label}>
                Khách sạn áp dụng <Text style={s.required}>*</Text>
              </Text>

              <View style={s.hotelSearchBox}>
                <TextInput
                  style={[s.input, isEdit && s.inputDisabled]}
                  value={hotelSearch}
                  onChangeText={handleHotelSearchChange}
                  onFocus={() => {
                    if (!isEdit) setShowHotelSuggestions(true);
                  }}
                  onBlur={closeHotelSuggestions}
                  editable={!isEdit}
                  placeholder="Nhập tên khách sạn, quận/huyện hoặc thành phố..."
                  placeholderTextColor="#94A3B8"
                />

                {showHotelSuggestions && !isEdit ? (
                  <View style={s.hotelSuggestionBox}>
                    {hotelSuggestions.length > 0 ? (
                      hotelSuggestions.map((hotel: any) => {
                        const active = hotel.id === activeHotelId;

                        return (
                          <TouchableOpacity
                            key={hotel.id}
                            style={[
                              s.hotelSuggestionItem,
                              active && s.hotelSuggestionItemActive,
                            ]}
                            onPress={() => handleSelectHotel(hotel)}
                          >
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  s.hotelSuggestionName,
                                  active && s.hotelSuggestionNameActive,
                                ]}
                                numberOfLines={1}
                              >
                                {hotel.name}
                              </Text>

                              <Text
                                style={s.hotelSuggestionAddress}
                                numberOfLines={1}
                              >
                                {getHotelAddressText(hotel)}
                              </Text>
                            </View>

                            {active ? (
                              <Text style={s.hotelSelectedText}>Đang chọn</Text>
                            ) : null}
                          </TouchableOpacity>
                        );
                      })
                    ) : (
                      <View style={s.hotelSuggestionEmpty}>
                        <Text style={s.hotelSuggestionEmptyText}>
                          Không tìm thấy khách sạn phù hợp
                        </Text>
                      </View>
                    )}
                  </View>
                ) : null}
              </View>

              {selectedHotel ? (
                <Text style={s.roomTypeHint}>
                  {isEdit
                    ? `Đang sửa voucher của khách sạn: ${selectedHotel.name}`
                    : `Voucher sẽ được tạo cho khách sạn: ${selectedHotel.name}`}
                </Text>
              ) : (
                <Text style={s.roomTypeHint}>
                  Vui lòng chọn khách sạn trước khi tạo voucher.
                </Text>
              )}
            </View>

            <View style={s.templateRow}>
              <TouchableOpacity
                style={s.templateBtn}
                onPress={() => applyTemplate('flash')}
              >
                <Text style={s.templateText}>Flash sale</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.templateBtn}
                onPress={() => applyTemplate('flashNight')}
              >
                <Text style={s.templateText}>Flash đêm</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.templateBtn}
                onPress={() => applyTemplate('loyal')}
              >
                <Text style={s.templateText}>Thân thiết</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.templateBtn}
                onPress={() => applyTemplate('vip')}
              >
                <Text style={s.templateText}>VIP</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.templateBtn}
                onPress={() => applyTemplate('hourly')}
              >
                <Text style={s.templateText}>Theo giờ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.templateBtn}
                onPress={() => applyTemplate('stay3days')}
              >
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
                placeholder="VD: Flash sale giờ vàng"
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
                <Text style={s.label}>
                  Thời gian bắt đầu <Text style={s.required}>*</Text>
                </Text>

                <DateTimePickerInput
                  value={form.startDate}
                  onChange={(v) => updateField('startDate', v)}
                />

                <Text style={s.dateTimeHint}>
                  Chọn ngày và giờ bắt đầu áp dụng voucher.
                </Text>
              </View>

              <View style={[s.field, { flex: 1 }]}>
                <Text style={s.label}>
                  Thời gian kết thúc <Text style={s.required}>*</Text>
                </Text>

                <DateTimePickerInput
                  value={form.endDate}
                  onChange={(v) => updateField('endDate', v)}
                />

                <Text style={s.dateTimeHint}>
                  Chọn ngày và giờ kết thúc áp dụng voucher.
                </Text>
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
    position: 'relative',
    zIndex: 20,
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

  hotelSelectField: {
    position: 'relative',
    zIndex: 100,
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

  inputDisabled: {
    opacity: 0.7,
  },

  hotelSearchBox: {
    position: 'relative',
    zIndex: 120,
  },

  hotelSuggestionBox: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    maxHeight: 280,
    overflow: 'hidden',
    zIndex: 999,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 8,
  },

  hotelSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  hotelSuggestionItemActive: {
    backgroundColor: '#F0FDFA',
  },

  hotelSuggestionName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },

  hotelSuggestionNameActive: {
    color: '#0D9488',
  },

  hotelSuggestionAddress: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748B',
  },

  hotelSelectedText: {
    marginLeft: 10,
    fontSize: 12,
    fontWeight: '800',
    color: '#0D9488',
  },

  hotelSuggestionEmpty: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  hotelSuggestionEmptyText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
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

  dateTimeHint: {
    marginTop: 6,
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  dateTimeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  timeColon: {
    fontSize: 18,
    fontWeight: '900',
    color: '#64748B',
  },

  timeInput: {
    width: 64,
    textAlign: 'center',
    fontWeight: '800',
  },

});