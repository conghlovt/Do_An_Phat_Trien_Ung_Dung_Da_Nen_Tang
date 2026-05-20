import * as Linking from 'expo-linking';
import { Mail, MessageCircle, Phone } from 'lucide-react-native';

export const CONTACT_ITEMS = [
  {
    type: 'phone',
    title: 'Hotline CSKH',
    subtitle: '1900 1234',
    buttonLabel: 'Gọi ngay',
    icon: Phone,
    action: () => Linking.openURL('tel:19001234'),
  },
  {
    type: 'chat',
    title: 'Chat trực tuyến',
    subtitle: 'Zalo, Messenger',
    buttonLabel: 'Bắt đầu',
    icon: MessageCircle,
    action: () => {},
  },
  {
    type: 'email',
    title: 'Email',
    subtitle: 'support@stayhub.com',
    buttonLabel: 'Gửi email',
    icon: Mail,
    action: () => Linking.openURL('mailto:support@stayhub.com'),
  },
];
