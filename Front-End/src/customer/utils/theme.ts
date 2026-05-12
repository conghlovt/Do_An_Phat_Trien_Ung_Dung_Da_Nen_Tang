const theme = {
  light: {
    background: '#E8F6ED',
    card: '#FFFFFF',
    text: '#333333',
    textSecondary: '#111111',
    decor: '#FDF3E7',
    headerTitle: '#0A3B2A',
    bottomNav: '#FFFFFF',
    border: '#F0F0F0',
    iconInactive: '#757575',
    rightText: '#C48147',
    accent: '#85C2A4',
    buttonBg: '#E8F6ED',
  },
  dark: {
    background: '#121212',
    card: '#1E1E1E',
    text: '#E0E0E0',
    textSecondary: '#E0E0E0',
    decor: '#1A2A22',
    headerTitle: '#85C2A4',
    bottomNav: '#1E1E1E',
    border: '#333333',
    iconInactive: '#A0A0A0',
    rightText: '#E6A56C',
    accent: '#85C2A4',
    buttonBg: '#2A3A32',
  },
};

export type ThemeColors = typeof theme.light;
export default theme;
