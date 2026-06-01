import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
  Dimensions,
  useWindowDimensions,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { partnerService } from '../../services/partner.service';
import type {
  RoomType,
  HotelListItem,
} from '../../services/partner.service';
import { StatusBadge } from '../shared/StatusBadge';
import { LoadingSpinner, EmptyState } from '../shared/LoadingSpinner';
import {
  BedDouble,
  Plus,
  ChevronLeft,
  ChevronRight,
  Lock,
  Eye,
  Calendar,
  Clock,
  Moon,
  Sun,
  Hotel as HotelIcon,
  Search,
  Building2,
} from 'lucide-react-native';

const { width: SCREEN_W } = Dimensions.get('window');
const isMobile = Platform.OS !== 'web';

type BookingTab = 'hourly' | 'overnight' | 'daily';

const TAB_CONFIG: {
  key: BookingTab;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: 'hourly', label: 'Theo giờ', icon: Clock },
  { key: 'overnight', label: 'Qua đêm', icon: Moon },
  { key: 'daily', label: 'Theo ngày', icon: Sun },
];

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]!;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function formatShortDate(
  dateStr: string,
  isHourly: boolean
): { main: string; sub: string; isCurrent: boolean } {
  const d = new Date(dateStr);
  const now = new Date();

  if (isHourly) {
    const isCurrentHour =
      d.getHours() === now.getHours() && d.getDate() === now.getDate();

    return {
      main: String(d.getHours()).padStart(2, '0') + ':00',
      sub:
        String(d.getDate()).padStart(2, '0') +
        '/' +
        String(d.getMonth() + 1).padStart(2, '0'),
      isCurrent: isCurrentHour,
    };
  }

  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return {
    main:
      String(d.getDate()).padStart(2, '0') +
      '/' +
      String(d.getMonth() + 1).padStart(2, '0'),
    sub: weekdays[d.getDay()]!,
    isCurrent: isToday,
  };
}

function formatPrice(price: number): string {
  if (price >= 1000000) return (price / 1000000).toFixed(1) + 'tr';
  if (price >= 1000) return Math.round(price / 1000) + 'k';
  return price.toLocaleString('vi-VN') + 'đ';
}

function getHotelAddressText(hotel: any) {
  return (
    hotel?.address?.fullAddress ||
    [hotel?.address?.district, hotel?.address?.city].filter(Boolean).join(', ') ||
    hotel?.address?.city ||
    'Chưa có địa chỉ'
  );
}

