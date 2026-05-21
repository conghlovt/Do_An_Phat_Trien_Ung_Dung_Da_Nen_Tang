import { StyleSheet } from 'react-native';

export const STAYHUB_COLOR = '#85c2a4';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
  },
  currentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  currentLocationText: {
    fontSize: 14,
    fontWeight: '600',
    color: STAYHUB_COLOR,
  },
  nearMeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: STAYHUB_COLOR,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
  },
  nearMeBtnLoading: {
    opacity: 0.7,
  },
  nearMeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    gap: 8,
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0,
  },

  columns: {
    flex: 1,
    flexDirection: 'row',
  },
  provinceList: {
    width: 130,
    backgroundColor: '#fafafa',
  },
  divider: {
    width: 1,
    backgroundColor: '#f3f4f6',
  },
  districtList: {
    flex: 1,
    backgroundColor: '#fff',
  },

  provinceItem: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    position: 'relative',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3f4f6',
  },
  provinceItemActive: {
    backgroundColor: '#fff',
  },
  provinceText: {
    fontSize: 13.5,
    color: '#6b7280',
    fontWeight: '500',
    lineHeight: 18,
  },
  provinceTextActive: {
    color: STAYHUB_COLOR,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
    backgroundColor: STAYHUB_COLOR,
  },

  districtItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f9fafb',
  },
  districtAll: {
    fontSize: 13.5,
    fontWeight: '700',
    color: STAYHUB_COLOR,
  },
  districtText: {
    fontSize: 13.5,
    color: '#374151',
    fontWeight: '400',
    flex: 1,
  },
  districtCount: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  countWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  wardList: {
    backgroundColor: '#fafafa',
    paddingLeft: 14,
  },
  wardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3f4f6',
  },
  wardAll: {
    fontSize: 13,
    color: STAYHUB_COLOR,
    fontWeight: '700',
    flex: 1,
  },
  wardText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '400',
    flex: 1,
  },
  noDistricts: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  noDistrictsText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
