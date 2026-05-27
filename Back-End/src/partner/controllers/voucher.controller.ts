import { voucherService } from '../services/voucher.service';

export const voucherController = {
  async list(req: any, res: any) {
    const { hotelId } = req.params;
    const ownerId = req.user?.id;

    const vouchers = await voucherService.listByHotel(hotelId, ownerId);

    return res.json({
      status: 'success',
      success: true,
      code: 'VOUCHER_LIST_FETCHED',
      message: 'Lấy danh sách voucher thành công',
      data: { items: vouchers },
    });
  },

  async get(req: any, res: any) {
    const { hotelId, voucherId } = req.params;
    const ownerId = req.user?.id;

    const voucher = await voucherService.getById(hotelId, voucherId, ownerId);

    return res.json({
      status: 'success',
      success: true,
      code: 'VOUCHER_FETCHED',
      message: 'Lấy thông tin voucher thành công',
      data: { voucher },
    });
  },

  async create(req: any, res: any) {
    const { hotelId } = req.params;
    const ownerId = req.user?.id;

    const voucher = await voucherService.create(hotelId, ownerId, req.body);

    return res.status(201).json({
      status: 'success',
      success: true,
      code: 'VOUCHER_CREATED',
      message: 'Tạo voucher thành công',
      data: { voucher },
    });
  },

  async update(req: any, res: any) {
    const { hotelId, voucherId } = req.params;
    const ownerId = req.user?.id;

    const voucher = await voucherService.update(
      hotelId,
      voucherId,
      ownerId,
      req.body
    );

    return res.json({
      status: 'success',
      success: true,
      code: 'VOUCHER_UPDATED',
      message: 'Cập nhật voucher thành công',
      data: { voucher },
    });
  },

  async remove(req: any, res: any) {
    const { hotelId, voucherId } = req.params;
    const ownerId = req.user?.id;

    await voucherService.remove(hotelId, voucherId, ownerId);

    return res.json({
      status: 'success',
      success: true,
      code: 'VOUCHER_DELETED',
      message: 'Xóa voucher thành công',
    });
  },

  async apply(req: any, res: any) {
    const { hotelId } = req.params;
    const userId = req.user?.id;

    const result = await voucherService.applyVoucher(hotelId, userId, req.body);

    return res.json({
      status: 'success',
      success: true,
      code: 'VOUCHER_APPLIED',
      message: 'Áp dụng voucher thành công',
      data: result,
    });
  },
};