import React, { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, View, Text, StyleSheet, Pressable, TextInput, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MessageCircle, Search } from 'lucide-react-native';
import { useThemeContext } from '@/src/customer/shared/theme/ThemeContext';
import { useCustomerBack } from '@/src/customer/shared/navigation/useCustomerBack';
import { messagesApi } from '@/src/customer/features/messages/api/messages.api';
import { MESSAGE_TABS } from '@/src/customer/features/messages/constants/messageTabs';
import type { CustomerMessage, MessageTab } from '@/src/customer/features/messages/types/messages.types';

export default function MessagesScreen() {
  const goBack = useCustomerBack();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentTheme } = useThemeContext();
  const [activeTab, setActiveTab] = useState<MessageTab>('all');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isWebLayout = Platform.OS === 'web' && width >= 768;
  const unreadCount = messages.filter((message) => !message.isRead).length;
  const filteredMessages = messages.filter((message) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'unread' && !message.isRead) ||
      (activeTab === 'read' && message.isRead);
    const keyword = query.trim().toLowerCase();
    const matchesQuery = !keyword || message.hotelName.toLowerCase().includes(keyword) || message.preview.toLowerCase().includes(keyword);

    return matchesTab && matchesQuery;
  });

  useEffect(() => {
    let isMounted = true;

    const loadMessages = async () => {
      try {
        const data = await messagesApi.getMessages();
        if (isMounted) setMessages(data);
      } catch {
        if (isMounted) setMessages([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadMessages();

    return () => {
      isMounted = false;
    };
  }, []);

  const emptyText = useMemo(() => {
    if (isLoading) return 'Đang tải tin nhắn...';
    if (query.trim()) return 'Không tìm thấy tin nhắn phù hợp';
    if (activeTab === 'unread') return 'Bạn hiện không có tin nhắn chưa đọc';
    if (activeTab === 'read') return 'Bạn hiện không có tin nhắn đã đọc';
    return 'Bạn hiện không có tin nhắn nào';
  }, [activeTab, isLoading, query]);

  const markAsRead = async (id: string) => {
    const targetMessage = messages.find((message) => message.id === id);
    if (!targetMessage || targetMessage.isRead) return;

    const previousMessages = messages;
    setMessages((current) =>
      current.map((message) => (
        message.id === id ? { ...message, isRead: true } : message
      )),
    );

    try {
      const updatedMessage = await messagesApi.markMessageAsRead(id);
      setMessages((current) =>
        current.map((message) => (
          message.id === id ? updatedMessage : message
        )),
      );
    } catch {
      setMessages(previousMessages);
    }
  };

  return (
    <View style={[styles.container, isWebLayout && styles.webContainer, { backgroundColor: currentTheme.background, paddingTop: isWebLayout ? 0 : insets.top }]}>
      <View style={[styles.header, isWebLayout && styles.webHeader]}>
        <Pressable style={styles.backBtn} onPress={goBack} hitSlop={12}>
          <ChevronLeft size={34} color={currentTheme.text} strokeWidth={2.4} />
        </Pressable>
        <Text style={[styles.title, { color: currentTheme.text }]}>Tin nhắn</Text>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.searchBox, isWebLayout && styles.webSearchBox, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
        <Search size={25} color="#9aa3b5" strokeWidth={2.4} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Tìm theo tên khách sạn"
          placeholderTextColor="#a4acba"
          style={[styles.searchInput, { color: currentTheme.text }]}
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      <View style={[styles.tabs, isWebLayout && styles.webTabs]}>
        {MESSAGE_TABS.map((tab) => {
          const active = activeTab === tab.id;
          const tabUnread = tab.id === 'unread' ? unreadCount : 0;

          return (
            <Pressable
              key={tab.id}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, { color: currentTheme.textSecondary }, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {tabUnread > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{tabUnread}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {filteredMessages.length > 0 ? (
        <ScrollView
          style={styles.messagesList}
          contentContainerStyle={[styles.messagesContent, isWebLayout && styles.webMessagesContent]}
          showsVerticalScrollIndicator={isWebLayout}
        >
          {filteredMessages.map((message) => (
            <Pressable
              key={message.id}
              style={[
                styles.messageCard,
                isWebLayout && styles.webMessageCard,
                { backgroundColor: currentTheme.card, borderColor: currentTheme.border },
                !message.isRead && styles.messageCardUnread,
              ]}
              onPress={() => {
                void markAsRead(message.id);
              }}
            >
              <View style={[styles.messageIcon, !message.isRead && styles.messageIconUnread]}>
                <MessageCircle size={21} color={message.isRead ? '#64748b' : '#ffffff'} strokeWidth={2.2} />
              </View>
              <View style={styles.messageInfo}>
                <View style={styles.messageTopRow}>
                  <Text style={[styles.messageHotel, { color: currentTheme.text }]} numberOfLines={1}>
                    {message.hotelName}
                  </Text>
                  <Text style={styles.messageTime}>{message.time}</Text>
                </View>
                <Text style={[styles.messagePreview, { color: currentTheme.textSecondary }]} numberOfLines={2}>
                  {message.preview}
                </Text>
              </View>
              {!message.isRead && <View style={styles.messageUnreadDot} />}
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View style={[styles.emptyState, isWebLayout && styles.webEmptyState]}>
          <Text style={[styles.emptyText, { color: currentTheme.text }]}>{emptyText}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webContainer: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 24,
  },
  webHeader: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingTop: 18,
    paddingBottom: 18,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: 0,
  },
  headerRight: {
    width: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  headerBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 7,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  headerBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    height: 62,
    marginHorizontal: 20,
    borderWidth: 1.4,
    borderRadius: 31,
    paddingHorizontal: 22,
  },
  webSearchBox: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    marginHorizontal: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: 23,
    fontWeight: '600',
    padding: 0,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
    paddingHorizontal: 20,
    paddingTop: 26,
  },
  webTabs: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 32,
  },
  tabBtn: {
    minWidth: 84,
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  tabBtnActive: {
    backgroundColor: '#f3f2fb',
  },
  tabText: {
    fontSize: 21,
    fontWeight: '800',
  },
  tabTextActive: {
    color: '#3f4654',
  },
  tabBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
    gap: 12,
  },
  webMessagesContent: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingTop: 22,
    paddingBottom: 52,
  },
  messageCard: {
    minHeight: 86,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    position: 'relative',
  },
  webMessageCard: {
    minHeight: 94,
    paddingHorizontal: 18,
  },
  messageCardUnread: {
    borderColor: 'rgba(133,194,164,0.5)',
    backgroundColor: '#f8fffb',
  },
  messageIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#eef2f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageIconUnread: {
    backgroundColor: '#85c2a4',
  },
  messageInfo: {
    flex: 1,
    minWidth: 0,
  },
  messageTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  messageHotel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
  },
  messageTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  messagePreview: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  messageUnreadDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#ef4444',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 90,
  },
  webEmptyState: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
  },
});
