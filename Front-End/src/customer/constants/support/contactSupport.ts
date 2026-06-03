import { Mail, MessageCircle, Phone } from "lucide-react-native";

export const CONTACT_ITEMS = [
  {
    type: "phone",
    title: "Hotline CSKH",
    subtitle: "1900 1234",
    buttonLabel: "Gọi ngay",
    icon: Phone,
  },
  {
    type: "chat",
    title: "Chat trực tuyến",
    subtitle: "Zalo, Messenger",
    buttonLabel: "Bắt đầu",
    icon: MessageCircle,
  },
  {
    type: "email",
    title: "Email",
    subtitle: "support@stayhub.com",
    buttonLabel: "Gửi email",
    icon: Mail,
  },
];
