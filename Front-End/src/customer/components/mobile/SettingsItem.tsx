import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ThemeToggle from './ThemeToggle';
import { ThemeColors } from '../../utils/theme';

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  rightText?: string;
  hasSwitch?: boolean;
  isLast?: boolean;
  onPress?: () => void;
  currentTheme: ThemeColors;
  isDarkMode?: boolean;
  setIsDarkMode?: (value: boolean) => void;
  titleColor?: string;
}

const SettingsItem = ({
  icon,
  title,
  rightText,
  hasSwitch,
  isLast,
  onPress,
  currentTheme,
  isDarkMode,
  setIsDarkMode,
  titleColor,
}: SettingsItemProps) => {
  const borderStyle = !isLast
    ? { borderBottomWidth: 1, borderBottomColor: currentTheme.border }
    : undefined;

  const content = (
    <>
      <View style={styles.itemLeft}>
        {icon}
        <Text style={[styles.itemTitle, { color: titleColor || currentTheme.textSecondary }]}>
          {title}
        </Text>
      </View>
      <View style={styles.itemRight}>
        {rightText && (
          <Text style={[styles.rightText, { color: currentTheme.rightText }]}>
            {rightText}
          </Text>
        )}
        {hasSwitch && isDarkMode !== undefined && setIsDarkMode && (
          <ThemeToggle
            isDarkMode={isDarkMode}
            onValueChange={() => setIsDarkMode(!isDarkMode)}
          />
        )}
      </View>
    </>
  );

  // When hasSwitch, render a non-pressable row so the ThemeToggle inside
  // can receive its own touch events without interference from a disabled parent.
  if (hasSwitch) {
    return (
      <View style={[styles.itemContainer, borderStyle]}>{content}</View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.itemContainer, borderStyle]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 15,
    marginLeft: 12,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightText: {
    fontSize: 14,
  },
});

export default SettingsItem;
