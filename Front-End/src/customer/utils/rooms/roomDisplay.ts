import type { Room } from '@/src/customer/services/hotels/hotels.api';

export function getBookingDurationLabel(bookingType?: string, value?: string) {
  const fallback = bookingType === 'Theo ngày' ? '1' : '2';
  const duration = value || fallback;
  const durationText = Number.isFinite(Number(duration))
    ? String(Number(duration)).padStart(2, '0')
    : duration;

  return bookingType === 'Theo ngày' ? `${durationText} ngày` : `${durationText} giờ`;
}

export function formatRoomPrice(value?: number) {
  return `${(value || 0).toLocaleString('vi-VN')}đ`;
}

export function getRoomFeatureText(room: Room) {
  const parts = [
    room.beds,
    room.area ? `${room.area}m2` : undefined,
    room.maxGuests ? `${room.maxGuests} khách` : undefined,
  ].filter(Boolean);

  return parts.join(' · ');
}

export function getRoomAmenityText(room: Room) {
  const amenities = room.amenities || [];
  if (amenities.length === 0) return 'Tất cả phương thức thanh toán · Có người hỗ trợ checkin';
  return amenities.slice(0, 4).join(' · ');
}
