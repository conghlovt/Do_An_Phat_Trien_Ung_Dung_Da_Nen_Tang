import type { BookingType } from '@/src/customer/types/hotels.types';
import { formatShortDate } from '@/src/customer/utils/booking';
import {
  DAILY_TIME_OPTIONS,
  LATEST_CHECKIN_MINUTES,
  MAX_DAILY_BOOKING_MONTHS,
  MAX_HOURLY_HOURS,
  OVERNIGHT_TIME_OPTIONS,
} from './bookingDate.constants';

export interface CalendarCell {
  date: Date;
  inCurrentMonth: boolean;
}

export function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTimeFromMinutes(minutes: number) {
  const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getMinutesFromTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

export function getRoundedCurrentCheckInMinutes(now = new Date()) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentHour = Math.floor(currentMinutes / 60);
  return now.getMinutes() < 30
    ? currentHour * 60 + 30
    : (currentHour + 1) * 60;
}

export function getHourlyCheckInTimeOptions(selectedDate: Date, now = new Date()) {
  const today = getToday();
  let startMinutes = 0;

  if (isSameDay(selectedDate, today)) {
    startMinutes = getRoundedCurrentCheckInMinutes(now);
  }

  if (startMinutes > LATEST_CHECKIN_MINUTES) {
    return [];
  }

  const options: string[] = [];
  for (let minutes = startMinutes; minutes <= LATEST_CHECKIN_MINUTES; minutes += 30) {
    options.push(formatTimeFromMinutes(minutes));
  }

  return options;
}

export function getMaxHourlyDuration(checkinTime: string, slotMaxHours?: number | null) {
  const checkinMinutes = getMinutesFromTime(checkinTime);
  if (checkinMinutes === null) return 0;

  const maxByMidnight = Math.floor((24 * 60 - checkinMinutes) / 60);
  const computed = Math.max(0, Math.min(MAX_HOURLY_HOURS, maxByMidnight));

  if (slotMaxHours !== undefined && slotMaxHours !== null) {
    return Math.max(0, Math.min(computed, slotMaxHours));
  }

  return computed;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addMonths(date: Date, months: number) {
  const next = new Date(date);
  const targetDay = next.getDate();
  next.setDate(1);
  next.setMonth(next.getMonth() + months);

  const lastDayOfTargetMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(targetDay, lastDayOfTargetMonth));
  return next;
}

export function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function getDayDiff(startDate: Date, endDate: Date) {
  const start = startOfDay(startDate).getTime();
  const end = startOfDay(endDate).getTime();
  return Math.round((end - start) / (24 * 60 * 60 * 1000));
}

export function getMaxDailyCheckoutDate(startDate: Date) {
  return addMonths(startDate, MAX_DAILY_BOOKING_MONTHS);
}

export function clampDailyCheckoutDate(startDate: Date, checkoutDate: Date) {
  const minCheckoutDate = addDays(startDate, 1);
  const maxCheckoutDate = getMaxDailyCheckoutDate(startDate);

  if (checkoutDate < minCheckoutDate) return minCheckoutDate;
  if (checkoutDate > maxCheckoutDate) return maxCheckoutDate;
  return checkoutDate;
}

export function formatMonth(date: Date) {
  return `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
}

export function formatDateForApi(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function getCalendarCells(monthDate: Date): CalendarCell[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const start = new Date(firstOfMonth);
  start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date,
      inCurrentMonth: date.getMonth() === month,
    };
  });
}

export function getDefaultCheckInTime(bookingType: BookingType, selectedDate = getToday()) {
  if (bookingType === 'Qua đêm') return '22:00';
  if (bookingType === 'Theo ngày') return '14:00';
  return getHourlyCheckInTimeOptions(selectedDate)[0] || '23:30';
}

export function getCheckInTimeOptions(bookingType: BookingType, selectedDate = getToday()) {
  if (bookingType === 'Qua đêm') return OVERNIGHT_TIME_OPTIONS;
  if (bookingType === 'Theo ngày') return DAILY_TIME_OPTIONS;
  return getHourlyCheckInTimeOptions(selectedDate);
}

export function getCheckoutDate(
  bookingType: BookingType,
  selectedDate: Date,
  selectedTime?: string,
  selectedHours = 0,
  dailyCheckoutDate?: Date,
) {
  if (bookingType === 'Theo giờ' && selectedTime) {
    const checkinMinutes = getMinutesFromTime(selectedTime);
    if (checkinMinutes === null) return selectedDate;

    const checkoutMinutes = checkinMinutes + selectedHours * 60;
    return checkoutMinutes >= 24 * 60 ? addDays(selectedDate, 1) : selectedDate;
  }

  if (bookingType === 'Theo ngày') {
    return dailyCheckoutDate
      ? clampDailyCheckoutDate(selectedDate, dailyCheckoutDate)
      : addDays(selectedDate, 1);
  }

  return bookingType === 'Qua đêm' ? addDays(selectedDate, 1) : selectedDate;
}

export function getCheckoutTime(bookingType: BookingType, selectedTime: string, selectedHours: number) {
  if (bookingType === 'Qua đêm') return '10:00';
  if (bookingType === 'Theo ngày') return '12:00';

  const checkinMinutes = getMinutesFromTime(selectedTime);
  if (checkinMinutes === null) return '--:--';

  return formatTimeFromMinutes(checkinMinutes + selectedHours * 60);
}

export function formatCheckout(bookingType: BookingType, selectedDate: Date, selectedTime: string, selectedHours: number) {
  const checkoutDate = getCheckoutDate(bookingType, selectedDate, selectedTime, selectedHours);
  const checkoutTime = getCheckoutTime(bookingType, selectedTime, selectedHours);
  return `${checkoutTime}, ${formatShortDate(checkoutDate)}`;
}
