export type MessageTab = 'all' | 'unread' | 'read';
export type CustomerNotificationType = 'booking' | 'offers' | 'others';
export type NotificationTab = 'all' | CustomerNotificationType;
export interface CustomerMessageDto {
    id: string;
    hotelName: string;
    preview: string;
    time: string;
    isRead: boolean;
}
export interface CustomerNotificationDto {
    id: string;
    type: CustomerNotificationType;
    title: string;
    description: string;
    isRead: boolean;
    time: string;
}
//# sourceMappingURL=message.model.d.ts.map