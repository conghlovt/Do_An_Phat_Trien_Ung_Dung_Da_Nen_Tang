import apiInstance from '../../login/shared/api/api.instance';

export const partnerVoucherService = {
  async getVouchers(hotelId: string) {
    const res = await apiInstance.get(
      `/v1/partner/hotels/${hotelId}/vouchers`
    );

    return res.data?.data?.items || [];
  },

  async getVoucherById(hotelId: string, voucherId: string) {
    const res = await apiInstance.get(
      `/v1/partner/hotels/${hotelId}/vouchers/${voucherId}`
    );

    return res.data?.data?.voucher;
  },

  async createVoucher(hotelId: string, data: any) {
    const res = await apiInstance.post(
      `/v1/partner/hotels/${hotelId}/vouchers`,
      data
    );

    return res.data?.data?.voucher;
  },

  async updateVoucher(hotelId: string, voucherId: string, data: any) {
    const res = await apiInstance.put(
      `/v1/partner/hotels/${hotelId}/vouchers/${voucherId}`,
      data
    );

    return res.data?.data?.voucher;
  },

  async deleteVoucher(hotelId: string, voucherId: string) {
    const res = await apiInstance.delete(
      `/v1/partner/hotels/${hotelId}/vouchers/${voucherId}`
    );

    return res.data;
  },

  async applyVoucher(hotelId: string, data: any) {
    const res = await apiInstance.post(
      `/v1/partner/hotels/${hotelId}/vouchers/apply`,
      data
    );

    return res.data?.data;
  },
};