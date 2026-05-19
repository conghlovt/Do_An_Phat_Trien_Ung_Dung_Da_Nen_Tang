import type { Request, Response, NextFunction } from 'express';
export declare class InventoryController {
    getCalendar(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateInventory(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const inventoryController: InventoryController;
//# sourceMappingURL=inventory.controller.d.ts.map