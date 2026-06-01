import { StyleSheet } from 'react-native';

export const PRIMARY = '#85c2a4';
export const INK = '#07152f';
export const MUTED = '#8390ae';

export const styles = StyleSheet.create({
  // ─── Layout ────────────────────────────────────────────────────────────────
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  webScrollContent: {
    paddingHorizontal: 32,
    paddingTop: 28,
  },
  webContent: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
  },

  // ─── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    backgroundColor: PRIMARY,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  webHero: {
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingBottom: 28,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandText: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 15,
    fontWeight: '800',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 14,
  },
  heroIconButton: {
    width: 46,
    height: 46,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.48)',
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff5f70',
    borderWidth: 2,
    borderColor: '#ffffff',
  },

  // ─── Summary Cards ─────────────────────────────────────────────────────────
  summaryCards: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  webSummaryCards: {
    maxWidth: 720,
    gap: 15,
  },
  summaryCard: {
    flex: 1,
    minHeight: 82,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    shadowColor: '#315e4b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 5,
  },
  webSummaryCard: {
    minHeight: 104,
    maxWidth: 350,
    paddingHorizontal: 18,
    gap: 14,
  },
  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  summaryCopy: {
    flex: 1,
    minWidth: 0,
  },
  summaryLabel: {
    color: '#50647f',
    fontSize: 13,
    fontWeight: '700',
  },
  summaryValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  summaryValue: {
    color: INK,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
  },
  newBadge: {
    backgroundColor: '#ff5b18',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  newBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },

  // ─── Body ──────────────────────────────────────────────────────────────────
  body: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  webBody: {
    paddingHorizontal: 0,
  },

  // ─── Section Header ────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 22,
  },
  webSectionHeader: {
    marginTop: 6,
  },
  sectionIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flexShrink: 1,
    fontSize: 21,
    fontWeight: '900',
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusPill: {
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: '#ffe0c7',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  statusPillText: {
    color: '#ff5b18',
    fontSize: 13,
    fontWeight: '800',
  },

  // ─── Flash Deals ───────────────────────────────────────────────────────────
  flashList: {
    gap: 14,
    paddingBottom: 34,
    paddingRight: 20,              // ✅ FIX: thêm padding để card cuối không bị cắt
  },
  webFlashList: {
    width: '100%',
    paddingRight: 0,
  },
  flashCard: {
    width: 262,
    height: 206,
    borderRadius: 18,
    padding: 20,
    overflow: 'hidden',
  },
  webFlashCard: {
    flex: 1,
    width: 'auto',
    minHeight: 210,
  },
  flashBubble: {
    position: 'absolute',
    right: -32,
    bottom: -34,
    width: 122,
    height: 122,
    borderRadius: 30,
    opacity: 0.45,
  },
  flashBubbleSmall: {
    position: 'absolute',
    right: 20,
    bottom: 7,
    width: 66,
    height: 66,
    borderRadius: 18,
    opacity: 0.35,
  },
  flashLabel: {
    color: 'rgba(255,255,255,0.83)',
    fontSize: 14,
    fontWeight: '900',
  },
  flashTitle: {
    color: '#ffffff',
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '900',
    marginTop: 4,
  },
  flashSubtitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  flashButton: {
    marginTop: 'auto',
    height: 47,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },

  // ─── Customer Rewards ──────────────────────────────────────────────────────
  customerRewards: {
    gap: 14,
    marginBottom: 30,
  },
  webCustomerRewards: {
    flexDirection: 'row',
  },
  rewardCard: {
    minHeight: 96,
    borderRadius: 18,
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    overflow: 'hidden',
    shadowColor: '#17233d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  webRewardCard: {
    flex: 1,
  },
  rewardStripe: {
    position: 'absolute',
    left: 0,
    top: 14,
    bottom: 14,
    width: 5,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  rewardIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardCopy: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  rewardSubtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  rewardAction: {
    minWidth: 74,
    height: 44,
    borderRadius: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },

  // ─── Nearby Offers ─────────────────────────────────────────────────────────
  nearHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  changeLocationText: {
    color: '#65ad8d',
    fontSize: 14,
    fontWeight: '800',
  },
  nearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,                       // ✅ FIX: giảm gap để 2 cột vừa màn nhỏ
    marginBottom: 38,
  },
  webNearGrid: {
    gap: 18,
  },
  nearCard: {
    width: '47.5%',                // ✅ FIX: 47.5% an toàn hơn 47% + gap 16
    minHeight: 150,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    shadowColor: '#17233d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 2,
  },
  webNearCard: {
    flex: 1,
    width: 'auto',
    minWidth: 210,
  },
  nearIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  nearTitle: {
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  nearSubtitle: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  nearCollectBadge: {
    marginTop: 12,
    height: 34,
    borderRadius: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearCollectBadgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },

  // ─── Hotel Offers ──────────────────────────────────────────────────────────
  hotelList: {
    gap: 18,
    paddingBottom: 34,
    paddingRight: 20,              // ✅ FIX: padding để card cuối không bị cắt
  },
  webHotelList: {
    width: '100%',
    flexWrap: 'wrap',
    paddingRight: 0,
  },
  hotelCard: {
    width: 300,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#17233d',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  webHotelCard: {
    flex: 1,
    width: 'auto',
    minWidth: 280,
    maxWidth: 370,
  },
  hotelImageWrap: {
    height: 162,
    overflow: 'hidden',
  },
  hotelImage: {
    width: '100%',
    height: '100%',
  },
  hotelBadge: {
    position: 'absolute',
    left: 14,
    top: 14,
    borderRadius: 15,
    backgroundColor: 'rgba(35,42,40,0.72)',
    paddingHorizontal: 15,
    paddingVertical: 7,
  },
  hotelBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  hotelContent: {
    padding: 20,
  },
  hotelTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  hotelBenefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  hotelBenefit: {
    color: '#65ad8d',
    fontSize: 18,
    fontWeight: '900',
  },
  hotelOldPrice: {
    color: '#8f98ad',
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  hotelNote: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  hotelNoteText: {
    fontSize: 14,
    fontWeight: '500',
  },
  collectButtonMuted: {
    marginTop: 14,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#cfefe2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectButtonMutedText: {
    color: '#65ad8d',
    fontSize: 18,
    fontWeight: '900',
  },
  useNowButton: {
    marginTop: 14,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#34a370',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#34a370',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 4,
  },
  useNowButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
});
