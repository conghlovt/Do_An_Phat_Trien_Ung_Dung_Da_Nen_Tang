import type { NotificationTab } from "@/src/customer/types/notification";

export const NOTIFICATION_TABS: { id: NotificationTab; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "booking", label: "Đặt phòng" },
  { id: "offers", label: "Kho ưu đãi" },
  { id: "others", label: "Khác" },
];
