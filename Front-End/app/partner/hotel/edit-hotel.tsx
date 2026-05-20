import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { HotelEditForm } from '../../../src/partner/components/Hotel/HotelEditForm';

export default function EditHotelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  if (!id) return null;

  return <HotelEditForm hotelId={id} />;
}
