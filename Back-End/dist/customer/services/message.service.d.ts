import type { CustomerMessageDto, CustomerNotificationDto } from '../models/message.model';
export declare const findMessages: (userId?: string) => Promise<CustomerMessageDto[]>;
export declare const markMessageAsRead: (id: string, userId?: string) => Promise<CustomerMessageDto>;
export declare const findNotifications: (userId?: string) => Promise<CustomerNotificationDto[]>;
export declare const markAllNotificationsAsRead: (userId?: string) => Promise<CustomerNotificationDto[]>;
export declare const deleteAllNotifications: (userId?: string) => Promise<CustomerNotificationDto[]>;
export declare const deleteNotification: (id: string, userId?: string) => Promise<CustomerNotificationDto[]>;
//# sourceMappingURL=message.service.d.ts.map