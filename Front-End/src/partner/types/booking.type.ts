export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
  id: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: BookingStatus;
  user: {
    username: string;
    phone: string | null;
  };
  room: {
    name: string;
  };
}