export function RoomManagement() {
  const router = useRouter();
  const { hotelId: initialHotelId } = useLocalSearchParams();

  const queryHotelId =
    typeof initialHotelId === 'string' && initialHotelId ? initialHotelId : '';

  const [hotels, setHotels] = useState<HotelListItem[]>([]);
  const [hotelId, setHotelId] = useState(queryHotelId || '');
  const [selectedHotel, setSelectedHotel] = useState<HotelListItem | null>(null);
  const [hotelSearch, setHotelSearch] = useState('');
  const [showHotelSuggestions, setShowHotelSuggestions] = useState(false);

  const [hotelStatus, setHotelStatus] = useState<string>('');
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [noHotel, setNoHotel] = useState(false);

  const { width: windowWidth } = useWindowDimensions();
  const isNarrow = windowWidth < 600;

  const [activeTab, setActiveTab] = useState<BookingTab>('daily');
  const [startDate, setStartDate] = useState(() => new Date());
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  const DAYS_COUNT = 14;

  const dateRange = useMemo(() => {
    const dates: string[] = [];

    if (activeTab === 'hourly') {
      const now = new Date();
      now.setMinutes(0, 0, 0);

      for (let i = 0; i < DAYS_COUNT; i++) {
        const h = new Date(now.getTime() + i * 3600000);
        dates.push(h.toISOString());
      }
    } else {
      for (let i = 0; i < DAYS_COUNT; i++) {
        dates.push(formatDate(addDays(startDate, i)));
      }
    }

    return dates;
  }, [startDate, activeTab]);

  const endDateStr = formatDate(addDays(startDate, DAYS_COUNT - 1));

  const hotelSuggestions = useMemo(() => {
    const q = hotelSearch.trim().toLowerCase();

    if (!q) return hotels.slice(0, 8);

    return hotels
      .filter((hotel: any) => {
        const name = String(hotel.name || '').toLowerCase();
        const city = String(hotel.address?.city || '').toLowerCase();
        const district = String(hotel.address?.district || '').toLowerCase();
        const fullAddress = String(hotel.address?.fullAddress || '').toLowerCase();

        return (
          name.includes(q) ||
          city.includes(q) ||
          district.includes(q) ||
          fullAddress.includes(q)
        );
      })
      .slice(0, 8);
  }, [hotels, hotelSearch]);

  const loadHotels = async () => {
    try {
      setRoomsLoading(true);

      const { items } = await partnerService.getHotels();
      const hotelItems = Array.isArray(items) ? items : [];

      setHotels(hotelItems);

      if (!hotelItems.length) {
        setNoHotel(true);
        setHotelId('');
        setSelectedHotel(null);
        setHotelSearch('');
        setRoomsLoading(false);
        return;
      }

      const matchedHotel = queryHotelId
        ? hotelItems.find((hotel: any) => hotel.id === queryHotelId)
        : null;

      const firstHotel = matchedHotel || hotelItems[0];

      setHotelId(firstHotel.id);
      setSelectedHotel(firstHotel);
      setHotelStatus(firstHotel.status);
      setHotelSearch(firstHotel.name || '');
      setNoHotel(false);
    } catch (err) {
      console.error('Không tải được danh sách khách sạn:', err);
      setNoHotel(true);
      setRoomsLoading(false);
    }
  };

  const loadRoomTypes = async (targetHotelId: string) => {
    if (!targetHotelId) return;

    try {
      setRoomsLoading(true);

      const types = await partnerService.getRoomTypes(targetHotelId);
      setRoomTypes(Array.isArray(types) ? types : []);
    } catch (err) {
      console.error('Không tải được loại phòng:', err);
      setRoomTypes([]);
    } finally {
      setRoomsLoading(false);
    }
  };

  const loadCalendar = async (targetHotelId: string) => {
    if (!targetHotelId) return;

    try {
      setCalendarLoading(true);

      const data = await partnerService.getInventoryCalendar(
        targetHotelId,
        formatDate(startDate),
        endDateStr
      );

      setCalendarData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Calendar load error:', err);
      setCalendarData([]);
    } finally {
      setCalendarLoading(false);
    }
  };

  useEffect(() => {
    loadHotels();
  }, [queryHotelId]);

  useEffect(() => {
    if (!hotelId) return;

    loadRoomTypes(hotelId);
    loadCalendar(hotelId);
  }, [hotelId, startDate, endDateStr]);

  const handleHotelSearchChange = (value: string) => {
    setHotelSearch(value);
    setShowHotelSuggestions(true);
  };

  const closeHotelSuggestions = () => {
    setTimeout(() => {
      setShowHotelSuggestions(false);
    }, 150);
  };

  const handleSelectHotel = async (hotel: HotelListItem) => {
    setSelectedHotel(hotel);
    setHotelId(hotel.id);
    setHotelStatus(hotel.status);
    setHotelSearch(hotel.name || '');
    setShowHotelSuggestions(false);

    setRoomTypes([]);
    setCalendarData([]);

    await loadRoomTypes(hotel.id);
    await loadCalendar(hotel.id);
  };

  const onRefresh = async () => {
    if (!hotelId) return;

    setRefreshing(true);

    try {
      await loadRoomTypes(hotelId);
      await loadCalendar(hotelId);
    } catch (err) {
      console.error('Refresh phòng lỗi:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setStartDate((prev) => addDays(prev, direction === 'next' ? 7 : -7));
  };

  const handleCreateRoom = () => {
    if (!hotelId) return;

    router.push(`/partner/room/new-room?hotelId=${hotelId}` as any);
  };

  if (noHotel) {
    return (
      <View style={s.container}>
        <View style={s.noHotelWrapper}>
          <View style={s.noHotelIconBox}>
            <HotelIcon size={40} color="#0D9488" />
          </View>

          <Text style={s.noHotelTitle}>Bạn chưa có khách sạn nào</Text>

          <Text style={s.noHotelSubtitle}>
            Hãy tạo khách sạn trước để có thể thêm và quản lý các loại phòng của bạn.
          </Text>

          <TouchableOpacity
            style={s.noHotelBtn}
            onPress={() => router.push('/partner/hotel/new-hotel' as any)}
          >
            <Plus size={18} color="#FFF" />
            <Text style={s.noHotelBtnText}>Tạo khách sạn ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (roomsLoading && roomTypes.length === 0) return <LoadingSpinner />;

  const displayData =
    calendarData.length > 0
      ? calendarData
      : roomTypes.map((rt) => ({
          id: rt.id,
          name: rt.name,
          totalUnits: rt.totalUnits,
          status: rt.status,
          inventory: {} as any,
          pricing: {} as any,
        }));

  return (
    <View style={s.container}>
      {(isMobile || isNarrow) ? (
        <View style={s.mobilePageHeader}>
          <Text style={s.mobilePageTitle}>Quản lý loại phòng</Text>

          <View style={s.mobilePageHeaderRow}>
            <Text style={s.mobilePageSub}>{roomTypes.length} loại phòng</Text>

            <TouchableOpacity style={s.addBtn} onPress={handleCreateRoom}>
              <Plus size={14} color="#FFF" />
              <Text style={s.addBtnText}>Thêm mới</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={s.pageHeader}>
          <View>
            <View style={s.pageTitleRow}>
              <BedDouble size={20} color="#0F172A" />
              <Text style={s.pageTitle}>Quản lý loại phòng</Text>
            </View>

            <Text style={s.pageSub}>
              {roomTypes.length} loại phòng
              {selectedHotel ? ` · ${selectedHotel.name}` : ''}
            </Text>
          </View>

          <TouchableOpacity style={s.addBtn} onPress={handleCreateRoom}>
            <Plus size={16} color="#FFF" />
            <Text style={s.addBtnText}>Thêm loại phòng</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={s.hotelSearchSection}>
        <Text style={s.hotelSearchLabel}>Chọn khách sạn</Text>

        <View style={s.hotelSearchBox}>
          <View style={s.hotelSearchInputWrap}>
            <Building2 size={16} color="#94A3B8" />

            <TextInput
              style={s.hotelSearchInput}
              value={hotelSearch}
              onChangeText={handleHotelSearchChange}
              onFocus={() => setShowHotelSuggestions(true)}
              onBlur={closeHotelSuggestions}
              placeholder="Nhập tên khách sạn, quận/huyện hoặc thành phố..."
              placeholderTextColor="#94A3B8"
            />
          </View>

          {showHotelSuggestions ? (
            <View style={s.hotelSuggestionBox}>
              {hotelSuggestions.length > 0 ? (
                hotelSuggestions.map((hotel: HotelListItem) => {
                  const active = hotel.id === hotelId;

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

                        <Text style={s.hotelSuggestionAddress} numberOfLines={1}>
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
          <Text style={s.selectedHotelText} numberOfLines={1}>
            Đang xem phòng của: {selectedHotel.name}
          </Text>
        ) : null}
      </View>

      <View style={s.tabsBar}>
        {TAB_CONFIG.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[s.tabItem, isActive && s.tabItemActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Icon size={14} color={isActive ? '#FFF' : '#64748B'} />
              <Text style={[s.tabLabel, isActive && s.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        <View style={s.dateNav}>
          <TouchableOpacity
            style={s.dateNavBtn}
            onPress={() => navigateWeek('prev')}
          >
            <ChevronLeft size={18} color="#64748B" />
          </TouchableOpacity>

          <View style={s.dateNavCenter}>
            <Calendar size={14} color="#1E293B" />
            <Text style={s.dateNavText}>
              {activeTab === 'hourly'
                ? `${formatShortDate(dateRange[0]!, true).main} — ${
                    formatShortDate(dateRange[dateRange.length - 1]!, true).main
                  }`
                : `${formatShortDate(dateRange[0]!, false).main} — ${
                    formatShortDate(dateRange[dateRange.length - 1]!, false).main
                  }`}
            </Text>
          </View>

          <TouchableOpacity
            style={s.dateNavBtn}
            onPress={() => navigateWeek('next')}
          >
            <ChevronRight size={18} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#008080']}
          />
        }
      >
        {roomTypes.length === 0 ? (
          <EmptyState
            icon="🛏️"
            title="Chưa có loại phòng nào"
            subtitle="Thêm loại phòng để khách hàng có thể đặt"
          />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={Platform.OS === 'web'}>
            <View>
              <View style={s.calendarHeaderRow}>
                <View style={s.roomNameCol}>
                  <Text style={s.roomNameHeader}>Loại phòng</Text>
                </View>

                {dateRange.map((dateStr) => {
                  const { main, sub, isCurrent } = formatShortDate(
                    dateStr,
                    activeTab === 'hourly'
                  );

                  return (
                    <View
                      key={dateStr}
                      style={[s.dateCol, isCurrent && s.dateColToday]}
                    >
                      <Text
                        style={[
                          s.dateWeekday,
                          isCurrent && s.dateWeekdayToday,
                        ]}
                      >
                        {sub}
                      </Text>

                      <Text style={[s.dateDay, isCurrent && s.dateDayToday]}>
                        {main}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {displayData.map((rt) => (
                <View key={rt.id} style={s.calendarRow}>
                  <TouchableOpacity
                    style={s.roomNameCol}
                    onPress={() =>
                      router.push(`/partner/room/${rt.id}?hotelId=${hotelId}` as any)
                    }
                  >
                    <Text style={s.roomTypeName} numberOfLines={2}>
                      {rt.name}
                    </Text>

                    <View style={s.roomMeta}>
                      <StatusBadge status={rt.status} size="sm" />
                      <Text style={s.totalUnits}>{rt.totalUnits} phòng</Text>
                    </View>

                    <View style={s.viewLink}>
                      <Eye size={12} color="#1677ff" />
                      <Text style={s.viewLinkText}>Chi tiết</Text>
                    </View>
                  </TouchableOpacity>

                  {dateRange.map((dateStr) => {
                    const invDateKey =
                      activeTab === 'hourly'
                        ? formatDate(new Date(dateStr))
                        : dateStr;

                    const inv = rt.inventory?.[invDateKey];
                    const price = rt.pricing?.[activeTab] || 0;
                    const { isCurrent } = formatShortDate(
                      dateStr,
                      activeTab === 'hourly'
                    );

                    if (inv?.isClosed) {
                      return (
                        <View
                          key={dateStr}
                          style={[
                            s.dateCell,
                            s.dateCellClosed,
                            isCurrent && s.dateCellToday,
                          ]}
                        >
                          <Lock size={14} color="#EF4444" />
                          <Text style={s.closedText}>Đóng</Text>
                        </View>
                      );
                    }

                    const available = inv ? inv.availableRooms : rt.totalUnits;
                    const booked = inv ? inv.bookedRooms : 0;
                    const isFull = available <= 0;

                    return (
                      <View
                        key={dateStr}
                        style={[
                          s.dateCell,
                          isFull
                            ? s.dateCellFull
                            : available <= 2
                              ? s.dateCellWarning
                              : s.dateCellAvailable,
                          isCurrent && s.dateCellToday,
                        ]}
                      >
                        <Text
                          style={[
                            s.cellStatus,
                            isFull
                              ? s.cellStatusFull
                              : s.cellStatusAvailable,
                          ]}
                        >
                          {isFull ? 'Hết' : 'Còn phòng'}
                        </Text>

                        {booked > 0 ? (
                          <Text style={s.cellBooked}>{booked} đặt</Text>
                        ) : null}

                        {price > 0 ? (
                          <Text style={s.cellPrice}>{formatPrice(price)}</Text>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const COL_WIDTH = isMobile ? 72 : 90;
const NAME_COL_WIDTH = isMobile ? 120 : 160;

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isMobile ? '#FFF' : '#F8FAFC',
  },

  scroll: {
    flex: 1,
  },

  mobilePageHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  mobilePageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },

  mobilePageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  mobilePageSub: {
    fontSize: 13,
    color: '#64748B',
  },

  pageHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isMobile ? 16 : 24,
    paddingVertical: isMobile ? 14 : 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 10,
  },

  pageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  pageTitle: {
    fontSize: isMobile ? 18 : 20,
    fontWeight: '800',
    color: '#0F172A',
  },

  pageSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    marginLeft: 28,
  },

  addBtn: {
    backgroundColor: '#0D9488',
    paddingHorizontal: isMobile ? 12 : 16,
    paddingVertical: isMobile ? 8 : 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  addBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },

  hotelSearchSection: {
    backgroundColor: '#FFF',
    paddingHorizontal: isMobile ? 12 : 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    position: 'relative',
    zIndex: 100,
  },

  hotelSearchLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  hotelSearchBox: {
    maxWidth: 620,
    position: 'relative',
    zIndex: 120,
  },

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

  hotelSearchInput: {
    flex: 1,
    color: '#1E293B',
    fontSize: 14,
    paddingVertical: 10,
  },

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

  selectedHotelText: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },

  tabsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isMobile ? 12 : 20,
    paddingVertical: isMobile ? 8 : 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: isMobile ? 6 : 8,
    flexWrap: 'wrap',
    zIndex: 1,
  },

  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },

  tabItemActive: {
    backgroundColor: '#008080',
  },

  tabLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },

  tabLabelActive: {
    color: '#FFF',
  },

  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 4,
  },

  dateNavBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },

  dateNavCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
  },

  dateNavText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },

  calendarHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },

  roomNameCol: {
    width: NAME_COL_WIDTH,
    padding: 12,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },

  roomNameHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  dateCol: {
    width: COL_WIDTH,
    paddingVertical: 10,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
  },

  dateColToday: {
    backgroundColor: '#EFF6FF',
  },

  dateWeekday: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },

  dateWeekdayToday: {
    color: '#1677ff',
  },

  dateDay: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },

  dateDayToday: {
    color: '#1677ff',
  },

  calendarRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFF',
  },

  roomTypeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },

  roomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },

  totalUnits: {
    fontSize: 11,
    color: '#64748B',
  },

  viewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  viewLinkText: {
    fontSize: 11,
    color: '#1677ff',
    fontWeight: '600',
  },

  dateCell: {
    width: COL_WIDTH,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
    gap: 3,
  },

  dateCellToday: {
    backgroundColor: '#EFF6FF',
  },

  dateCellAvailable: {},

  dateCellWarning: {
    backgroundColor: '#FFFBEB',
  },

  dateCellFull: {
    backgroundColor: '#FEF2F2',
  },

  dateCellClosed: {
    backgroundColor: '#FEF2F2',
  },

  cellStatus: {
    fontSize: 12,
    fontWeight: '700',
  },

  cellStatusAvailable: {
    color: '#22C55E',
  },

  cellStatusFull: {
    color: '#EF4444',
  },

  cellBooked: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: '600',
  },

  cellPrice: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },

  closedText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 2,
  },

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

  noHotelTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },

  noHotelSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 340,
    marginBottom: 24,
  },

  noHotelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0D9488',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(13,148,136,0.3)' as any,
      },
      default: {
        shadowColor: '#0D9488',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      },
    }),
  },

  noHotelBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});