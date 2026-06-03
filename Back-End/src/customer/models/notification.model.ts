export type CustomerNotificationType = "booking" | "offers" | "others";

export type NotificationTab = "all" | CustomerNotificationType;

export interface CustomerNotificationDto {
  id: string;
  type: CustomerNotificationType;
  title: string;
  description: string;
  isRead: boolean;
  time: string;
}
