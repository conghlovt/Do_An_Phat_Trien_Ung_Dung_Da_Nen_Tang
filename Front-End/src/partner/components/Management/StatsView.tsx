import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  BarChart3,
  Banknote,
  Star,
  DoorOpen,
  ClipboardList,
  Hotel as HotelIcon,
  Plus,
  User,
  Calendar,
  Building2,
  PieChart,
} from 'lucide-react-native';
import Svg, {
  Circle,
  G,
  Line,
  Path,
  Polyline,
  Text as SvgText,
} from 'react-native-svg';

import { hotelService } from '../../services/hotel.service';
import { bookingService } from '../../services/booking.service';
import { Hotel } from '../../types/hotel.type';
import { Booking } from '../../types/booking.type';

const isMobile = Platform.OS !== 'web';

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTH_LABELS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

type RevenueRange = '7d' | '30d' | 'quarter' | 'year' | 'all';

type ChartPoint = {
  day: string;
  value: number;
};

type PieItem = {
  status: string;
  label: string;
  count: number;
  color: string;
  bg: string;
};

const REVENUE_RANGE_OPTIONS: { key: RevenueRange; label: string; title: string }[] = [
  { key: '7d', label: '7 ngày', title: 'Doanh thu hoàn thành 7 ngày qua' },
  { key: '30d', label: '30 ngày', title: 'Doanh thu hoàn thành 30 ngày qua' },
  { key: 'quarter', label: '1 quý', title: 'Doanh thu hoàn thành 1 quý gần đây' },
  { key: 'year', label: '1 năm', title: 'Doanh thu hoàn thành 1 năm gần đây' },
  { key: 'all', label: 'Tất cả', title: 'Doanh thu hoàn thành tất cả thời gian' },
];

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  PENDING: { color: '#F59E0B', bg: '#FFFBEB', label: 'Chờ duyệt' },
  CONFIRMED: { color: '#0D9488', bg: '#F0FDFA', label: 'Đã xác nhận' },
  CHECKED_IN: { color: '#6366F1', bg: '#EEF2FF', label: 'Đã nhận phòng' },
  PAYMENT_PENDING: { color: '#D97706', bg: '#FFF7ED', label: 'Đã trả phòng / Chờ thanh toán' },
  COMPLETED: { color: '#22C55E', bg: '#F0FDF4', label: 'Hoàn thành' },
  CANCELLED: { color: '#EF4444', bg: '#FEF2F2', label: 'Đã hủy' },
};



const STATUS_ORDER = [
  'PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'PAYMENT_PENDING',
  'COMPLETED',
  'CANCELLED',
];

const ROOM_TYPE_COLORS = ['#0D9488', '#2563EB', '#F59E0B', '#8B5CF6', '#EF4444', '#22C55E', '#EC4899', '#14B8A6'];

const LINE_CHART_WIDTH = 760;
const LINE_CHART_HEIGHT = 230;
const LINE_PADDING_LEFT = 44;
const LINE_PADDING_RIGHT = 24;
const LINE_PADDING_TOP = 28;
const LINE_PADDING_BOTTOM = 44;

const PIE_SIZE = 220;
const PIE_RADIUS = 82;
const PIE_CENTER = PIE_SIZE / 2;

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function formatPrice(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return value.toString();
}

