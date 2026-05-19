import type { NextFunction, Request, Response } from 'express';
export declare const getMessages: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const markMessageAsRead: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getNotifications: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const markAllNotificationsAsRead: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteAllNotifications: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteNotification: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=message.controller.d.ts.map