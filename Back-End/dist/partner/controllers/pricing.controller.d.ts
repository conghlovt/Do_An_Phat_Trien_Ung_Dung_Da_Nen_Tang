import type { Response } from 'express';
import type { AuthRequest } from '../../login/middlewares/auth.middleware';
export declare class PricingController {
    createPricing(req: AuthRequest, res: Response): Promise<void>;
    updatePricing(req: AuthRequest, res: Response): Promise<void>;
    listPricing(req: AuthRequest, res: Response): Promise<void>;
    deletePricing(req: AuthRequest, res: Response): Promise<void>;
    createSpecialPrice(req: AuthRequest, res: Response): Promise<void>;
    listSpecialPrices(req: AuthRequest, res: Response): Promise<void>;
    deleteSpecialPrice(req: AuthRequest, res: Response): Promise<void>;
}
export declare const pricingController: PricingController;
//# sourceMappingURL=pricing.controller.d.ts.map