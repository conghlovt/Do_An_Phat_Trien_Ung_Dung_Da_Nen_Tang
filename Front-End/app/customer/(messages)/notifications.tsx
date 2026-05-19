import React, { useEffect, useState } from 'react';
import {
  Platform, View, Text, StyleSheet, Pressable, ScrollView, Modal, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft, MoreVertical, CheckCheck, Trash2, X,
  CalendarCheck, TicketPercent, Info,
} from 'lucide-react-native';
import { useThemeContext } from '@/src/customer/shared/theme/ThemeContext';
import { useCustomerBack } from '@/src/customer/shared/navigation/useCustomerBack';
import { messagesApi } from '@/src/customer/features/messages/api/messages.api';
import { NOTIFICATION_TABS } from '@/src/customer/features/messages/constants/messageTabs';
import type { CustomerNotification, NotificationTab } from '@/src/customer/features/messages/types/messages.types';

const getNotificationMeta = (type: NotificationTab) => {
  switch (type) {
    case 'booking':
      return { Icon: CalendarCheck, color: '#2f855f', bg: '#e6f6ee', label: 'Đặt phòng' };
    case 'offers':
      return { Icon: TicketPercent, color: '#c2410c', bg: '#fff1e7', label: 'Ưu đãi' };
    case 'others':
      return { Icon: Info, color: '#475569', bg: '#eef2f7', label: 'Khác' };
    default:
      return { Icon: Info, color: '#2f855f', bg: '#e6f6ee', label: 'Thông báo' };
  }
};

