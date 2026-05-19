// ============================================================
// Pricing Controller — No try/catch, clean async handlers
// ============================================================
import { pricingService } from '../services/pricing.service';
import { sendSuccess } from '../../shared/utils/response.util';
export class PricingController {
    async createPricing(req, res) {
        const pricing = await pricingService.createPricing(req.params.hotelId, req.params.roomTypeId, req.user.id, req.body);
        sendSuccess(res, 201, 'PRICING_CREATED', 'Tạo bảng giá thành công', { pricing });
    }
    async updatePricing(req, res) {
        const pricing = await pricingService.updatePricing(req.params.hotelId, req.params.roomTypeId, req.params.pricingId, req.user.id, req.body);
        sendSuccess(res, 200, 'PRICING_UPDATED', 'Cập nhật bảng giá thành công', { pricing });
    }
    async listPricing(req, res) {
        const items = await pricingService.listPricing(req.params.hotelId, req.params.roomTypeId);
        sendSuccess(res, 200, 'PRICING_LIST_FETCHED', 'Lấy danh sách bảng giá thành công', { items });
    }
    async deletePricing(req, res) {
        await pricingService.deletePricing(req.params.hotelId, req.params.roomTypeId, req.params.pricingId, req.user.id);
        sendSuccess(res, 200, 'PRICING_DELETED', 'Xóa bảng giá thành công');
    }
    async createSpecialPrice(req, res) {
        const specialPrice = await pricingService.createSpecialPrice(req.params.hotelId, req.params.pricingId, req.user.id, req.body);
        sendSuccess(res, 201, 'SPECIAL_PRICE_CREATED', 'Tạo giá đặc biệt thành công', { specialPrice });
    }
    async listSpecialPrices(req, res) {
        const items = await pricingService.listSpecialPrices(req.params.pricingId, req.query.from, req.query.to);
        sendSuccess(res, 200, 'SPECIAL_PRICE_LIST_FETCHED', 'Lấy danh sách giá đặc biệt thành công', { items });
    }
    async deleteSpecialPrice(req, res) {
        await pricingService.deleteSpecialPrice(req.params.hotelId, req.params.specialPriceId, req.user.id);
        sendSuccess(res, 200, 'SPECIAL_PRICE_DELETED', 'Xóa giá đặc biệt thành công');
    }
}
export const pricingController = new PricingController();
//# sourceMappingURL=pricing.controller.js.map