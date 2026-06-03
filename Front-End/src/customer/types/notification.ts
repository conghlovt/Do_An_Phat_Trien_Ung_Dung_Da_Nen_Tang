export type NotificationType = "booking" | "offers" | "others";

export type NotificationTab = "all" | NotificationType;

export interface CustomerNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  isRead: boolean;
  time: string;
}
