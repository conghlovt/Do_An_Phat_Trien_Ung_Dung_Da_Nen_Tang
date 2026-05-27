import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/v1';

const getAccessToken = () => {
  return (
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    ''
  );
};

const authHeaders = () => {
  const token = getAccessToken();

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const partnerVoucherService = {
  async getVouchers(hotelId: string) {
    const res = await axios.get(
      `${API_BASE}/partner/hotels/${hotelId}/vouchers`,
      {
        headers: authHeaders(),
      }
    );

    return res.data?.data?.items || [];
  },

  async getVoucherById(hotelId: string, voucherId: string) {
    const res = await axios.get(
      `${API_BASE}/partner/hotels/${hotelId}/vouchers/${voucherId}`,
      {
        headers: authHeaders(),
      }
    );

    return res.data?.data?.voucher;
  },

  async createVoucher(hotelId: string, data: any) {
    const res = await axios.post(
      `${API_BASE}/partner/hotels/${hotelId}/vouchers`,
      data,
      {
        headers: authHeaders(),
      }
    );

    return res.data?.data?.voucher;
  },

  async updateVoucher(hotelId: string, voucherId: string, data: any) {
    const res = await axios.put(
      `${API_BASE}/partner/hotels/${hotelId}/vouchers/${voucherId}`,
      data,
      {
        headers: authHeaders(),
      }
    );

    return res.data?.data?.voucher;
  },

  async deleteVoucher(hotelId: string, voucherId: string) {
    const res = await axios.delete(
      `${API_BASE}/partner/hotels/${hotelId}/vouchers/${voucherId}`,
      {
        headers: authHeaders(),
      }
    );

    return res.data;
  },

  // ✅ API apply voucher (test rule engine)
  async applyVoucher(hotelId: string, data: any) {
    const res = await axios.post(
      `${API_BASE}/partner/hotels/${hotelId}/vouchers/apply`,
      data,
      {
        headers: authHeaders(),
      }
    );

    return res.data?.data;
  },
};