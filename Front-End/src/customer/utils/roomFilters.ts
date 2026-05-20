import type { Room } from '@/src/customer/types/hotels.types';
import { textMatches } from '@/src/customer/utils/textSearch';

export const getRoomAmenityOptions = (rooms: Room[]) =>
  Array.from(new Set(rooms.flatMap((room) => room.amenities ?? []))).sort((a, b) =>
    a.localeCompare(b, 'vi'),
  );

export const filterRoomsByAmenities = (rooms: Room[], selectedAmenities: string[]) => {
  if (selectedAmenities.length === 0) return rooms;

  return rooms.filter((room) => {
    const roomAmenities = room.amenities ?? [];
    return selectedAmenities.every((amenity) =>
      roomAmenities.some((roomAmenity) => textMatches(roomAmenity, amenity)),
    );
  });
};