export default function NotificationsScreen() {
  const goBack = useCustomerBack();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentTheme, isDarkMode } = useThemeContext();
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const [showMenu, setShowMenu] = useState(false);
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isWebLayout = Platform.OS === 'web' && width >= 768;

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === activeTab);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const emptyText = isLoading ? 'Đang tải thông báo...' : 'Bạn chưa có thông báo mới nào';

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const data = await messagesApi.getNotifications();
        if (isMounted) setNotifications(data);
      } catch {
        if (isMounted) setNotifications([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleMarkAllAsRead = async () => {
    const previousNotifications = notifications;
    setNotifications((current) => current.map(n => ({ ...n, isRead: true })));
    setShowMenu(false);

    try {
      const updatedNotifications = await messagesApi.markAllNotificationsAsRead();
      setNotifications(updatedNotifications);
    } catch {
      setNotifications(previousNotifications);
    }
  };

  const handleDeleteAll = async () => {
    const previousNotifications = notifications;
    setNotifications([]);
    setShowMenu(false);

    try {
      const updatedNotifications = await messagesApi.deleteAllNotifications();
      setNotifications(updatedNotifications);
    } catch {
      setNotifications(previousNotifications);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    const previousNotifications = notifications;
    setNotifications((current) => current.filter(n => n.id !== id));

    try {
      const updatedNotifications = await messagesApi.deleteNotification(id);
      setNotifications(updatedNotifications);
    } catch {
      setNotifications(previousNotifications);
    }
  };

  return (
    <View style={[styles.container, isWebLayout && styles.webContainer, { backgroundColor: isWebLayout ? '#eef8f2' : currentTheme.background, paddingTop: isWebLayout ? 0 : insets.top }]}>
      {/* Header */}
      <View style={[styles.header, isWebLayout && styles.webHeader, { backgroundColor: currentTheme.card, borderBottomColor: currentTheme.border }]}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <ArrowLeft size={24} color={currentTheme.text} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Thông báo</Text>
          {isWebLayout && <Text style={styles.headerSubtitle}>{unreadCount} thông báo chưa đọc</Text>}
        </View>
        <Pressable onPress={() => setShowMenu(true)} style={styles.menuBtn}>
          <MoreVertical size={24} color={currentTheme.text} />
        </Pressable>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabsScroll, isWebLayout && styles.webTabsScroll, { backgroundColor: isWebLayout ? 'transparent' : currentTheme.card }]}
        contentContainerStyle={[styles.tabsContent, isWebLayout && styles.webTabsContent]}
      >
        {NOTIFICATION_TABS.map(({ id, label }) => (
          <Pressable key={id} onPress={() => setActiveTab(id)} style={[styles.tabBtn, isWebLayout && styles.webTabBtn, activeTab === id && isWebLayout && styles.webTabBtnActive]}>
            <Text style={[styles.tabText, activeTab === id && styles.tabTextActive, { color: activeTab === id ? (isWebLayout ? '#ffffff' : '#85c2a4') : currentTheme.textSecondary }]}>
              {label}
            </Text>
            {activeTab === id && !isWebLayout && <View style={styles.tabIndicator} />}
          </Pressable>
        ))}
      </ScrollView>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <ScrollView
          style={[styles.notificationsList, isWebLayout && styles.webNotificationsList]}
          contentContainerStyle={isWebLayout && styles.webNotificationsContent}
        >
          {filteredNotifications.map(notification => {
            const meta = getNotificationMeta(notification.type);
            const Icon = meta.Icon;

            return (
              <View
                key={notification.id}
                style={[
                  styles.notificationItem,
                  isWebLayout && styles.webNotificationItem,
                  { backgroundColor: currentTheme.card },
                  !notification.isRead && styles.notificationUnread,
                  !notification.isRead && { backgroundColor: isDarkMode ? 'rgba(133,194,164,0.15)' : '#f8fffb' },
                ]}
              >
                <View style={[styles.notificationIcon, { backgroundColor: meta.bg }]}>
                  <Icon size={20} color={meta.color} />
                </View>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationTopRow}>
                    <Text style={[styles.notificationTitle, { color: currentTheme.text }]}>{notification.title}</Text>
                    {!notification.isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={[styles.notificationDesc, { color: currentTheme.textSecondary }]}>{notification.description}</Text>
                  <View style={styles.notificationMetaRow}>
                    <Text style={[styles.notificationType, { color: meta.color, backgroundColor: meta.bg }]}>{meta.label}</Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => {
                    void handleDeleteNotification(notification.id);
                  }}
                  style={styles.deleteBtn}
                >
                  <X size={18} color={currentTheme.textSecondary} />
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <View style={[styles.emptyState, isWebLayout && styles.webEmptyState]}>
          {isWebLayout && <Text style={styles.emptyTitle}>Không có thông báo</Text>}
          <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>{emptyText}</Text>
        </View>
      )}

      {/* Bottom Sheet Menu */}
      <Modal visible={showMenu} transparent animationType={isWebLayout ? 'fade' : 'slide'} onRequestClose={() => setShowMenu(false)}>
        <Pressable style={[styles.overlay, isWebLayout && styles.webOverlay]} onPress={() => setShowMenu(false)} />
        <View style={[styles.sheet, isWebLayout && styles.webSheet, { backgroundColor: currentTheme.card, paddingBottom: isWebLayout ? 10 : insets.bottom + 16 }]}>
          {!isWebLayout && <View style={[styles.handle, { backgroundColor: currentTheme.border }]} />}
          {[
            { Icon: CheckCheck, label: 'Đánh dấu đã đọc tất cả', action: handleMarkAllAsRead },
            { Icon: Trash2, label: 'Xoá tất cả', action: handleDeleteAll },
          ].map(({ Icon, label, action }) => (
            <Pressable
              key={label}
              style={[styles.sheetRow, isWebLayout && styles.webSheetRow]}
              onPress={() => {
                void action();
              }}
            >
              <Icon size={isWebLayout ? 20 : 24} color={label.includes('Xoá') ? '#ef4444' : currentTheme.textSecondary} strokeWidth={1.8} />
              <Text style={[styles.sheetLabel, isWebLayout && styles.webSheetLabel, { color: label.includes('Xoá') ? '#ef4444' : currentTheme.text }]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webContainer: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04,
    shadowRadius: 2, elevation: 2,
  },
  webHeader: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 40,
    paddingTop: 16,
    paddingBottom: 16,
    minHeight: 72,
  },
  backBtn: { padding: 8 },
  headerTitleWrap: { alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  headerSubtitle: { marginTop: 3, fontSize: 12, color: '#7b8a99', fontWeight: '600' },
  menuBtn: { padding: 8 },
  tabsScroll: { maxHeight: 52 },
  tabsContent: { paddingHorizontal: 4 },
  webTabsScroll: {
    maxHeight: 58,
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    marginTop: 18,
    marginBottom: 0,
  },
  webTabsContent: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    paddingHorizontal: 0,
    gap: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 14, position: 'relative' },
  webTabBtn: {
    width: 118,
    minHeight: 44,
    paddingHorizontal: 0,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webTabBtnActive: {
    backgroundColor: '#85c2a4',
    borderColor: '#85c2a4',
  },
  tabText: { fontSize: 15, fontWeight: '500' },
  tabTextActive: { color: '#85c2a4', fontWeight: '800' },
  tabIndicator: {
    position: 'absolute', bottom: 0, left: 16, right: 16,
    height: 3, backgroundColor: '#85c2a4', borderRadius: 2,
  },
  notificationsList: { flex: 1, paddingHorizontal: 12 },
  webNotificationsList: {
    paddingHorizontal: 0,
  },
  webNotificationsContent: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    paddingHorizontal: 0,
    paddingTop: 16,
    paddingBottom: 52,
    gap: 12,
  },
  notificationItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12,
    marginVertical: 6, borderLeftWidth: 4, borderLeftColor: '#f3f4f6',
  },
  webNotificationItem: {
    minHeight: 92,
    padding: 18,
    borderRadius: 16,
    marginVertical: 0,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
    borderLeftWidth: 4,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 1,
  },
  notificationUnread: {
    backgroundColor: 'rgba(133, 194, 164, 0.08)',
    borderLeftColor: '#85c2a4',
  },
  notificationIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: { flex: 1 },
  notificationTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  notificationTitle: { fontSize: 15, fontWeight: '800' },
  notificationDesc: { fontSize: 13, lineHeight: 19 },
  notificationMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  notificationType: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '800',
  },
  notificationTime: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  webEmptyState: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    marginTop: 52,
    flex: 0,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(133,194,164,0.22)',
    padding: 36,
  },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#111827', marginBottom: 6 },
  emptyText: { fontSize: 15, fontWeight: '500' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  webOverlay: {
    backgroundColor: 'rgba(15,23,42,0.16)',
  },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 16, paddingTop: 12,
  },
  webSheet: {
    position: 'absolute',
    top: 86,
    right: 42,
    width: 320,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 12,
  },
  sheetTitle: {
    paddingHorizontal: 10,
    paddingTop: 4,
    paddingBottom: 8,
    fontSize: 13,
    fontWeight: '900',
  },
  handle: {
    width: 40, height: 6, borderRadius: 3,
    alignSelf: 'center', marginBottom: 16,
  },
  sheetRow: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingVertical: 16, paddingHorizontal: 8,
  },
  webSheetRow: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  sheetLabel: { fontSize: 16 },
  webSheetLabel: { fontSize: 14, fontWeight: '800' },
});
