import { Dimensions, StyleSheet } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');
const PRIMARY = '#85c2a4';
const PRIMARY_DARK = '#599373';
const PRIMARY_LIGHT = '#e8f6ed';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  webContainer: {
    overflow: 'hidden',
  },
  loadingContainer: { flex: 1, backgroundColor: '#f3f4f6' },
  skeleton: { flex: 1, backgroundColor: '#e5e7eb' },
  scrollContent: { paddingBottom: 120 },
  webScroll: {
    flex: 1,
  },
  webScrollContent: {
    paddingBottom: 120,
    alignItems: 'center',
  },

  floatingHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  webFloatingHeader: {
    width: 'calc(100% - 64px)' as any,
    maxWidth: 1180,
    alignSelf: 'center',
    marginLeft: 'auto' as any,
    marginRight: 'auto' as any,
    borderRadius: 16,
    marginTop: 12,
    paddingHorizontal: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 6,
  },
  headerTitle: { flex: 1, alignItems: 'center' },
  headerTitleText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)' },
  iconRow: { flexDirection: 'row', gap: 4 },
  webHeaderSide: {
    width: 132,
    alignItems: 'flex-start',
  },
  webHeaderSideRight: {
    width: 132,
    justifyContent: 'flex-end',
  },

  // Gallery
  galleryContainer: { position: 'relative' },
  webGalleryContainer: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    marginTop: 52,
    borderRadius: 18,
    overflow: 'hidden',
  },
  galleryImage: { width: SCREEN_W, height: 240 },
  webGalleryImage: { height: 320 },
  imageCounter: {
    position: 'absolute', bottom: 72, right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  imageCounterText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  dots: {
    position: 'absolute', bottom: 56, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff', width: 16 },
  thumbnailRow: {
    flexDirection: 'row', height: 54, gap: 2,
    backgroundColor: '#000',
  },
  thumbnail: { flex: 1, height: 54 },
  thumbnailMore: {
    flex: 1, height: 54, backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  thumbnailMoreText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Info
  webContent: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingTop: 18,
    paddingHorizontal: 0,
  },
  infoCard: { padding: 16 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  ratingScore: { fontSize: 15, fontWeight: '700', color: '#111827' },
  ratingCount: { fontSize: 13, color: '#6b7280' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(133,194,164,0.18)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(133,194,164,0.35)',
    marginLeft: 'auto',
  },
  badgeText: { color: PRIMARY_DARK, fontSize: 12, fontWeight: '700' },
  hotelName: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  addressText: { fontSize: 13, color: '#6b7280', flex: 1, lineHeight: 20 },
  mapBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  mapBtnText: { color: PRIMARY, fontSize: 13, fontWeight: '600' },

  // Perks
  perksCard: { marginHorizontal: 16, marginBottom: 16, borderRadius: 14, borderWidth: 1, borderColor: '#f3f4f6', padding: 14, gap: 10 },
  webPerksCard: {
    marginHorizontal: 0,
  },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  perkIcon: { width: 28, alignItems: 'center' },
  perkText: { fontSize: 13, color: '#374151', flex: 1 },
  perkHighlight: { color: PRIMARY_DARK, fontWeight: '700' },

  // Sections
  section: { padding: 16 },
  sectionDivider: { padding: 16, borderTopWidth: 8, borderTopColor: '#f9fafb' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 12 },
  descText: { fontSize: 14, color: '#6b7280', lineHeight: 22 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  phoneText: { color: PRIMARY, fontSize: 14, fontWeight: '600' },

  // Rating
  ratingSummary: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bigScore: { fontSize: 48, fontWeight: '800', color: '#111827' },
  ratingLabel: { fontSize: 18, fontWeight: '700', color: '#111827' },
  ratingSubLabel: { fontSize: 13, color: '#6b7280' },
  reviewCard: {
    width: 220, backgroundColor: '#f9fafb', borderRadius: 14, padding: 14, marginRight: 10,
  },
  reviewCardFull: { backgroundColor: '#f9fafb', borderRadius: 14, padding: 14 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18 },
  reviewName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  reviewTag: { fontSize: 11, color: '#6b7280' },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewText: { fontSize: 13, color: '#374151', lineHeight: 20 },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12 },
  viewAllText: { color: PRIMARY, fontSize: 13, fontWeight: '600' },

  // Amenities
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityItem: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(133,194,164,0.1)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  amenityText: { fontSize: 13, color: '#374151' },

  // Hours
  hoursTable: { gap: 12 },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between' },
  hoursLabel: { fontSize: 14, color: '#374151' },
  hoursValue: { fontSize: 14, color: '#374151', fontWeight: '500' },

  // Chat
  chatPrompt: { fontSize: 14, color: '#374151', marginBottom: 12, lineHeight: 22 },
  chatBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: PRIMARY, borderRadius: 12,
    paddingVertical: 14, backgroundColor: PRIMARY,
  },
  chatBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Suggestions
  suggestRow: { flexDirection: 'row', gap: 12 },
  suggestCard: { flex: 1, borderRadius: 14, overflow: 'hidden', backgroundColor: '#f9fafb', borderWidth: 1, borderColor: 'rgba(133,194,164,0.25)' },
  suggestImage: { width: '100%', height: 120 },
  suggestName: { fontSize: 14, fontWeight: '700', color: '#111827', padding: 8, paddingBottom: 4 },
  suggestMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, marginBottom: 6 },
  suggestRating: { fontSize: 11, fontWeight: '700', color: '#374151' },
  suggestReviews: { fontSize: 10, color: '#6b7280' },
  suggestDiscount: {
    marginHorizontal: 8, marginBottom: 6, backgroundColor: 'rgba(133,194,164,0.16)',
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(133,194,164,0.32)',
  },
  suggestDiscountText: { fontSize: 10, color: PRIMARY_DARK, fontWeight: '700' },
  suggestPrice: { fontSize: 15, fontWeight: '700', color: PRIMARY_DARK, paddingHorizontal: 8, paddingBottom: 10 },
  suggestUnit: { fontSize: 11, color: '#6b7280', fontWeight: '400' },

  // Bottom Bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0',
    paddingTop: 12, paddingHorizontal: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 12,
  },
  webBottomBar: {
    paddingHorizontal: 32,
    paddingTop: 12,
  },
  bottomBarInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  webBottomBarInner: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
  },
  timeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: PRIMARY_LIGHT, borderRadius: 12, borderWidth: 2, borderColor: PRIMARY,
    paddingHorizontal: 12, paddingVertical: 10, flex: 1,
  },
  timeText: { fontSize: 12, color: '#0d5e3d', fontWeight: '600', flex: 1 },
  priceArea: { alignItems: 'flex-end', minWidth: 60 },
  oldPriceBottom: { fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through', fontWeight: '500' },
  priceBottom: { fontSize: 18, fontWeight: '800', color: PRIMARY_DARK },
  bookBtn: {
    backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20,
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
  bookBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Reviews Modal
  reviewsModal: { flex: 1, backgroundColor: '#fff' },
  reviewsModalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  reviewsModalTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
});