function formatFullPrice(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getHotelAddressText(hotel: any) {
  return (
    hotel?.address?.fullAddress ||
    [hotel?.address?.district, hotel?.address?.city].filter(Boolean).join(', ') ||
    hotel?.address?.city ||
    'Chưa có địa chỉ'
  );
}

function getBookingHotelName(booking: any) {
  return booking.property?.name || booking.hotel?.name || booking.hotelName || 'Cơ sở lưu trú';
}

function getBookingRoomName(booking: any) {
  return booking.room?.name || booking.roomName || booking.roomType?.name || 'Phòng chưa xác định';
}

function isBookingMatchHotel(booking: any, hotel: any | null) {
  if (!hotel) return true;

  const bookingHotelId = booking.property?.id || booking.hotel?.id || booking.hotelId || booking.propertyId || '';
  const bookingHotelName = getBookingHotelName(booking).toLowerCase();
  const selectedHotelName = String(hotel.name || '').toLowerCase();

  return (
    bookingHotelId === hotel.id ||
    bookingHotelName === selectedHotelName ||
    bookingHotelName.includes(selectedHotelName) ||
    selectedHotelName.includes(bookingHotelName)
  );
}

function isRevenueBooking(booking: Booking) {
  return booking.status === 'COMPLETED';
}

function getRangeStart(range: RevenueRange) {
  if (range === 'all') return null;

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  if (range === '7d') start.setDate(start.getDate() - 6);
  else if (range === '30d') start.setDate(start.getDate() - 29);
  else if (range === 'quarter') start.setDate(start.getDate() - 89);
  else start.setDate(start.getDate() - 364);

  return start;
}

function isBookingInRange(booking: Booking, range: RevenueRange) {
  if (range === 'all') return true;
  const start = getRangeStart(range);
  if (!start) return true;

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const checkIn = new Date(booking.checkIn);
  return checkIn >= start && checkIn <= end;
}

function buildRevenueChartData(bookings: Booking[], range: RevenueRange) {
  const now = new Date();
  const result: ChartPoint[] = [];

  const getRevenue = (from: Date, to: Date) => {
    return bookings
      .filter((booking) => {
        if (!isRevenueBooking(booking)) return false;
        const checkIn = new Date(booking.checkIn);
        return checkIn >= from && checkIn < to;
      })
      .reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);
  };

  if (range === '7d') {
    for (let i = 6; i >= 0; i--) {
      const from = new Date(now);
      from.setHours(0, 0, 0, 0);
      from.setDate(from.getDate() - i);
      const to = new Date(from);
      to.setDate(to.getDate() + 1);
      result.push({ day: DAY_LABELS[from.getDay()], value: getRevenue(from, to) });
    }
    return result;
  }

  if (range === '30d') {
    for (let i = 9; i >= 0; i--) {
      const from = new Date(now);
      from.setHours(0, 0, 0, 0);
      from.setDate(from.getDate() - i * 3 - 2);
      const to = new Date(from);
      to.setDate(to.getDate() + 3);
      result.push({
        day: `${String(from.getDate()).padStart(2, '0')}/${String(from.getMonth() + 1).padStart(2, '0')}`,
        value: getRevenue(from, to),
      });
    }
    return result;
  }

  if (range === 'quarter') {
    for (let i = 12; i >= 0; i--) {
      const from = new Date(now);
      from.setHours(0, 0, 0, 0);
      from.setDate(from.getDate() - i * 7 - 6);
      const to = new Date(from);
      to.setDate(to.getDate() + 7);
      result.push({ day: `T-${i}`, value: getRevenue(from, to) });
    }
    return result;
  }

  if (range === 'year') {
    for (let i = 11; i >= 0; i--) {
      const from = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const to = new Date(from.getFullYear(), from.getMonth() + 1, 1);
      result.push({ day: MONTH_LABELS[from.getMonth()], value: getRevenue(from, to) });
    }
    return result;
  }

  const completedBookings = bookings
    .filter(isRevenueBooking)
    .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime());

  if (!completedBookings.length) return [{ day: 'Tất cả', value: 0 }];

  const monthMap = new Map<string, number>();

  for (const booking of completedBookings) {
    const date = new Date(booking.checkIn);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(key, (monthMap.get(key) || 0) + Number(booking.totalPrice || 0));
  }

  return Array.from(monthMap.entries()).slice(-12).map(([key, value]) => {
    const [, month] = key.split('-');
    return { day: `T${Number(month)}`, value };
  });
}

function buildStatusPieData(bookings: Booking[], range: RevenueRange) {
  const source = bookings.filter((booking) => isBookingInRange(booking, range));

  return STATUS_ORDER.map((status) => {
    const count = source.filter((booking) => booking.status === status).length;
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
    return { status, label: cfg.label, count, color: cfg.color, bg: cfg.bg };
  }).filter((item) => item.count > 0);
}

