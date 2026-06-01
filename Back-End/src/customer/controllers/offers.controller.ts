import { type Request, type Response } from "express";
import { OffersService } from "../services/offers.service";
import { type CustomerAuthRequest } from "../middlewares/auth.middleware";

const offersService = new OffersService();

export class OffersController {
  async getGroupedOffers(req: CustomerAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const data = await offersService.getGroupedOffers(userId);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getWalletVouchers(req: CustomerAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      console.log(
        `🎯 getWalletVouchers endpoint - userId from req.user:`,
        userId,
      );

      if (!userId) {
        console.log(`❌ No userId found in request`);
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const data = await offersService.getWalletVouchers(userId);
      console.log(`✅ Service returned:`, data);

      res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error(`❌ Error in getWalletVouchers:`, error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async collectOffer(req: CustomerAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }
      const offerId = req.params["offerId"];
      if (!offerId || typeof offerId !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "Missing or invalid offerId" });
      }
      const data = await offersService.collectOffer(userId, offerId);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
