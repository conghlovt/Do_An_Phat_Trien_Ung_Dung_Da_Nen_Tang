import type { NextFunction, Request, Response } from 'express';
import type { CustomerAuthRequest } from '../middlewares/auth.middleware';
import * as messageService from '../services/message.service';

const getCustomerId = (req: Request) => (req as CustomerAuthRequest).user?.id;

export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const messages = await messageService.findMessages(getCustomerId(req));
    res.json({ data: messages });
  } catch (error) {
    next(error);
  }
};

export const markMessageAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const message = await messageService.markMessageAsRead(req.params.id as string, getCustomerId(req));
    res.json({ data: message });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const notifications = await messageService.findNotifications(getCustomerId(req));
    res.json({ data: notifications });
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
    const notifications = await messageService.markAllNotificationsAsRead(getCustomerId(req));
    res.json({ data: notifications });
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
    const notifications = await messageService.deleteAllNotifications(getCustomerId(req));
    res.json({ data: notifications });
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
    const notifications = await messageService.deleteNotification(req.params.id as string, getCustomerId(req));
    res.json({ data: notifications });
  } catch (error) {
    next(error);
  }
};