function buildRoomTypePieData(bookings: Booking[], range: RevenueRange) {
  const source = bookings.filter((booking) => isBookingInRange(booking, range));
  const roomMap = new Map<string, number>();

  for (const booking of source as any[]) {
    const roomName = getBookingRoomName(booking);
    roomMap.set(roomName, (roomMap.get(roomName) || 0) + 1);
  }

  return Array.from(roomMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([roomName, count], index) => ({
      status: roomName,
      label: roomName,
      count,
      color: ROOM_TYPE_COLORS[index % ROOM_TYPE_COLORS.length],
      bg: '#F8FAFC',
    }));
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [`M ${x} ${y}`, `L ${start.x} ${start.y}`, `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`, 'Z'].join(' ');
}

function RevenueLineChart({ data }: { data: ChartPoint[] }) {
  const safeData = data.length ? data : [{ day: '-', value: 0 }];
  const maxValue = Math.max(...safeData.map((item) => item.value), 1);
  const chartWidth = LINE_CHART_WIDTH - LINE_PADDING_LEFT - LINE_PADDING_RIGHT;
  const chartHeight = LINE_CHART_HEIGHT - LINE_PADDING_TOP - LINE_PADDING_BOTTOM;

  const points = safeData.map((item, index) => {
    const x = LINE_PADDING_LEFT + (safeData.length <= 1 ? chartWidth / 2 : (index * chartWidth) / (safeData.length - 1));
    const y = LINE_PADDING_TOP + chartHeight - (item.value / maxValue) * chartHeight;
    return { ...item, x, y };
  });

  const polylinePoints = points.map((item) => `${item.x},${item.y}`).join(' ');

  return (
    <View style={s.lineChartWrap}>
      <Svg width="100%" height={LINE_CHART_HEIGHT} viewBox={`0 0 ${LINE_CHART_WIDTH} ${LINE_CHART_HEIGHT}`}>
        {[0, 1, 2, 3].map((lineIndex) => {
          const y = LINE_PADDING_TOP + (lineIndex * chartHeight) / 3;
          return (
            <Line
              key={`grid-${lineIndex}`}
              x1={LINE_PADDING_LEFT}
              x2={LINE_CHART_WIDTH - LINE_PADDING_RIGHT}
              y1={y}
              y2={y}
              stroke="#E2E8F0"
              strokeWidth={1}
            />
          );
        })}

        <Polyline
          points={polylinePoints}
          fill="none"
          stroke="#0D9488"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((item, index) => (
          <G key={`${item.day}-${index}`}>
            <Circle cx={item.x} cy={item.y} r={5} fill="#0D9488" stroke="#FFFFFF" strokeWidth={2} />
            <SvgText x={item.x} y={item.y - 12} fontSize="10" fontWeight="700" fill="#64748B" textAnchor="middle">
              {item.value > 0 ? formatPrice(item.value) : '-'}
            </SvgText>
            <SvgText x={item.x} y={LINE_CHART_HEIGHT - 14} fontSize="11" fontWeight="700" fill="#64748B" textAnchor="middle">
              {item.day}
            </SvgText>
          </G>
        ))}
      </Svg>
    </View>
  );
}

