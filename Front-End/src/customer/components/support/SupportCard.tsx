import React, { memo, type ComponentType, type ReactNode, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { supportStyles as styles } from './support.styles';

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
  const hasAction = useMemo(() => Boolean(actionLabel && onAction), [actionLabel, onAction]);
  const hasMainContent = useMemo(() => Boolean(title || subtitle || Icon), [Icon, subtitle, title]);

  return (
    <View
      style={[
        styles.card,
        hasAction && styles.actionCard,
        centered && styles.centeredCard,
        { backgroundColor: currentTheme.card },
      ]}
    >
      {hasMainContent ? (
        <View style={styles.iconAndText}>
          {Icon ? (
            <View style={[styles.iconCircle, { backgroundColor: currentTheme.decor }]}>
              <Icon size={24} color={currentTheme.text} />
            </View>
          ) : null}
          <View style={{ flex: 1 }}>
            {title ? <Text style={[styles.itemTitle, { color: currentTheme.text }]}>{title}</Text> : null}
            {subtitle ? <Text style={[styles.itemSubtitle, { color: currentTheme.textSecondary }]}>{subtitle}</Text> : null}
          </View>
        </View>
      ) : null}

      {hasAction ? (
        <Pressable style={styles.actionBtn} onPress={onAction}>
          <Text style={styles.actionBtnText}>{actionLabel}</Text>
        </Pressable>
      ) : null}

      {children ? <View style={hasMainContent ? styles.childContent : undefined}>{children}</View> : null}
    </View>
  );
}

export const SupportCard = memo(SupportCardComponent);
