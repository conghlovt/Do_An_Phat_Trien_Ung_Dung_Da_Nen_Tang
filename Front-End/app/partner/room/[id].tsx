import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { RoomDetail } from '../../../src/partner/components/Room/RoomDetail';

export default function RoomDetailScreen() {
  const { hotelId, id } = useLocalSearchParams<{ hotelId: string, id: string }>();

  if (!hotelId || !id) return null;

  return <RoomDetail hotelId={hotelId} roomTypeId={id} />;
}
