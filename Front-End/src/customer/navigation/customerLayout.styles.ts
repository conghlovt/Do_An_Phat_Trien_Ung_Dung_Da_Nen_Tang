import { Platform, StyleSheet } from 'react-native';

const PRIMARY_DARK = '#85c2a4';
const PRIMARY_SOFT = '#eef8f4';
const PRIMARY_ICON_BG = '#85c2a4';

export const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  appContainerLarge:
    Platform.OS === 'web'
      ? { width: '100%', height: '100%' }
      : {
          maxWidth: 480,
          maxHeight: '100%',
          borderRadius: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 10,
          marginVertical: 20,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.05)',
        },
  webSidebar: {
    position: 'fixed' as any,
    left: 0,
    top: 0,
    bottom: 0,
    borderRightWidth: 1,
    zIndex: 260,
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 0,
    shadowColor: '#0f172a',
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.03,
    shadowRadius: 18,
    elevation: 8,
    ...(Platform.OS === 'web'
      ? { height: '100vh' as any, overflow: 'visible' as any, transition: 'width 0.22s ease' }
      : {}),
  },
  webSidebarCollapsed: {
    paddingHorizontal: 10,
    paddingTop: 26,
  },
  webHeader: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 26,
    paddingHorizontal: 14,
  },
  webHeaderCollapsed: {
    justifyContent: 'center',
    marginBottom: 26,
    paddingHorizontal: 0,
  },
  webBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minWidth: 0,
  },
  webBrandRowCollapsed: {
    justifyContent: 'center',
  },
  webLogoIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#85c2a4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webBrandCopy: {
    minWidth: 0,
  },
  webBrandText: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0,
  },
  webBrandSub: {
    marginTop: 3,
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  webDivider: {
    height: 1,
    marginHorizontal: -16,
    marginBottom: 18,
  },
  webDividerCollapsed: {
    marginHorizontal: -10,
    marginBottom: 18,
  },
  webNavList: {
    flex: 1,
    gap: 14,
    paddingTop: 0,
  },
  webNavListCollapsed: {
    alignItems: 'center',
    gap: 14,
    paddingTop: 0,
  },
  webTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 65,
    borderRadius: 17,
    paddingHorizontal: 14,
    position: 'relative',
  },
  webTabItemCollapsed: {
    width: 62,
    minHeight: 62,
    justifyContent: 'center',
    paddingHorizontal: 0,
    borderRadius: 18,
  },
  webTabItemActive: {
    backgroundColor: PRIMARY_SOFT,
  },
  webActiveDot: {
    position: 'absolute',
    right: 14,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: PRIMARY_DARK,
  },
  webIconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webIconBoxActive: {
    backgroundColor: PRIMARY_ICON_BG,
  },
  webTabLabel: {
    flex: 1,
    marginLeft: 16,
    marginRight: 18,
    fontSize: 16,
    fontWeight: '800',
  },
  webSidebarActions: {
    marginBottom: 8,
  },
  webSidebarActionsCollapsed: {
    alignItems: 'center',
  },
  webLogoutItem: {
    minHeight: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  webLogoutItemCollapsed: {
    width: 62,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  webLogoutIconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webLogoutLabel: {
    marginLeft: 16,
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '800',
  },
  webToggleBtn: {
    position: 'absolute',
    right: -18,
    top: 92,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 280,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 6,
  },
  webToggleBtnCollapsed: {
    right: -17,
  },
  webAccountButton: {
    minHeight: 92,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 16,
    paddingBottom: 18,
    paddingTop: 18,
    marginHorizontal: -16,
  },
  webAccountButtonCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
    marginHorizontal: -10,
  },
  webAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#85c2a4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webAvatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  webAccountButtonText: {
    flex: 1,
    minWidth: 0,
  },
  webUserName: {
    fontSize: 16,
    fontWeight: '800',
  },
  webUserRole: {
    marginTop: 2,
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
});
