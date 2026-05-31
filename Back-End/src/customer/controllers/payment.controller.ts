import type { Request, Response, NextFunction } from "express";
import { handleSepayWebhook } from "../services/payment.service";
import { sendResponse } from "../../shared/utils/response.util";

export const receiveSepayWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await handleSepayWebhook(req.body);
    return sendResponse(res, 200, "Xử lý webhook Sepay thành công", {
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
