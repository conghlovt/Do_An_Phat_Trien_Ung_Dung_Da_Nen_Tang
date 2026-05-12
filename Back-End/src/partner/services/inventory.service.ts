import prisma from '../../login/lib/prisma';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';

export class InventoryService {
  /**
   * Get room inventory calendar data for a hotel
   * Returns room types with their inventory & pricing for a date range
   */
  async getCalendar(hotelId: string, ownerId: string, startDate: string, endDate: string) {
    // Verify ownership
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      select: { id: true, ownerId: true },
    });
    if (!hotel) throw new NotFoundError('Không tìm thấy khách sạn', 'HOTEL_NOT_FOUND');
    if (hotel.ownerId !== ownerId) throw new ForbiddenError('Bạn không có quyền xem khách sạn này');

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get all room types with their inventory and pricing
    const roomTypes = await prisma.roomType.findMany({
      where: { hotelId },
      include: {
        inventory: {
          where: {
            date: { gte: start, lte: end },
          },
          orderBy: { date: 'asc' },
        },
        pricingPolicies: {
          where: { isActive: true },
        },
        _count: {
          select: { roomUnits: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Build calendar data
    const calendar = roomTypes.map((rt) => {
      // Build inventory map by date
      const inventoryMap: Record<string, any> = {};
      for (const inv of rt.inventory) {
        const dateKey = inv.date.toISOString().split('T')[0]!;
        inventoryMap[dateKey] = {
          totalRooms: inv.totalRooms,
          bookedRooms: inv.bookedRooms,
          availableRooms: inv.totalRooms - inv.bookedRooms,
          isClosed: inv.isClosed,
        };
      }

      // Get base prices by booking type
      const pricing: Record<string, number> = {};
      for (const p of rt.pricingPolicies) {
        pricing[p.bookingType] = Number(p.basePrice);
      }

      return {
        id: rt.id,
        name: rt.name,
        totalUnits: rt._count.roomUnits || rt.totalUnits,
        status: rt.status,
        inventory: inventoryMap,
        pricing,
      };
    });

    return calendar;
  }

  /**
   * Update inventory for a specific room type on a specific date
   */
  async updateInventory(
    hotelId: string,
    roomTypeId: string,
    ownerId: string,
    date: string,
    data: { totalRooms?: number; isClosed?: boolean }
  ) {
    // Verify ownership
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      select: { id: true, ownerId: true },
    });
    if (!hotel) throw new NotFoundError('Không tìm thấy khách sạn', 'HOTEL_NOT_FOUND');
    if (hotel.ownerId !== ownerId) throw new ForbiddenError('Bạn không có quyền chỉnh sửa');

    const dateObj = new Date(date);

    const inventory = await prisma.roomInventory.upsert({
      where: {
        roomTypeId_date: { roomTypeId, date: dateObj },
      },
      update: {
        ...(data.totalRooms !== undefined && { totalRooms: data.totalRooms }),
        ...(data.isClosed !== undefined && { isClosed: data.isClosed }),
      },
      create: {
        roomTypeId,
        date: dateObj,
        totalRooms: data.totalRooms ?? 0,
        isClosed: data.isClosed ?? false,
      },
    });

    return inventory;
  }
}

export const inventoryService = new InventoryService();
