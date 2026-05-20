import { useMemo } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

const WEB_BREAKPOINT = 768;

export function useResponsiveLayout(breakpoint = WEB_BREAKPOINT) {
  const { height, width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  return useMemo(
    () => ({
      height,
      isMobileLayout: !isWeb || width < breakpoint,
      isWeb,
      isWebLayout: isWeb && width >= breakpoint,
      width,
    }),
    [breakpoint, height, isWeb, width],
  );
}
