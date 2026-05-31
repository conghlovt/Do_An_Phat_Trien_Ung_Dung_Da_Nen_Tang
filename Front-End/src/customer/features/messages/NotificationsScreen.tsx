import { styles } from '@/src/customer/styles/messages/notifications.styles';
import React, { useEffect, useState } from 'react';
import {
  Image, Platform, View, Text, Pressable, ScrollView, Modal, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft, MoreVertical, CheckCheck, Trash2, X,
  CalendarCheck, TicketPercent, Info,
} from 'lucide-react-native';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { useCustomerBack } from '@/src/customer/navigation/useCustomerBack';
import { messagesApi } from '@/src/customer/services/messages/messages.api';
import { NOTIFICATION_TABS } from '@/src/customer/constants/messages/messageTabs';
import type { CustomerNotification, NotificationTab } from '@/src/customer/types/messages';

const getNotificationMeta = (type: NotificationTab) => {
  switch (type) {
    case 'booking':
      return { Icon: CalendarCheck, color: '#85c2a4', bg: 'rgba(133,194,164,0.16)', label: 'Đặt phòng' };
    case 'offers':
      return { Icon: TicketPercent, color: '#85c2a4', bg: 'rgba(133,194,164,0.16)', label: 'Ưu đãi' };
    case 'others':
      return { Icon: Info, color: '#475569', bg: '#eef2f7', label: 'Khác' };
    default:
      return { Icon: Info, color: '#85c2a4', bg: 'rgba(133,194,164,0.16)', label: 'Thông báo' };
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
        <View style={[styles.emptyState, isWebLayout && styles.webEmptyState, { backgroundColor: currentTheme.background }]}>
          {!isLoading && <Image source={require('@/assets/images/image-19.png')} style={styles.emptyImage} />}
          {!isLoading && <Text style={[styles.emptyTitle, { color: currentTheme.text }]}>Không có thông báo nào!</Text>}
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
