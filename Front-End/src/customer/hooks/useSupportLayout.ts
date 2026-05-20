import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supportStyles as styles } from '@/src/customer/components/support/support.styles';
import { useCustomerBack } from '@/src/customer/navigation/useCustomerBack';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { useResponsiveLayout } from './useResponsiveLayout';

export function useSupportLayout(backTo: string) {
  const goBack = useCustomerBack(backTo);
  const insets = useSafeAreaInsets();
  const { currentTheme } = useThemeContext();
  const { isWebLayout } = useResponsiveLayout();

  const containerStyle = useMemo(
    () => [
      styles.container,
      isWebLayout && styles.webContainer,
      { backgroundColor: currentTheme.background },
    ],
    [currentTheme.background, isWebLayout],
  );

  const headerStyle = useMemo(
    () => [
      styles.header,
      isWebLayout && styles.webHeader,
      {
        backgroundColor: currentTheme.card,
        paddingTop: isWebLayout ? 18 : insets.top + 12,
      },
    ],
    [currentTheme.card, insets.top, isWebLayout],
  );

  const contentContainerStyle = useMemo(
    () => [
      styles.contentInner,
      isWebLayout && styles.webContent,
    ],
    [isWebLayout],
  );

  return {
    contentContainerStyle,
    currentTheme,
    goBack,
    headerStyle,
    isWebLayout,
    containerStyle,
  };
}
