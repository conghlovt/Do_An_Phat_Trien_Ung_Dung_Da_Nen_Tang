import type { AvailabilitySlot, AvailabilityQueryParams } from '../models/room.model';
import { findHotelById } from './hotels.service';
import prisma from '../../login/lib/prisma';
import { countReservedRooms } from '../utils/roomAvailability.util';

const LATEST_CHECKIN_H = 23;
const LATEST_CHECKIN_M = 30;
const MAX_HOURLY_HOURS = 10;

const getDateAtTime = (date: string, time: string) => {
  const [year = 0, month = 1, day = 1] = date.split('-').map(Number);
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

const addHours = (date: Date, hours: number) =>
  new Date(date.getTime() + hours * 60 * 60 * 1000);

const hasAvailableRoom = async (
  hotelId: string,
  checkIn: Date,
  checkOut: Date,
) => {
  const roomTypes = await prisma.roomType.findMany({
    where: {
      hotelId,
      status: 'active',
    },
    select: {
      id: true,
      totalUnits: true,
    },
  });

  for (const roomType of roomTypes) {
    const reservedRooms = await countReservedRooms(prisma, roomType.id, {
      checkIn,
      checkOut,
    });

    if (reservedRooms < roomType.totalUnits) return true;
  }

  return false;
};

export const findAvailabilityByHotelId = async (
  hotelId: string,
  params: AvailabilityQueryParams
): Promise<AvailabilitySlot[]> => {
  // Xác nhận khách sạn tồn tại (ném 404 nếu không có)
  await findHotelById(hotelId);

  const { bookingType } = params;
  const date = String(params.date || '');

  if (bookingType === 'Qua đêm') {
    const checkIn = getDateAtTime(date, '22:00');
    const checkOut = addHours(checkIn, 12);
    return [{
      time: '22:00',
      available: await hasAvailableRoom(hotelId, checkIn, checkOut),
      maxHours: null,
    }];
  }
  if (bookingType === 'Theo ngày') {
    const checkIn = getDateAtTime(date, '14:00');
    const checkOut = addHours(checkIn, 22);
    return [{
      time: '14:00',
      available: await hasAvailableRoom(hotelId, checkIn, checkOut),
      maxHours: null,
    }];
  }

  // ── Theo giờ ──────────────────────────────────────────────────────────────
  const now      = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isToday  = date === todayStr;

  let firstValidH = 0;
  let firstValidM = 0;

  if (isToday) {
    const curH = now.getHours();
    const curM = now.getMinutes();
    if (curM < 30) { firstValidH = curH;     firstValidM = 30; }
    else           { firstValidH = curH + 1; firstValidM = 0;  }
  }

  const slots: AvailabilitySlot[] = [];

  for (let h = 0; h <= LATEST_CHECKIN_H; h++) {
    for (const m of [0, 30]) {
      if (h === LATEST_CHECKIN_H && m > LATEST_CHECKIN_M) break;

      const isPast      = isToday && (h < firstValidH || (h === firstValidH && m < firstValidM));
      const checkinMins = h * 60 + m;
      const maxPossibleHours = Math.max(0, Math.min(
        MAX_HOURLY_HOURS,
        Math.floor((24 * 60 - checkinMins) / 60),
      ));
      const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const checkIn = getDateAtTime(date, time);
      let maxHours = 0;

      if (!isPast) {
        for (let duration = 1; duration <= maxPossibleHours; duration++) {
          const available = await hasAvailableRoom(hotelId, checkIn, addHours(checkIn, duration));
          if (!available) break;
          maxHours = duration;
        }
      }

      slots.push({
        time,
        available: maxHours >= 1,
        maxHours,
      });
    }
  }

  return slots;
};
