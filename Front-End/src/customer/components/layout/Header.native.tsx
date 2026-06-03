import { styles } from './Header.styles';
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, ChevronDown, MessageCircle, Bell, Search } from 'lucide-react-native';
import { useLocationContext } from '@/src/customer/context/LocationContext';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { useAuth } from '@/src/customer/hooks/useAuth';
import LocationPickerModal from '@/src/customer/components/layout/LocationPickerModal';
import { messagesApi } from '@/src/customer/services/messages/messages.api';

const STAYHUB_COLOR = '#85c2a4';
const PRIMARY = '#85c2a4';

interface HeaderProps {
    onOpenSearch?: () => void;
    onOpenMessages?: () => void;
    onOpenNotifications?: () => void;
    isScrolled?: boolean;
}

export default function Header({ onOpenSearch, onOpenMessages, onOpenNotifications, isScrolled = false }: HeaderProps) {
    const insets = useSafeAreaInsets();
    const { selectedProvince, isLoading } = useLocationContext();
    const { currentTheme } = useThemeContext();
    const [locationModalVisible, setLocationModalVisible] = useState(false);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    const { isAuthenticated } = useAuth();

    const locationLabel = selectedProvince.selectedWard
        ? `${selectedProvince.selectedWard}, ${selectedProvince.selectedDistrict}`
        : selectedProvince.selectedDistrict
            ? `${selectedProvince.selectedDistrict}, ${selectedProvince.name}`
            : selectedProvince.name;

    useEffect(() => {
        let isMounted = true;

        const loadUnreadIndicators = async () => {
            if (!isAuthenticated) {
                setUnreadMessagesCount(0);
                setUnreadNotificationsCount(0);
                return;
            }

            try {
                const [messages, notifications] = await Promise.all([
                    messagesApi.getMessages(),
                    messagesApi.getNotifications(),
                ]);

                if (isMounted) {
                    setUnreadMessagesCount(messages.filter((message) => !message.isRead).length);
                    setUnreadNotificationsCount(notifications.filter((notification) => !notification.isRead).length);
                }
            } catch {
                if (isMounted) {
                    setUnreadMessagesCount(0);
                    setUnreadNotificationsCount(0);
                }
            }
        };

        void loadUnreadIndicators();

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated]);

    return (
        <>
            <View style={[
                styles.container,
                { paddingTop: insets.top + 8 },
                isScrolled
                    ? [styles.scrolled, { backgroundColor: currentTheme.card }]
                    : [styles.notScrolled, { backgroundColor: currentTheme.background }],
            ]}>
                {!isScrolled && (
                    <View style={styles.topRow}>
                        <View style={styles.brandBlock}>
                            <Image
                                source={require('../../../../assets/images/stayhub-logo.png')}
                                style={{ width: 132, height: 50 }}
                                resizeMode="contain"
                            />
                            <Text style={[styles.subtitle, { color: currentTheme.textSecondary }]}>Khám phá khách sạn và ưu đãi tại</Text>

                            <Pressable
                                style={styles.locationRow}
                                onPress={() => setLocationModalVisible(true)}
                                hitSlop={8}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size={14} color={STAYHUB_COLOR} />
                                ) : (
                                    <MapPin size={20} color={STAYHUB_COLOR} strokeWidth={2.5} />
                                )}
                                <Text style={[styles.location, { color: STAYHUB_COLOR }]} numberOfLines={1}>
                                    {locationLabel}
                                </Text>
                                <ChevronDown size={16} color={STAYHUB_COLOR} />
                            </Pressable>
                        </View>
                        {isAuthenticated && (
                            <View style={styles.actions}>
                                <Pressable style={[styles.actionBtn, { backgroundColor: currentTheme.card }]} onPress={onOpenMessages}>
                                    <MessageCircle size={24} color={currentTheme.text} strokeWidth={1.5} />
                                    {unreadMessagesCount > 0 && (
                                        <View style={styles.countBadge}>
                                            <Text style={styles.countBadgeText}>{unreadMessagesCount}</Text>
                                        </View>
                                    )}
                                </Pressable>
                                <Pressable style={[styles.actionBtn, { backgroundColor: currentTheme.card }]} onPress={onOpenNotifications}>
                                    <Bell size={24} color={currentTheme.text} strokeWidth={1.5} />
                                    {unreadNotificationsCount > 0 && <View style={styles.badge} />}
                                </Pressable>
                            </View>
                        )}
                    </View>
                )}

                <View style={styles.searchRow}>
                    <Pressable
                        style={[styles.searchBar, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}
                        onPress={onOpenSearch}
                    >
                        <Search size={18} color={PRIMARY} />
                        <Text style={[styles.searchPlaceholder, { color: currentTheme.textSecondary }]}>Tên khách sạn, hoặc quận...</Text>
                    </Pressable>
                    {isScrolled && (
                        <View style={styles.actions}>
                            <Pressable style={[styles.actionBtnSmall, { backgroundColor: currentTheme.background }]} onPress={onOpenMessages}>
                                <MessageCircle size={20} color={currentTheme.textSecondary} strokeWidth={1.5} />
                                {unreadMessagesCount > 0 && (
                                    <View style={styles.countBadgeSmall}>
                                        <Text style={styles.countBadgeText}>{unreadMessagesCount}</Text>
                                    </View>
                                )}
                            </Pressable>
                            <Pressable style={[styles.actionBtnSmall, { backgroundColor: currentTheme.background }]} onPress={onOpenNotifications}>
                                <Bell size={20} color={currentTheme.textSecondary} strokeWidth={1.5} />
                                {unreadNotificationsCount > 0 && <View style={styles.badgeSmall} />}
                            </Pressable>
                        </View>
                    )}
                </View>
            </View>

            <LocationPickerModal
                visible={locationModalVisible}
                onClose={() => setLocationModalVisible(false)}
            />
        </>
    );
}
