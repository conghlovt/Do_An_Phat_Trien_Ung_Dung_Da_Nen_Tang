import React, { memo, type ComponentType, type ReactNode, useMemo } from 'react';
import { Platform, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { SUPPORT_ACCENT, supportStyles as styles } from './support.styles';

type SupportIcon = ComponentType<{
  color?: string;
  size?: number;
}>;

type SupportCardProps = {
  actionLabel?: string;
  centered?: boolean;
  children?: ReactNode;
  icon?: SupportIcon;
  onAction?: () => void;
  subtitle?: string;
  title?: string;
};

function SupportCardComponent({
  actionLabel,
  centered = false,
  children,
  icon: Icon,
  onAction,
  subtitle,
  title,
}: SupportCardProps) {
  const { currentTheme } = useThemeContext();
  const { width } = useWindowDimensions();
  const isWebLayout = Platform.OS === 'web' && width >= 768;
  const hasAction = useMemo(() => Boolean(actionLabel && onAction), [actionLabel, onAction]);
  const hasMainContent = useMemo(() => Boolean(title || subtitle || Icon), [Icon, subtitle, title]);

  return (
    <View
      style={[
        styles.card,
        isWebLayout && styles.webCard,
        hasAction && styles.actionCard,
        hasAction && isWebLayout && styles.webActionCard,
        centered && styles.centeredCard,
        { backgroundColor: currentTheme.card, borderColor: currentTheme.border },
      ]}
    >
      {hasMainContent ? (
        <View style={styles.iconAndText}>
          {Icon ? (
            <View style={[styles.iconCircle, isWebLayout && styles.webIconCircle, { backgroundColor: currentTheme.decor }]}>
              <Icon size={24} color={SUPPORT_ACCENT} />
            </View>
          ) : null}
          <View style={{ flex: 1 }}>
            {title ? <Text style={[styles.itemTitle, isWebLayout && styles.webItemTitle, { color: currentTheme.text }]}>{title}</Text> : null}
            {subtitle ? <Text style={[styles.itemSubtitle, isWebLayout && styles.webItemSubtitle, { color: currentTheme.textSecondary }]}>{subtitle}</Text> : null}
          </View>
        </View>
      ) : null}

      {hasAction ? (
        <Pressable style={[styles.actionBtn, isWebLayout && styles.webActionBtn]} onPress={onAction}>
          <Text style={styles.actionBtnText}>{actionLabel}</Text>
        </Pressable>
      ) : null}

      {children ? <View style={hasMainContent ? styles.childContent : undefined}>{children}</View> : null}
    </View>
  );
}

export const SupportCard = memo(SupportCardComponent);