function GenericPieChart({ data, centerLabel, emptyIcon }: { data: PieItem[]; centerLabel: string; emptyIcon: React.ReactNode }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return (
      <View style={s.pieEmptyBox}>
        {emptyIcon}
        <Text style={s.chartEmptyText}>Chưa có dữ liệu trong khoảng thời gian này</Text>
      </View>
    );
  }

  let currentAngle = 0;

  return (
    <View style={s.pieContentCompact}>
      <View style={s.pieSvgBox}>
        <Svg width={PIE_SIZE} height={PIE_SIZE}>
          {data.map((item) => {
            const angle = (item.count / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle += angle;

            return (
              <Path
                key={item.status}
                d={describeArc(PIE_CENTER, PIE_CENTER, PIE_RADIUS, startAngle, endAngle)}
                fill={item.color}
              />
            );
          })}

          <Circle cx={PIE_CENTER} cy={PIE_CENTER} r={42} fill="#FFFFFF" />
          <SvgText x={PIE_CENTER} y={PIE_CENTER - 4} textAnchor="middle" fontSize="22" fontWeight="900" fill="#0F172A">
            {total}
          </SvgText>
          <SvgText x={PIE_CENTER} y={PIE_CENTER + 16} textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748B">
            {centerLabel}
          </SvgText>
        </Svg>
      </View>

      <View style={s.pieLegend}>
        {data.map((item) => {
          const percent = Math.round((item.count / total) * 100);
          return (
            <View key={item.status} style={s.pieLegendItem}>
              <View style={[s.pieLegendDot, { backgroundColor: item.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.pieLegendLabel} numberOfLines={1}>{item.label}</Text>
                <Text style={s.pieLegendSub}>{item.count} lượt · {percent}%</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function BookingStatusPieChart({ data }: { data: PieItem[] }) {
  return <GenericPieChart data={data} centerLabel="Tổng đơn" emptyIcon={<ClipboardList size={32} color="#CBD5E1" />} />;
}

function RoomTypePieChart({ data }: { data: PieItem[] }) {
  return <GenericPieChart data={data} centerLabel="Lượt đặt" emptyIcon={<DoorOpen size={32} color="#CBD5E1" />} />;
}

export function StatsView() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [noHotel, setNoHotel] = useState(false);
  const [hotels, setHotels] = useState<any[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<any | null>(null);
  const [hotelDetail, setHotelDetail] = useState<Hotel | null>(null);
  const [hotelSearch, setHotelSearch] = useState('');
  const [showHotelSuggestions, setShowHotelSuggestions] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [revenueRange, setRevenueRange] = useState<RevenueRange>('all');

  useEffect(() => {
    let mounted = true;

const loadData = async () => {
      try {
        setIsLoading(true);
        const hotelRes = await hotelService.getHotels();
        const hotelItems = Array.isArray(hotelRes.items) ? hotelRes.items : [];
        
        if (!mounted) return;
        setHotels(hotelItems);

        if (hotelItems.length === 0) {
          setNoHotel(true);
          return;
        }

        const bookingData = await bookingService.getBookings();
        if (!mounted) return;

        setBookings(Array.isArray(bookingData) ? bookingData : []);
      } catch (err) {
        console.error('Không tải được dữ liệu thống kê:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const hotelSuggestions = useMemo(() => {
    const q = hotelSearch.trim().toLowerCase();
    if (!q) return hotels.slice(0, 8);

    return hotels
      .filter((hotel: any) => {
        const name = String(hotel.name || '').toLowerCase();
        const city = String(hotel.address?.city || '').toLowerCase();
        const district = String(hotel.address?.district || '').toLowerCase();
        const fullAddress = String(hotel.address?.fullAddress || '').toLowerCase();
        return name.includes(q) || city.includes(q) || district.includes(q) || fullAddress.includes(q);
      })
      .slice(0, 8);
  }, [hotels, hotelSearch]);

  const handleSelectAllHotels = () => {
    setSelectedHotel(null);
    setHotelDetail(null);
    setHotelSearch('');
    setShowHotelSuggestions(false);
  };

  const handleSelectHotel = async (hotel: any) => {
    try {
      setSelectedHotel(hotel);
      setHotelSearch(hotel.name || '');
      setShowHotelSuggestions(false);
      const detail = await hotelService.getHotel(hotel.id);
      setHotelDetail(detail);
    } catch (err) {
      console.error('Không tải được chi tiết khách sạn:', err);
      setHotelDetail(null);
    }
  };

  const closeHotelSuggestions = () => {
    setTimeout(() => setShowHotelSuggestions(false), 150);
  };

  const scopedBookings = useMemo(() => {
    return bookings.filter((booking: any) => isBookingMatchHotel(booking, selectedHotel));
  }, [bookings, selectedHotel]);

  const todayBookings = useMemo(() => {
    return scopedBookings.filter((booking) => isToday(booking.checkIn) && booking.status !== 'CANCELLED').length;
  }, [scopedBookings]);

  const chartData = useMemo(() => buildRevenueChartData(scopedBookings, revenueRange), [scopedBookings, revenueRange]);
  const statusPieData = useMemo(() => buildStatusPieData(scopedBookings, revenueRange), [scopedBookings, revenueRange]);
  const roomTypePieData = useMemo(() => buildRoomTypePieData(scopedBookings, revenueRange), [scopedBookings, revenueRange]);

  const rangeRevenue = useMemo(() => chartData.reduce((sum, item) => sum + item.value, 0), [chartData]);

  const revenueRangeTitle = useMemo(() => {
    return REVENUE_RANGE_OPTIONS.find((item) => item.key === revenueRange)?.title || 'Doanh thu hoàn thành';
  }, [revenueRange]);

  const revenueRangeLabel = useMemo(() => {
    return REVENUE_RANGE_OPTIONS.find((item) => item.key === revenueRange)?.label || '';
  }, [revenueRange]);

  const completedBookings = useMemo(() => {
    return scopedBookings.filter((booking) => booking.status === 'COMPLETED').length;
  }, [scopedBookings]);

  const checkedInBookings = useMemo(() => {
    return scopedBookings.filter((booking) => booking.status === 'CHECKED_IN').length;
  }, [scopedBookings]);

  const avgRating = useMemo(() => {
    if (selectedHotel) return Number((hotelDetail as any)?.avgRating || selectedHotel.avgRating || 0);
    if (!hotels.length) return 0;
    const total = hotels.reduce((sum, hotel: any) => sum + Number(hotel.avgRating || 0), 0);
    return total / hotels.length;
  }, [selectedHotel, hotelDetail, hotels]);

  const totalRooms = useMemo(() => {
    if (selectedHotel) return Number((hotelDetail as any)?.totalRooms || selectedHotel.totalRooms || 0);
    return hotels.reduce((sum, hotel: any) => sum + Number(hotel.totalRooms || 0), 0);
  }, [selectedHotel, hotelDetail, hotels]);

  const recentBookings = useMemo(() => {
    return [...scopedBookings]
      .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())
      .slice(0, 5);
  }, [scopedBookings]);

  if (isLoading) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator size="large" color="#0F766E" />
      </View>
    );
  }

  if (noHotel) {
    return (
      <View style={s.container}>
        <View style={s.mobilePageHeader}>
          <Text style={s.mobilePageTitle}>Thống kê</Text>
        </View>

        <View style={s.noHotelWrapper}>
          <View style={s.noHotelIconBox}>
            <HotelIcon size={40} color="#0D9488" />
          </View>
          <Text style={s.noHotelTitle}>Bạn chưa có khách sạn nào</Text>
          <Text style={s.noHotelSubtitle}>Hãy tạo khách sạn để bắt đầu kinh doanh và theo dõi doanh thu thực tế.</Text>
          <TouchableOpacity style={s.noHotelBtn} onPress={() => router.push('/partner/hotel/new-hotel' as any)}>
            <Plus size={18} color="#FFF" />
            <Text style={s.noHotelBtnText}>Tạo khách sạn ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.mobilePageHeader}>
          <Text style={s.mobilePageTitle}>Thống kê</Text>
          <Text style={s.mobilePageSub}>
            {selectedHotel ? `Tổng quan hiệu suất của ${selectedHotel.name}` : 'Tổng quan hiệu suất tất cả khách sạn'}
          </Text>
        </View>

        <View style={s.hotelSearchSection}>
          <Text style={s.hotelSearchLabel}>Phạm vi thống kê</Text>

          <View style={s.scopeRow}>
            <TouchableOpacity style={[s.allHotelsBtn, !selectedHotel && s.allHotelsBtnActive]} onPress={handleSelectAllHotels}>
              <Text style={[s.allHotelsBtnText, !selectedHotel && s.allHotelsBtnTextActive]}>Tất cả khách sạn</Text>
            </TouchableOpacity>

            <View style={s.hotelSearchBox}>
              <View style={s.hotelSearchInputWrap}>
                <Building2 size={16} color="#94A3B8" />
                <TextInput
                  style={s.hotelSearchInput}
                  value={hotelSearch}
                  onChangeText={(value) => {
                    setHotelSearch(value);
                    setShowHotelSuggestions(true);
                  }}
                  onFocus={() => setShowHotelSuggestions(true)}
                  onBlur={closeHotelSuggestions}
                  placeholder="Nhập tên khách sạn, quận/huyện hoặc thành phố..."
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {showHotelSuggestions ? (
                <View style={s.hotelSuggestionBox}>
                  {hotelSuggestions.length > 0 ? (
                    hotelSuggestions.map((hotel: any) => {
                      const active = selectedHotel?.id === hotel.id;
                      return (
                        <TouchableOpacity
                          key={hotel.id}
                          style={[s.hotelSuggestionItem, active && s.hotelSuggestionItemActive]}
                          onPress={() => handleSelectHotel(hotel)}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={[s.hotelSuggestionName, active && s.hotelSuggestionNameActive]} numberOfLines={1}>{hotel.name}</Text>
                            <Text style={s.hotelSuggestionAddress} numberOfLines={1}>{getHotelAddressText(hotel)}</Text>
                          </View>
                          {active ? <Text style={s.hotelSelectedText}>Đang chọn</Text> : null}
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <View style={s.hotelSuggestionEmpty}>
                      <Text style={s.hotelSuggestionEmptyText}>Không tìm thấy khách sạn phù hợp</Text>
                    </View>
                  )}
                </View>
              ) : null}
            </View>
          </View>

          <Text style={s.scopeText}>
            {selectedHotel ? `Đang xem thống kê của: ${selectedHotel.name}` : `Đang xem thống kê tổng hợp của ${hotels.length} khách sạn`}
          </Text>
        </View>

        <View style={s.grid}>
          <View style={[s.statCard, { backgroundColor: '#0F766E' }]}>
            <View style={s.iconWrapper}><BarChart3 size={24} color="rgba(255,255,255,0.9)" /></View>
            <Text style={s.statNumber}>{todayBookings}</Text>
            <Text style={s.statLabel}>Đặt phòng hôm nay</Text>
          </View>

          <View style={[s.statCard, { backgroundColor: '#0284C7' }]}>
            <View style={s.iconWrapper}><Banknote size={24} color="rgba(255,255,255,0.9)" /></View>
            <Text style={s.statNumber}>{rangeRevenue > 0 ? formatPrice(rangeRevenue) : '0đ'}</Text>
            <Text style={s.statLabel}>Doanh thu hoàn thành {revenueRangeLabel.toLowerCase()}</Text>
          </View>

          <View style={[s.statCard, { backgroundColor: '#8B5CF6' }]}>
            <View style={s.iconWrapper}><Star size={24} color="rgba(255,255,255,0.9)" /></View>
            <Text style={s.statNumber}>{avgRating.toFixed(1)}</Text>
            <Text style={s.statLabel}>Đánh giá TB</Text>
          </View>

          <View style={[s.statCard, { backgroundColor: '#10B981' }]}>
            <View style={s.iconWrapper}><DoorOpen size={24} color="rgba(255,255,255,0.9)" /></View>
            <Text style={s.statNumber}>{totalRooms}</Text>
            <Text style={s.statLabel}>Tổng phòng</Text>
          </View>
        </View>

        <View style={s.secondaryGrid}>
          <View style={s.smallStatCard}><Text style={s.smallStatNumber}>{scopedBookings.length}</Text><Text style={s.smallStatLabel}>Tổng đơn</Text></View>
          <View style={s.smallStatCard}><Text style={s.smallStatNumber}>{checkedInBookings}</Text><Text style={s.smallStatLabel}>Đã nhận phòng</Text></View>
          <View style={s.smallStatCard}><Text style={s.smallStatNumber}>{completedBookings}</Text><Text style={s.smallStatLabel}>Hoàn thành</Text></View>
        </View>

        <View style={s.chartCard}>
          <View style={s.sectionHeader}>
            <View style={s.sectionTitleRow}>
              <BarChart3 size={18} color="#0F766E" />
              <Text style={s.sectionTitle}>{revenueRangeTitle}</Text>
            </View>

            <View style={s.rangeTabs}>
              {REVENUE_RANGE_OPTIONS.map((item) => {
                const active = revenueRange === item.key;
                return (
                  <TouchableOpacity key={item.key} style={[s.rangeTab, active && s.rangeTabActive]} onPress={() => setRevenueRange(item.key)}>
                    <Text style={[s.rangeTabText, active && s.rangeTabTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {rangeRevenue === 0 ? (
            <View style={s.chartEmptyBox}>
              <Banknote size={28} color="#CBD5E1" />
              <Text style={s.chartEmptyText}>Chưa có doanh thu hoàn thành trong khoảng thời gian này</Text>
            </View>
          ) : (
            <RevenueLineChart data={chartData} />
          )}
        </View>

        <View style={s.chartCard}>
          <View style={s.sectionTitleRow}>
            <PieChart size={18} color="#0F766E" />
            <Text style={s.sectionTitle}>Phân tích đơn đặt phòng</Text>
          </View>

          <View style={s.doublePieGrid}>
            <View style={s.piePanel}>
              <Text style={s.piePanelTitle}>Cơ cấu theo trạng thái</Text>
              <BookingStatusPieChart data={statusPieData} />
            </View>

            <View style={s.piePanel}>
              <Text style={s.piePanelTitle}>Tỉ lệ đặt các loại phòng</Text>
              <RoomTypePieChart data={roomTypePieData} />
            </View>
          </View>
        </View>

        <View style={s.chartCard}>
          <View style={s.sectionTitleRow}>
            <ClipboardList size={18} color="#0F766E" />
            <Text style={s.sectionTitle}>Đặt phòng gần đây</Text>
          </View>

          {recentBookings.length === 0 ? (
            <View style={s.emptyCard}>
              <ClipboardList size={32} color="#CBD5E1" style={{ marginBottom: 12 }} />
              <Text style={s.emptyText}>Chưa có đặt phòng nào</Text>
              <Text style={s.emptySubText}>Các đơn đặt phòng mới sẽ xuất hiện tại đây.</Text>
            </View>
          ) : (
            recentBookings.map((booking: any) => {
              const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
              return (
                <View key={booking.id} style={s.bookingRow}>
                  <View style={s.bookingLeft}>
                    <View style={s.bookingAvatar}><User size={14} color="#FFF" /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.bookingName} numberOfLines={1}>{booking.user.username}</Text>
                      <Text style={s.bookingHotelName} numberOfLines={1}>{getBookingHotelName(booking)}</Text>
                      <View style={s.bookingDateRow}>
                        <Calendar size={11} color="#94A3B8" />
                        <Text style={s.bookingDate}>{formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={s.bookingRight}>
                    <Text style={s.bookingPrice}>{formatFullPrice(booking.totalPrice)}</Text>
                    <View style={[s.bookingBadge, { backgroundColor: cfg.bg }]}>
                      <Text style={[s.bookingBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: isMobile ? '#FFF' : '#F8FAFC' },
  center: { justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  mobilePageHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  mobilePageTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  mobilePageSub: { fontSize: 13, color: '#64748B' },
  hotelSearchSection: {
    backgroundColor: '#FFF',
    paddingHorizontal: isMobile ? 16 : 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    position: 'relative',
    zIndex: 100,
  },
  hotelSearchLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  scopeRow: { flexDirection: isMobile ? 'column' : 'row', gap: 10, alignItems: isMobile ? 'stretch' : 'center' },
  allHotelsBtn: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  allHotelsBtnActive: { backgroundColor: '#0D9488', borderColor: '#0D9488' },
  allHotelsBtnText: { color: '#64748B', fontWeight: '700', fontSize: 13 },
  allHotelsBtnTextActive: { color: '#FFF' },
  hotelSearchBox: { flex: 1, maxWidth: 680, position: 'relative', zIndex: 120 },
  hotelSearchInputWrap: {
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
  hotelSearchInput: { flex: 1, color: '#1E293B', fontSize: 14, paddingVertical: 10 },
  hotelSuggestionBox: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 50,
    maxHeight: 290,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 999,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
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
  hotelSuggestionItemActive: { backgroundColor: '#F0FDFA' },
  hotelSuggestionName: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  hotelSuggestionNameActive: { color: '#0D9488' },
  hotelSuggestionAddress: { marginTop: 3, fontSize: 12, color: '#64748B' },
  hotelSelectedText: { marginLeft: 10, fontSize: 12, fontWeight: '800', color: '#0D9488' },
  hotelSuggestionEmpty: { paddingHorizontal: 14, paddingVertical: 14 },
  hotelSuggestionEmptyText: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
  scopeText: { marginTop: 8, fontSize: 12, color: '#64748B', fontWeight: '600' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: isMobile ? 16 : 20,
    paddingTop: 20,
    gap: isMobile ? 10 : 14,
  },
  statCard: {
    borderRadius: 16,
    padding: isMobile ? 16 : 20,
    ...Platform.select({
      web: { width: 'calc(50% - 7px)' as any, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' as any },
      default: {
        width: '47%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6,
      },
    }),
  },
  iconWrapper: {
    marginBottom: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: { fontSize: isMobile ? 24 : 28, fontWeight: '800', color: '#FFF' },
  statLabel: { fontSize: isMobile ? 12 : 13, color: 'rgba(255,255,255,0.9)', marginTop: 4, fontWeight: '500' },
  secondaryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: isMobile ? 16 : 20, paddingTop: 14, gap: 10 },
  smallStatCard: {
    flex: 1,
    minWidth: isMobile ? '30%' : 160,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  smallStatNumber: { fontSize: 20, fontWeight: '900', color: '#0D9488' },
  smallStatLabel: { marginTop: 4, fontSize: 12, color: '#64748B', fontWeight: '600' },
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: isMobile ? 16 : 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.04)' as any },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    }),
  },
  sectionHeader: { marginBottom: 16, gap: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  rangeTabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rangeTab: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rangeTabActive: { backgroundColor: '#0D9488', borderColor: '#0D9488' },
  rangeTabText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  rangeTabTextActive: { color: '#FFF' },
  lineChartWrap: { width: '100%', minHeight: LINE_CHART_HEIGHT },
  doublePieGrid: { flexDirection: isMobile ? 'column' : 'row', gap: 18, alignItems: 'stretch' },
  piePanel: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  piePanelTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  pieContentCompact: { alignItems: 'center', gap: 14 },
  pieSvgBox: { width: PIE_SIZE, height: PIE_SIZE, alignItems: 'center', justifyContent: 'center' },
  pieLegend: { flex: 1, width: '100%', gap: 10 },
  pieLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  pieLegendDot: { width: 12, height: 12, borderRadius: 6 },
  pieLegendLabel: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  pieLegendSub: { marginTop: 2, fontSize: 12, color: '#64748B', fontWeight: '600' },
  pieEmptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 36, gap: 10 },
  chartEmptyBox: { alignItems: 'center', paddingVertical: 36, gap: 10 },
  chartEmptyText: { color: '#94A3B8', fontSize: 14 },
  emptyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyText: { color: '#64748B', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  emptySubText: { color: '#94A3B8', fontSize: 13, textAlign: 'center' },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  bookingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  bookingAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0D9488', justifyContent: 'center', alignItems: 'center' },
  bookingName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  bookingHotelName: { marginTop: 2, fontSize: 12, color: '#0D9488', fontWeight: '700' },
  bookingDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  bookingDate: { fontSize: 12, color: '#94A3B8' },
  bookingRight: { alignItems: 'flex-end', gap: 4 },
  bookingPrice: { fontSize: 14, fontWeight: '800', color: '#0F766E' },
  bookingBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  bookingBadgeText: { fontSize: 11, fontWeight: '700' },
  noHotelWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    ...(Platform.OS === 'web' ? { minHeight: '70vh' as any } : {}),
  },
  noHotelIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDFA',
    borderWidth: 2,
    borderColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  noHotelTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', textAlign: 'center', marginBottom: 8 },
  noHotelSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, maxWidth: 340, marginBottom: 24 },
  noHotelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0D9488',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(13,148,136,0.3)' as any },
      default: { shadowColor: '#0D9488', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    }),
  },
  noHotelBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
