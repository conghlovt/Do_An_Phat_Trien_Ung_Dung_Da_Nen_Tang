import { styles } from '@/src/customer/styles/messages/messages.styles';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, View, Text, Pressable, TextInput, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MessageCircle, Search } from 'lucide-react-native';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { useCustomerBack } from '@/src/customer/navigation/useCustomerBack';
import { messagesApi } from '@/src/customer/services/messages/messages.api';
import { MESSAGE_TABS } from '@/src/customer/constants/messages/messageTabs';
import type { CustomerMessage, MessageTab } from '@/src/customer/types/messages';

export default function MessagesScreen() {
  const goBack = useCustomerBack();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentTheme, isDarkMode } = useThemeContext();
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
      <View style={[styles.header, isWebLayout && styles.webHeader, { backgroundColor: currentTheme.card, borderBottomColor: currentTheme.border }]}>
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
        <Search size={20} color={currentTheme.iconInactive} strokeWidth={2.2} />
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
          {filteredMessages.map((message) => {
            const unread = !message.isRead;
            const unreadBg = isDarkMode ? 'rgba(133,194,164,0.18)' : '#f8fffb';
            const unreadBorder = isDarkMode ? 'rgba(133,194,164,0.7)' : 'rgba(133,194,164,0.58)';
            const readIconBg = isDarkMode ? '#263241' : '#eef2f7';
            const unreadPreviewColor = isDarkMode ? '#d1fae5' : '#334155';

            return (
              <Pressable
                key={message.id}
                style={[
                  styles.messageCard,
                  isWebLayout && styles.webMessageCard,
                  {
                    backgroundColor: unread ? unreadBg : currentTheme.card,
                    borderColor: unread ? unreadBorder : currentTheme.border,
                  },
                  unread && styles.messageCardUnread,
                ]}
                onPress={() => {
                  void markAsRead(message.id);
                }}
              >
                <View style={[styles.messageIcon, { backgroundColor: unread ? '#85c2a4' : readIconBg }, unread && styles.messageIconUnread]}>
                  <MessageCircle size={20} color={unread ? '#ffffff' : currentTheme.iconInactive} strokeWidth={2.2} />
                </View>
                <View style={styles.messageInfo}>
                  <View style={styles.messageTopRow}>
                    <Text style={[styles.messageHotel, { color: currentTheme.text }, unread && styles.messageHotelUnread]} numberOfLines={1}>
                      {message.hotelName}
                    </Text>
                    <Text style={[styles.messageTime, unread && styles.messageTimeUnread]}>{message.time}</Text>
                  </View>
                  <Text style={[styles.messagePreview, { color: unread ? unreadPreviewColor : currentTheme.textSecondary }, unread && styles.messagePreviewUnread]} numberOfLines={2}>
                    {message.preview}
                  </Text>
                </View>
                {unread && <View style={[styles.messageUnreadDot, isDarkMode && styles.messageUnreadDotDark]} />}
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <View style={[styles.emptyState, isWebLayout && styles.webEmptyState]}>
          <Text style={[styles.emptyText, { color: currentTheme.text }]}>{emptyText}</Text>
        </View>
      )}
    </View>
  );
}
