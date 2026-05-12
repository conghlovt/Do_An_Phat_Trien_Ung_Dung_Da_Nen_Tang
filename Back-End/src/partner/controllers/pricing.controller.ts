// ============================================================
// Pricing Controller — No try/catch, clean async handlers
// ============================================================

import type { Response } from 'express';
import { pricingService } from '../services/pricing.service';
import { sendSuccess } from '../../shared/utils/response.util';
import type { AuthRequest } from '../../login/middlewares/auth.middleware';

export class PricingController {

  async createPricing(req: AuthRequest, res: Response) {
    const pricing = await pricingService.createPricing(
      req.params.hotelId as string, req.params.roomTypeId as string, req.user!.id, req.body
    );
    sendSuccess(res, 201, 'PRICING_CREATED', 'Tạo bảng giá thành công', { pricing });
  }

  async updatePricing(req: AuthRequest, res: Response) {
    const pricing = await pricingService.updatePricing(
      req.params.hotelId as string, req.params.roomTypeId as string,
      req.params.pricingId as string, req.user!.id, req.body
    );
    sendSuccess(res, 200, 'PRICING_UPDATED', 'Cập nhật bảng giá thành công', { pricing });
  }

  async listPricing(req: AuthRequest, res: Response) {
    const items = await pricingService.listPricing(req.params.hotelId as string, req.params.roomTypeId as string);
    sendSuccess(res, 200, 'PRICING_LIST_FETCHED', 'Lấy danh sách bảng giá thành công', { items });
  }

  async deletePricing(req: AuthRequest, res: Response) {
    await pricingService.deletePricing(
      req.params.hotelId as string, req.params.roomTypeId as string,
      req.params.pricingId as string, req.user!.id
    );
    sendSuccess(res, 200, 'PRICING_DELETED', 'Xóa bảng giá thành công');
  }

  async createSpecialPrice(req: AuthRequest, res: Response) {
    const specialPrice = await pricingService.createSpecialPrice(
      req.params.hotelId as string, req.params.pricingId as string, req.user!.id, req.body
    );
    sendSuccess(res, 201, 'SPECIAL_PRICE_CREATED', 'Tạo giá đặc biệt thành công', { specialPrice });
  }

  async listSpecialPrices(req: AuthRequest, res: Response) {
    const items = await pricingService.listSpecialPrices(
      req.params.pricingId as string, req.query.from as string, req.query.to as string
    );
    sendSuccess(res, 200, 'SPECIAL_PRICE_LIST_FETCHED', 'Lấy danh sách giá đặc biệt thành công', { items });
  }

  async deleteSpecialPrice(req: AuthRequest, res: Response) {
    await pricingService.deleteSpecialPrice(
      req.params.hotelId as string, req.params.specialPriceId as string, req.user!.id
    );
    sendSuccess(res, 200, 'SPECIAL_PRICE_DELETED', 'Xóa giá đặc biệt thành công');
  }
}

export const pricingController = new PricingController();
