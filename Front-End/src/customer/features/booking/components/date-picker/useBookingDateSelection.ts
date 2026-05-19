import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BookingType } from '@/src/customer/features/hotels/types/hotels.types';
import {
  formatCheckout,
  getCalendarCells,
  getCheckInTimeOptions,
  getDefaultCheckInTime,
  getMaxHourlyDuration,
  getToday,
} from './bookingDate.utils';

export function useBookingDateSelection(visible: boolean, initialBookingType: BookingType) {
  const today = getToday();
  const [activeTab, setActiveTab] = useState<BookingType>(initialBookingType);
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedTime, setSelectedTime] = useState(getDefaultCheckInTime(initialBookingType, today));
  const [selectedHours, setSelectedHours] = useState(1);

  const resetSelection = useCallback(() => {
    const currentToday = getToday();
    setActiveTab(initialBookingType);
    setSelectedDate(currentToday);
    setVisibleMonth(new Date(currentToday.getFullYear(), currentToday.getMonth(), 1));
    setSelectedTime(getDefaultCheckInTime(initialBookingType, currentToday));
    setSelectedHours(1);
  }, [initialBookingType]);

  useEffect(() => {
    if (visible) {
      resetSelection();
    }
  }, [resetSelection, visible]);

  const calendarCells = useMemo(() => getCalendarCells(visibleMonth), [visibleMonth]);
  const timeOptions = useMemo(() => getCheckInTimeOptions(activeTab, selectedDate), [activeTab, selectedDate]);
  const maxHoursForSelected = activeTab === 'Theo giờ' ? getMaxHourlyDuration(selectedTime) : undefined;
  const checkoutLabel = formatCheckout(activeTab, selectedDate, selectedTime, selectedHours);

  useEffect(() => {
    if (timeOptions.length === 0) return;
    if (!timeOptions.includes(selectedTime)) {
      setSelectedTime(timeOptions[0]);
    }
  }, [selectedTime, timeOptions]);

  useEffect(() => {
    if (activeTab !== 'Theo giờ') return;
    const maxHours = getMaxHourlyDuration(selectedTime);
    if (selectedHours > maxHours) {
      setSelectedHours(Math.max(1, maxHours));
    }
  }, [activeTab, selectedHours, selectedTime]);

  const moveMonth = (amount: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  const selectTab = (tab: BookingType) => {
    setActiveTab(tab);
    setSelectedTime(getDefaultCheckInTime(tab, selectedDate));
    setSelectedHours(1);
  };

  return {
    activeTab,
    calendarCells,
    checkoutLabel,
    moveMonth,
    resetSelection,
    selectTab,
    selectedDate,
    selectedHours,
    selectedTime,
    maxHoursForSelected,
    setSelectedDate,
    setSelectedHours,
    setSelectedTime,
    timeOptions,
    today,
    visibleMonth,
  };
}
