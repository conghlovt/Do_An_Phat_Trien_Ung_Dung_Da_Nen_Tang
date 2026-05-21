import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'customer:bookings';

export type CustomerBookingStatus = 'Chờ nhận phòng' | 'Đã huỷ';

export type CustomerBooking = {
  id: string;
  code: string;
  hotelId: string;
  hotelName: string;
  hotelAddress?: string;
  hotelImage?: string;
  roomId?: string;
  roomName: string;
  roomImage: string;
  price: string;
  bookingType: string;
  checkIn: string;
  checkOut: string;
  hours?: string;
  customerName?: string;
  customerPhone?: string;
  status: CustomerBookingStatus;
  createdAt: string;
};

export type NewCustomerBooking = Omit<CustomerBooking, 'code' | 'createdAt' | 'id' | 'status'>;

function createBookingCode() {
  return String(Math.floor(1000000 + Math.random() * 9000000));
}

function createBookingId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const customerBookingsStorage = {
  getAll: async (): Promise<CustomerBooking[]> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  add: async (booking: NewCustomerBooking): Promise<CustomerBooking> => {
    const nextBooking: CustomerBooking = {
      ...booking,
      id: createBookingId(),
      code: createBookingCode(),
      status: 'Chờ nhận phòng',
      createdAt: new Date().toISOString(),
    };

    const current = await customerBookingsStorage.getAll();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([nextBooking, ...current]));

    return nextBooking;
  },

  getById: async (id: string): Promise<CustomerBooking | null> => {
    const bookings = await customerBookingsStorage.getAll();
    return bookings.find((booking) => booking.id === id) || null;
  },

  updateStatus: async (id: string, status: CustomerBookingStatus): Promise<CustomerBooking | null> => {
    const bookings = await customerBookingsStorage.getAll();
    let updatedBooking: CustomerBooking | null = null;

    const nextBookings = bookings.map((booking) => {
      if (booking.id !== id) return booking;

      updatedBooking = { ...booking, status };
      return updatedBooking;
    });

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextBookings));

    return updatedBooking;
  },
};
