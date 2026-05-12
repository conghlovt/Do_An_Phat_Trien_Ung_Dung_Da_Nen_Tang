import { useCallback, useEffect } from 'react';
import { usePartnerStore } from '../store/partner.store';
import { hotelApi } from '../api/hotel.api';
import type { CreateHotelInput, UpdateHotelInput, HotelQueryParams } from '../types/hotel.types';

export const useHotels = (autoFetch = true) => {
  const {
    hotels, currentHotel, hotelPagination, isLoading, error,
    fetchHotels, fetchHotel, setCurrentHotel, setLoading, setError,
  } = usePartnerStore();

  useEffect(() => {
    if (autoFetch && hotels.length === 0) fetchHotels();
  }, [autoFetch]);

  const refresh = useCallback(async (params?: HotelQueryParams) => {
    await fetchHotels(params);
  }, [fetchHotels]);

  const loadHotel = useCallback(async (id: string) => {
    await fetchHotel(id);
  }, [fetchHotel]);

  const createHotel = useCallback(async (data: CreateHotelInput) => {
    try {
      setLoading(true);
      const hotel = await hotelApi.create(data);
      await fetchHotels(); // Refresh list
      return hotel;
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo khách sạn');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchHotels, setLoading, setError]);

  const updateHotel = useCallback(async (id: string, data: UpdateHotelInput) => {
    try {
      setLoading(true);
      const hotel = await hotelApi.update(id, data);
      setCurrentHotel(hotel);
      await fetchHotels();
      return hotel;
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật khách sạn');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchHotels, setCurrentHotel, setLoading, setError]);

  const deleteHotel = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await hotelApi.delete(id);
      await fetchHotels();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xóa khách sạn');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchHotels, setLoading, setError]);

  const submitForReview = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const hotel = await hotelApi.submitForReview(id);
      setCurrentHotel(hotel);
      await fetchHotels();
      return hotel;
    } catch (err: any) {
      setError(err.message || 'Lỗi khi gửi duyệt');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchHotels, setCurrentHotel, setLoading, setError]);

  const uploadHotelImages = useCallback(async (id: string, files: any[]) => {
    try {
      const images = await hotelApi.uploadImages(id, files);
      return images;
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải ảnh lên');
      throw err;
    }
  }, [setError]);

  return {
    hotels, currentHotel, hotelPagination, isLoading, error,
    refresh, loadHotel, createHotel, updateHotel, deleteHotel, submitForReview, uploadHotelImages,
  };
};
