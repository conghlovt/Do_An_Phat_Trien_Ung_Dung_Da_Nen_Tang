import type { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventory.service';
import { sendSuccess } from '../../shared/utils/response.util';

export class InventoryController {
  async getCalendar(req: Request, res: Response, next: NextFunction) {
    try {
      const { hotelId } = req.params;
      const userId = (req as any).user?.id;
      const { startDate, endDate } = req.query as { startDate: string; endDate: string };

      const calendar = await inventoryService.getCalendar(
        hotelId as string, userId, startDate as string, endDate as string
      );
      sendSuccess(res, 200, 'INVENTORY_CALENDAR', 'Lịch phòng trống', calendar);
    } catch (error) {
      next(error);
    }
  }

  async updateInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const { hotelId, roomTypeId } = req.params;
      const userId = (req as any).user?.id;
      const { date, totalRooms, isClosed } = req.body;

      const inventory = await inventoryService.updateInventory(
        hotelId as string, roomTypeId as string, userId, date as string, { totalRooms, isClosed }
      );
      sendSuccess(res, 200, 'INVENTORY_UPDATED', 'Cập nhật thành công', inventory);
    } catch (error) {
      next(error);
    }
  }
}

export const inventoryController = new InventoryController();
