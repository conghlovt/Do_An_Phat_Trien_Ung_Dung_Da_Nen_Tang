import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Image, ScrollView, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, MoreVertical, CheckCheck, Trash2, X } from 'lucide-react-native';
import { useThemeContext } from '@/src/customer/utils/ThemeContext';

type TabType = 'all' | 'booking' | 'offers' | 'others';
const TABS: { id: TabType; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'booking', label: 'Đặt phòng' },
  { id: 'offers', label: 'Kho ưu đãi' },
  { id: 'others', label: 'Khác' },
];

interface Notification {
  id: string;
  type: TabType;
  title: string;
  description: string;
  isRead: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'Xác nhận đặt phòng',
    description: 'Đặt phòng của bạn tại Sài Gòn Hotel đã được xác nhận',
    isRead: false,
  },
  {
    id: '2',
    type: 'offers',
    title: 'Ưu đãi đặc biệt',
    description: 'Giảm 20% cho lần đặt phòng tiếp theo',
    isRead: false,
  },
  {
    id: '3',
    type: 'booking',
    title: 'Nhắc nhở check-in',
    description: 'Bạn sắp phải check-in tại khách sạn',
    isRead: true,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentTheme, isDarkMode } = useThemeContext();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showMenu, setShowMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === activeTab);

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    setShowMenu(false);
  };

  const handleDeleteAll = () => {
    setNotifications([]);
    setShowMenu(false);
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.card, borderBottomColor: currentTheme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={currentTheme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Thông báo</Text>
        <Pressable onPress={() => setShowMenu(true)} style={styles.menuBtn}>
          <MoreVertical size={24} color={currentTheme.text} />
        </Pressable>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabsScroll, { backgroundColor: currentTheme.card }]}
        contentContainerStyle={styles.tabsContent}
      >
        {TABS.map(({ id, label }) => (
          <Pressable key={id} onPress={() => setActiveTab(id)} style={styles.tabBtn}>
            <Text style={[styles.tabText, activeTab === id && styles.tabTextActive, { color: activeTab === id ? '#85c2a4' : currentTheme.textSecondary }]}>
              {label}
            </Text>
            {activeTab === id && <View style={styles.tabIndicator} />}
          </Pressable>
        ))}
      </ScrollView>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <ScrollView style={styles.notificationsList}>
          {filteredNotifications.map(notification => (
            <View
              key={notification.id}
              style={[
                styles.notificationItem,
                { backgroundColor: currentTheme.card },
                !notification.isRead && { backgroundColor: isDarkMode ? 'rgba(133,194,164,0.15)' : 'rgba(133,194,164,0.08)' },
              ]}
            >
              <View style={styles.notificationContent}>
                <Text style={[styles.notificationTitle, { color: currentTheme.text }]}>{notification.title}</Text>
                <Text style={[styles.notificationDesc, { color: currentTheme.textSecondary }]}>{notification.description}</Text>
              </View>
              <Pressable
                onPress={() => handleDeleteNotification(notification.id)}
                style={styles.deleteBtn}
              >
                <X size={20} color={currentTheme.textSecondary} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Image source={require('@/assets/images/image-19.png')} style={styles.emptyImg} />
          <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>Bạn chưa có thông báo mới nào</Text>
        </View>
      )}

      {/* Bottom Sheet Menu */}
      <Modal visible={showMenu} transparent animationType="slide" onRequestClose={() => setShowMenu(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowMenu(false)} />
        <View style={[styles.sheet, { backgroundColor: currentTheme.card, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.handle, { backgroundColor: currentTheme.border }]} />
          {[
            { Icon: CheckCheck, label: 'Đánh dấu đã đọc tất cả', action: handleMarkAllAsRead },
            { Icon: Trash2, label: 'Xoá tất cả', action: handleDeleteAll },
          ].map(({ Icon, label, action }) => (
            <Pressable key={label} style={styles.sheetRow} onPress={action}>
              <Icon size={24} color={currentTheme.textSecondary} strokeWidth={1.5} />
              <Text style={[styles.sheetLabel, { color: currentTheme.text }]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04,
    shadowRadius: 2, elevation: 2,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  menuBtn: { padding: 8 },
  tabsScroll: { maxHeight: 52 },
  tabsContent: { paddingHorizontal: 4 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 14, position: 'relative' },
  tabText: { fontSize: 15, fontWeight: '500' },
  tabTextActive: { color: '#85c2a4' },
  tabIndicator: {
    position: 'absolute', bottom: 0, left: 16, right: 16,
    height: 3, backgroundColor: '#85c2a4', borderRadius: 2,
  },
  notificationsList: { flex: 1, paddingHorizontal: 12 },
  notificationItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12,
    marginVertical: 6, borderLeftWidth: 4, borderLeftColor: '#f3f4f6',
  },
  notificationUnread: {
    backgroundColor: 'rgba(133, 194, 164, 0.08)',
    borderLeftColor: '#85c2a4',
  },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  notificationDesc: { fontSize: 13 },
  deleteBtn: { padding: 8 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyImg: { width: 256, aspectRatio: 1, resizeMode: 'contain', marginBottom: 16 },
  emptyText: { fontSize: 15, fontWeight: '500' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 16, paddingTop: 12,
  },
  handle: {
    width: 40, height: 6, borderRadius: 3,
    alignSelf: 'center', marginBottom: 16,
  },
  sheetRow: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingVertical: 16, paddingHorizontal: 8,
  },
  sheetLabel: { fontSize: 16 },
});
