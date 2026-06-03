import type { NextFunction, Request, Response } from "express";
import type { CustomerAuthRequest } from "../middlewares/auth.middleware";
import * as notificationService from "../services/notification.service";
import { sendResponse } from "../../shared/utils/response.util";

const getCustomerId = (req: Request) => (req as CustomerAuthRequest).user?.id;


export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const notifications = await notificationService.findNotifications(
      getCustomerId(req),
    );
    sendResponse(res, 200, "Lấy danh sách thông báo thành công", notifications);
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const notifications = await notificationService.markAllNotificationsAsRead(
      getCustomerId(req),
    );
    sendResponse(
      res,
      200,
      "Đánh dấu tất cả thông báo thành công",
      notifications,
    );
  } catch (error) {
    next(error);
  }
};

export const deleteAllNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const notifications = await notificationService.deleteAllNotifications(
      getCustomerId(req),
    );
    sendResponse(res, 200, "Xóa tất cả thông báo thành công", notifications);
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const notifications = await notificationService.deleteNotification(
      req.params.id as string,
      getCustomerId(req),
    );
    sendResponse(res, 200, "Xóa thông báo thành công", notifications);
  } catch (error) {
    next(error);
  }
};
