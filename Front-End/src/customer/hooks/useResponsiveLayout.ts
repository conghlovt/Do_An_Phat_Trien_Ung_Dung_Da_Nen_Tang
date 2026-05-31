import { useMemo } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

const WEB_BREAKPOINT = 768;

export function useResponsiveLayout(breakpoint = WEB_BREAKPOINT) {
  const { height, width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isWebLayout = isWeb && width >= breakpoint;

  return useMemo(
    () => ({
      height,
      isMobileLayout: !isWebLayout,
      isWeb,
      isWebLayout,
      width,
    }),
    [height, isWeb, isWebLayout, width],
  );
}
