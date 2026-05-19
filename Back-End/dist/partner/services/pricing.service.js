import prisma from '../../login/lib/prisma';
import { NotFoundError, ForbiddenError, ConflictError } from '../../shared/errors/AppError';
export class PricingService {
    async verifyOwnership(hotelId, ownerId) {
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId },
            select: { id: true, ownerId: true },
        });
        if (!hotel)
            throw new NotFoundError('Không tìm thấy khách sạn', 'HOTEL_NOT_FOUND');
        if (hotel.ownerId !== ownerId)
            throw new ForbiddenError('Không có quyền thực hiện');
    }
    async verifyRoomType(hotelId, roomTypeId) {
        const roomType = await prisma.roomType.findFirst({ where: { id: roomTypeId, hotelId } });
        if (!roomType)
            throw new NotFoundError('Không tìm thấy loại phòng', 'ROOM_TYPE_NOT_FOUND');
        return roomType;
    }
    // ======================== PRICING POLICIES ========================
    async createPricing(hotelId, roomTypeId, ownerId, data) {
        await this.verifyOwnership(hotelId, ownerId);
        await this.verifyRoomType(hotelId, roomTypeId);
        const existing = await prisma.pricingPolicy.findUnique({
            where: { roomTypeId_bookingType: { roomTypeId, bookingType: data.bookingType } },
        });
        if (existing)
            throw new ConflictError('Bảng giá cho loại đặt phòng này đã tồn tại', 'PRICING_ALREADY_EXISTS');
        return prisma.pricingPolicy.create({
            data: {
                roomTypeId,
                bookingType: data.bookingType,
                basePrice: data.basePrice,
                minHours: data.minHours,
                maxHours: data.maxHours,
                extraHourPrice: data.extraHourPrice,
                overnightCheckinFrom: data.overnightCheckinFrom,
                overnightCheckoutBefore: data.overnightCheckoutBefore,
            }, // Ép kiểu ngăn lỗi strict enum/type của Prisma 7.8
            include: { specialPrices: true },
        });
    }
    async updatePricing(hotelId, roomTypeId, pricingId, ownerId, data) {
        await this.verifyOwnership(hotelId, ownerId);
        const existing = await prisma.pricingPolicy.findFirst({
            where: { id: pricingId, roomTypeId, roomType: { hotelId } },
        });
        if (!existing)
            throw new NotFoundError('Không tìm thấy bảng giá', 'PRICING_NOT_FOUND');
        return prisma.pricingPolicy.update({
            where: { id: pricingId },
            data: {
                ...(data.basePrice !== undefined && { basePrice: data.basePrice }),
                ...(data.minHours !== undefined && { minHours: data.minHours }),
                ...(data.maxHours !== undefined && { maxHours: data.maxHours }),
                ...(data.extraHourPrice !== undefined && { extraHourPrice: data.extraHourPrice }),
                ...(data.overnightCheckinFrom !== undefined && { overnightCheckinFrom: data.overnightCheckinFrom }),
                ...(data.overnightCheckoutBefore !== undefined && { overnightCheckoutBefore: data.overnightCheckoutBefore }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
            }, // Ép kiểu ngăn lỗi kiểm tra tùy chọn object update
            include: { specialPrices: true },
        });
    }
    async listPricing(hotelId, roomTypeId) {
        return prisma.pricingPolicy.findMany({
            where: { roomTypeId, roomType: { hotelId } },
            include: { specialPrices: { orderBy: { date: 'asc' } } },
        });
    }
    async deletePricing(hotelId, roomTypeId, pricingId, ownerId) {
        await this.verifyOwnership(hotelId, ownerId);
        const existing = await prisma.pricingPolicy.findFirst({
            where: { id: pricingId, roomTypeId, roomType: { hotelId } },
        });
        if (!existing)
            throw new NotFoundError('Không tìm thấy bảng giá', 'PRICING_NOT_FOUND');
        await prisma.pricingPolicy.delete({ where: { id: pricingId } });
        return true;
    }
    // ======================== SPECIAL PRICES ========================
    async createSpecialPrice(hotelId, pricingId, ownerId, data) {
        await this.verifyOwnership(hotelId, ownerId);
        const pricing = await prisma.pricingPolicy.findFirst({ where: { id: pricingId, roomType: { hotelId } } });
        if (!pricing)
            throw new NotFoundError('Không tìm thấy bảng giá', 'PRICING_NOT_FOUND');
        return prisma.specialPrice.create({
            data: {
                pricingPolicyId: pricingId,
                date: new Date(data.date),
                price: data.price,
                reason: data.reason,
            }, // Ép kiểu xử lý dữ liệu DateTime ép từ string qua DTO
        });
    }
    async listSpecialPrices(pricingId, from, to) {
        const where = { pricingPolicyId: pricingId };
        if (from)
            where.date = { ...where.date, gte: new Date(from) };
        if (to)
            where.date = { ...where.date, lte: new Date(to) };
        return prisma.specialPrice.findMany({ where, orderBy: { date: 'asc' } });
    }
    async deleteSpecialPrice(hotelId, specialPriceId, ownerId) {
        await this.verifyOwnership(hotelId, ownerId);
        const sp = await prisma.specialPrice.findFirst({
            where: { id: specialPriceId, pricingPolicy: { roomType: { hotelId } } },
        });
        if (!sp)
            throw new NotFoundError('Không tìm thấy giá đặc biệt', 'SPECIAL_PRICE_NOT_FOUND');
        await prisma.specialPrice.delete({ where: { id: specialPriceId } });
        return true;
    }
}
export const pricingService = new PricingService();
//# sourceMappingURL=pricing.service.js.map