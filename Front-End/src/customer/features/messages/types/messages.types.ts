export type MessageTab = 'all' | 'unread' | 'read';

export interface CustomerMessage {
  id: string;
  hotelName: string;
  preview: string;
  time: string;
  isRead: boolean;
}

export type NotificationType = 'booking' | 'offers' | 'others';

export type NotificationTab = 'all' | NotificationType;

export interface CustomerNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  isRead: boolean;
  time: string;
}
