import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Clock, SlidersHorizontal } from 'lucide-react-native';
import RoomAmenityFilterSheet from '@/src/customer/components/rooms/RoomAmenityFilterSheet';
import RoomCard from '@/src/customer/components/rooms/RoomCard';
import RoomDetailModal from '@/src/customer/components/rooms/RoomDetailModal';
import { roomListStyles as styles } from '@/src/customer/components/rooms/roomList.styles';
import { ROOM_LIST_PRIMARY } from '@/src/customer/constants/roomList';
import { getParamText } from '@/src/customer/navigation/routeParams';
import { useCustomerBack } from '@/src/customer/navigation/useCustomerBack';
import { useCustomerHotelsStore } from '@/src/customer/store/hotels.store';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import type { Room } from '@/src/customer/api/hotels.api';
import { getBookingDurationLabel } from '@/src/customer/utils/roomDisplay';
import { filterRoomsByAmenities, getRoomAmenityOptions } from '@/src/customer/utils/roomFilters';

const { width: SCREEN_W } = Dimensions.get('window');

export default function RoomListScreen() {
  const router = useRouter();
  const goBack = useCustomerBack('/customer/dashboard');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentTheme } = useThemeContext();
  const params = useLocalSearchParams<{
    hotelId: string;
    hotelName: string;
    hotelAddress?: string;
    hotelImage?: string;
    bookingType: string;
    checkIn: string;
    checkOut: string;
    hours: string;
  }>();

  const hotelId = getParamText(params.hotelId) || '1';
  const { currentHotel, rooms, roomsLoading: loading, fetchRooms, clearRooms } = useCustomerHotelsStore();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const isWebLayout = Platform.OS === 'web' && width >= 768;
  const webImageWidth = Math.min(Math.max(width - 380, 640), 1116);
  const durationLabel = getBookingDurationLabel(params.bookingType, params.hours);
  const hotelName = getParamText(params.hotelName) || currentHotel?.name || 'Khách sạn';
  const hotelAddress = getParamText(params.hotelAddress) || currentHotel?.address || '';
  const hotelImage = getParamText(params.hotelImage) || currentHotel?.image || '';

  useEffect(() => {
    void fetchRooms(hotelId, {
      bookingType: params.bookingType as any,
    });

    return () => clearRooms();
  }, [clearRooms, fetchRooms, hotelId, params.bookingType]);

  const roomAmenityOptions = useMemo(
    () => getRoomAmenityOptions(rooms),
    [rooms],
  );

  const displayedRooms = useMemo(
    () => filterRoomsByAmenities(rooms, selectedAmenities),
    [rooms, selectedAmenities],
  );

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(item => item !== amenity) : [...prev, amenity],
    );
  };

  const openBookingCalendar = () => {
    router.push({
      pathname: '/customer/booking-calendar' as any,
      params: {
        hotelId: String(hotelId),
        hotelName,
        hotelAddress,
        hotelImage,
        bookingType: params.bookingType,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        hours: params.hours,
        returnTo: 'room-list',
      },
    });
  };

  const goToBookingConfirm = (room: Room) => {
    router.push({
      pathname: '/customer/booking-confirm' as any,
      params: {
        hotelId: String(hotelId),
        hotelName,
        hotelAddress,
        hotelImage,
        roomId: String(room.id),
        roomName: room.name,
        roomImage: room.images[0] || hotelImage,
        price: String(room.flashSale ? room.price : room.originalPrice),
        bookingType: params.bookingType,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        hours: params.hours,
      },
    });
  };

  return (
    <View style={[styles.container, isWebLayout && styles.webContainer, { paddingTop: isWebLayout ? 0 : insets.top, backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, isWebLayout && styles.webHeader, { backgroundColor: currentTheme.card, borderBottomColor: currentTheme.border }]}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <ChevronLeft size={24} color={currentTheme.text} />
        </Pressable>
        <Text style={[styles.title, { color: currentTheme.text }]}>Danh sách phòng</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.bookingCard, isWebLayout && styles.webPanel]}>
        <View style={styles.bookingRow}>
          <Clock size={15} color={ROOM_LIST_PRIMARY} />
          <Text style={[styles.bookingType, { color: currentTheme.text }]}>{params.bookingType || 'Theo giờ'} | {durationLabel}</Text>
          <Pressable onPress={openBookingCalendar}>
            <Text style={styles.changeBtn}>Thay đổi</Text>
          </Pressable>
        </View>
        <View style={styles.bookingDivider} />
        <View style={styles.checkRow}>
          <View>
            <Text style={[styles.checkLabel, { color: currentTheme.textSecondary }]}>Nhận phòng</Text>
            <Text style={[styles.checkTime, { color: currentTheme.text }]}>{params.checkIn}</Text>
          </View>
          <ChevronRight size={16} color="#9ca3af" />
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.checkLabel, { color: currentTheme.textSecondary }]}>Trả phòng</Text>
            <Text style={[styles.checkTime, { color: currentTheme.text }]}>{params.checkOut}</Text>
          </View>
        </View>
      </View>

      {roomAmenityOptions.length > 0 && (
        <View style={[styles.roomFilterBar, isWebLayout && styles.webRoomFilterBar, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          <Pressable
            style={[styles.roomFilterChip, selectedAmenities.length > 0 && styles.roomFilterChipActive]}
            onPress={() => setShowFilterModal(true)}
          >
            <SlidersHorizontal size={16} color={ROOM_LIST_PRIMARY} />
            <Text style={[styles.roomFilterText, { color: currentTheme.text }]}>
              {selectedAmenities.length > 0 ? `${selectedAmenities.length} tiện ích phòng` : 'Lọc tiện ích phòng'}
            </Text>
          </Pressable>
          {selectedAmenities.length > 0 && (
            <Pressable onPress={() => setSelectedAmenities([])}>
              <Text style={styles.clearFilterText}>Đặt lại</Text>
            </Pressable>
          )}
        </View>
      )}

      {loading ? (
        <ScrollView contentContainerStyle={[styles.listContent, isWebLayout && styles.webList]}>
          {[1, 2, 3].map(item => <View key={item} style={[styles.skeletonCard, { backgroundColor: currentTheme.card }]} />)}
        </ScrollView>
      ) : (
        <FlatList
          data={displayedRooms}
          keyExtractor={room => String(room.id)}
          contentContainerStyle={[styles.listContent, isWebLayout && styles.webList]}
          showsVerticalScrollIndicator={isWebLayout}
          renderItem={({ item: room }) => (
            <RoomCard
              room={room}
              onBook={() => goToBookingConfirm(room)}
              onDetail={() => setSelectedRoom(room)}
              isWebLayout={isWebLayout}
              imageWidth={isWebLayout ? webImageWidth : SCREEN_W - 32}
            />
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>Không có phòng nào phù hợp.</Text>
          }
        />
      )}

      {selectedRoom && (
        <RoomDetailModal
          room={selectedRoom}
          bookingType={params.bookingType}
          checkIn={params.checkIn}
          checkOut={params.checkOut}
          hours={params.hours}
          onClose={() => setSelectedRoom(null)}
          onBook={() => {
            setSelectedRoom(null);
            goToBookingConfirm(selectedRoom);
          }}
          insets={insets}
          isWebLayout={isWebLayout}
          imageWidth={isWebLayout ? webImageWidth : SCREEN_W}
        />
      )}

      <RoomAmenityFilterSheet
        currentTheme={currentTheme}
        insets={insets}
        options={roomAmenityOptions}
        selectedAmenities={selectedAmenities}
        visible={showFilterModal}
        onApply={() => setShowFilterModal(false)}
        onClose={() => setShowFilterModal(false)}
        onReset={() => setSelectedAmenities([])}
        onToggleAmenity={toggleAmenity}
      />
    </View>
  );
}
