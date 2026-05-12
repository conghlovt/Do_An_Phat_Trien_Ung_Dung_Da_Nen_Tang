import { useCallback, useState } from 'react';
import { roomApi } from '../api/room.api';
import type { RoomType, CreateRoomTypeInput, UpdateRoomTypeInput, CreateRoomUnitInput } from '../types/room.types';
import { usePartnerStore } from '../store/partner.store';

export const useRooms = (hotelId: string) => {
  const { roomTypes, setRoomTypes, setCurrentRoomType } = usePartnerStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoomTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const items = await roomApi.listRoomTypes(hotelId);
      setRoomTypes(items);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách loại phòng');
    } finally {
      setIsLoading(false);
    }
  }, [hotelId, setRoomTypes]);

  const createRoomType = useCallback(async (data: CreateRoomTypeInput) => {
    setIsLoading(true);
    try {
      const roomType = await roomApi.createRoomType(hotelId, data);
      await fetchRoomTypes();
      return roomType;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [hotelId, fetchRoomTypes]);

  const updateRoomType = useCallback(async (roomTypeId: string, data: UpdateRoomTypeInput) => {
    setIsLoading(true);
    try {
      const roomType = await roomApi.updateRoomType(hotelId, roomTypeId, data);
      await fetchRoomTypes();
      return roomType;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [hotelId, fetchRoomTypes]);

  const deleteRoomType = useCallback(async (roomTypeId: string) => {
    setIsLoading(true);
    try {
      await roomApi.deleteRoomType(hotelId, roomTypeId);
      await fetchRoomTypes();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [hotelId, fetchRoomTypes]);

  const addUnit = useCallback(async (roomTypeId: string, data: CreateRoomUnitInput) => {
    const unit = await roomApi.createUnit(hotelId, roomTypeId, data);
    return unit;
  }, [hotelId]);

  const deleteUnit = useCallback(async (roomTypeId: string, unitId: string) => {
    await roomApi.deleteUnit(hotelId, roomTypeId, unitId);
  }, [hotelId]);

  return {
    roomTypes, isLoading, error,
    fetchRoomTypes, createRoomType, updateRoomType, deleteRoomType,
    addUnit, deleteUnit, setCurrentRoomType,
  };
};
