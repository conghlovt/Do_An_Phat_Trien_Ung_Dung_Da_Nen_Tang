import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { TicketPercent } from 'lucide-react-native';
import { useThemeContext } from '@/src/customer/utils/ThemeContext';
import ImageWithFallback from '../figma/ImageWithFallback';

export default function Banners() {
  const { currentTheme, isDarkMode } = useThemeContext();

  return (
    <View style={styles.container}>
      {/* Coupon Banner */}
      <View style={[styles.coupon, { 
        borderColor: currentTheme.border, 
        backgroundColor: isDarkMode ? 'rgba(133,194,164,0.15)' : 'rgba(133,194,164,0.1)'
      }]}>
        <View style={[styles.couponIconWrap, { backgroundColor: currentTheme.card }]}>
          <TicketPercent size={20} color="#85c2a4" />
        </View>
        <Text style={[styles.couponText, { color: currentTheme.text }]}>Coupon giảm giá đang chờ bạn nhận.</Text>
        <Pressable style={styles.couponBtn}>
          <Text style={styles.couponBtnText}>Nhận ngay</Text>
        </Pressable>
      </View>

      {/* Campaign Banner */}
      <Pressable style={styles.campaign}>
        <ImageWithFallback
          uri="https://images.unsplash.com/photo-1762325393954-5300a6e35f5b?q=80&w=1080"
          style={styles.campaignImg}
          alt="Campaign Banner"
        />
        <View style={styles.campaignOverlay}>
          <Text style={styles.campaignEye}>APPONLY</Text>
          <Text style={styles.campaignBig}>GO WITH JOY</Text>
          <Text style={styles.campaignSub}>DAILY UP TO 50K</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  coupon: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1,
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03,
    shadowRadius: 2, elevation: 1,
  },
  couponIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05,
    shadowRadius: 2, elevation: 1,
  },
  couponText: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 18 },
  couponBtn: {
    backgroundColor: '#85c2a4', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12,
  },
  couponBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  campaign: { borderRadius: 16, overflow: 'hidden', height: 130, position: 'relative' },
  campaignImg: { width: '100%', height: '100%' },
  campaignOverlay: {
    position: 'absolute', inset: 0, padding: 20, justifyContent: 'center',
    backgroundColor: 'rgba(6,182,212,0.75)',
  },
  campaignEye: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 2 },
  campaignBig: { color: '#fde047', fontSize: 28, fontWeight: '900', fontStyle: 'italic', lineHeight: 32 },
  campaignSub: { color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 4 },
});
