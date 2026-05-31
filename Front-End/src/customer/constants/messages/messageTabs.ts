import type { MessageTab, NotificationTab } from '@/src/customer/types/messages';

export const MESSAGE_TABS: { id: MessageTab; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'unread', label: 'Chưa đọc' },
  { id: 'read', label: 'Đã đọc' },
];

export const NOTIFICATION_TABS: { id: NotificationTab; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'booking', label: 'Đặt phòng' },
  { id: 'offers', label: 'Kho ưu đãi' },
  { id: 'others', label: 'Khác' },
];
