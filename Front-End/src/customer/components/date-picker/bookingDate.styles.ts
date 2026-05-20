import { StyleSheet } from 'react-native';
import { BOOKING_DATE_COLORS } from './bookingDate.constants';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(35,65,52,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  panel: {
    backgroundColor: '#fff',
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 18,
    overflow: 'hidden',
  },
  panelWeb: {
    width: '74%',
    maxWidth: 950,
    minWidth: 760,
  },
  panelMobile: {
    width: '100%',
    maxHeight: '86%',
    alignSelf: 'stretch',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    minHeight: 58,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    position: 'relative',
  },
  tabText: {
    color: '#4b5563',
    fontSize: 15,
    fontWeight: '700',
  },
  tabTextActive: {
    color: BOOKING_DATE_COLORS.accentDark,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 4,
    width: 44,
    borderRadius: 3,
    backgroundColor: BOOKING_DATE_COLORS.accent,
  },
  content: {
    padding: 22,
  },
  contentWeb: {
    flexDirection: 'row',
    paddingHorizontal: 34,
    paddingVertical: 22,
  },
  calendarColumn: {
    minWidth: 0,
  },
  calendarColumnWeb: {
    width: 490,
    paddingRight: 34,
    borderRightWidth: 1,
    borderRightColor: '#f2f2f2',
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  monthTitle: {
    color: BOOKING_DATE_COLORS.text,
    fontSize: 24,
    fontWeight: '800',
  },
  monthActions: {
    flexDirection: 'row',
    gap: 20,
  },
  navButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekday: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    color: BOOKING_DATE_COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    backgroundColor: BOOKING_DATE_COLORS.accentSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(133,194,164,0.35)',
  },
  dayText: {
    color: '#5f6368',
    fontSize: 17,
    fontWeight: '600',
  },
  dayTextOutside: {
    color: '#c0c4ca',
    fontWeight: '500',
  },
  dayTextPast: {
    color: '#c0c4ca',
    fontWeight: '500',
  },
  dayTextToday: {
    color: BOOKING_DATE_COLORS.accentDark,
  },
  dayTextSelected: {
    color: BOOKING_DATE_COLORS.accentDark,
    fontWeight: '800',
  },
  optionsColumn: {
    paddingTop: 18,
  },
  optionsColumnWeb: {
    flex: 1,
    paddingTop: 0,
    paddingLeft: 28,
  },
  optionSection: {
    minWidth: 0,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_DATE_COLORS.border,
    marginBottom: 28,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(133,194,164,0.12)',
  },
  sectionTitle: {
    color: BOOKING_DATE_COLORS.text,
    fontSize: 24,
    fontWeight: '800',
  },
  chipsRow: {
    gap: 10,
    paddingRight: 36,
    minWidth: '100%',
  },
  chipsScroller: {
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
  },
  chip: {
    minWidth: 100,
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  chipSelected: {
    backgroundColor: BOOKING_DATE_COLORS.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(133,194,164,0.45)',
  },
  chipDisabled: {
    opacity: 0.42,
  },
  chipText: {
    color: BOOKING_DATE_COLORS.muted,
    fontSize: 18,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: BOOKING_DATE_COLORS.accentDark,
  },
  chipTextDisabled: {
    color: '#b8bec8',
  },
  checkoutRow: {
    gap: 8,
  },
  checkoutRowWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_DATE_COLORS.border,
    paddingBottom: 28,
  },
  checkoutText: {
    color: '#5f6368',
    fontSize: 22,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 26,
    paddingVertical: 22,
    borderTopWidth: 1,
    borderTopColor: BOOKING_DATE_COLORS.border,
  },
  resetButton: {
    borderWidth: 1,
    borderColor: BOOKING_DATE_COLORS.accent,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  resetButtonText: {
    color: BOOKING_DATE_COLORS.accentDark,
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: BOOKING_DATE_COLORS.accent,
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
