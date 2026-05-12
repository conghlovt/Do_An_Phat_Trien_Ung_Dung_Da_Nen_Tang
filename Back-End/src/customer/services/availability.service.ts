import type { AvailabilitySlot, AvailabilityQueryParams } from '../models/room.model';
import { findHotelById } from './hotels.service';

const HOTEL_OPEN_H = 8;
const HOTEL_CLOSE_H = 22;

export const findAvailabilityByHotelId = async (
  hotelId: string,
  params: AvailabilityQueryParams
): Promise<AvailabilitySlot[]> => {
  // Xác nhận khách sạn tồn tại (ném 404 nếu không có)
  await findHotelById(hotelId);

  const { bookingType, date } = params;

  if (bookingType === 'Qua đêm') {
    return [{ time: '22:00', available: true, maxHours: null }];
  }
  if (bookingType === 'Theo ngày') {
    return [{ time: '14:00', available: true, maxHours: null }];
  }

  // ── Theo giờ ──────────────────────────────────────────────────────────────
  const now      = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isToday  = date === todayStr;

  let firstValidH = HOTEL_OPEN_H;
  let firstValidM = 0;

  if (isToday) {
    const curH = now.getHours();
    const curM = now.getMinutes();
    if (curM < 30) { firstValidH = curH;     firstValidM = 30; }
    else           { firstValidH = curH + 1; firstValidM = 0;  }
  }

  const seed        = Number((date ?? '20260101').replace(/-/g, ''));
  const pseudoAvail = (h: number, m: number) => ((seed * 31 + h * 17 + m * 7) % 100) > 15;

  const slots: AvailabilitySlot[] = [];

  for (let h = HOTEL_OPEN_H; h <= HOTEL_CLOSE_H; h++) {
    for (const m of [0, 30]) {
      if (h === HOTEL_CLOSE_H && m > 0) break;

      const isPast      = isToday && (h < firstValidH || (h === firstValidH && m < firstValidM));
      const checkinMins = h * 60 + m;
      const maxHours    = Math.max(0, Math.min(
        Math.floor((HOTEL_CLOSE_H * 60 - checkinMins) / 60),
        Math.floor((24 * 60        - checkinMins) / 60),
      ));

      slots.push({
        time:      `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        available: !isPast && maxHours >= 1 && pseudoAvail(h, m),
        maxHours,
      });
    }
  }

  return slots;
};
