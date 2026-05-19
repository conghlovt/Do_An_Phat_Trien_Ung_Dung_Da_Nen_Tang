import { inventoryService } from '../services/inventory.service';
import { sendSuccess } from '../../shared/utils/response.util';
export class InventoryController {
    async getCalendar(req, res, next) {
        try {
            const { hotelId } = req.params;
            const userId = req.user?.id;
            const { startDate, endDate } = req.query;
            const calendar = await inventoryService.getCalendar(hotelId, userId, startDate, endDate);
            sendSuccess(res, 200, 'INVENTORY_CALENDAR', 'Lịch phòng trống', calendar);
        }
        catch (error) {
            next(error);
        }
    }
    async updateInventory(req, res, next) {
        try {
            const { hotelId, roomTypeId } = req.params;
            const userId = req.user?.id;
            const { date, totalRooms, isClosed } = req.body;
            const inventory = await inventoryService.updateInventory(hotelId, roomTypeId, userId, date, { totalRooms, isClosed });
            sendSuccess(res, 200, 'INVENTORY_UPDATED', 'Cập nhật thành công', inventory);
        }
        catch (error) {
            next(error);
        }
    }
}
export const inventoryController = new InventoryController();
//# sourceMappingURL=inventory.controller.js.map