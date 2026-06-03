import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal, StyleSheet } from 'react-native';
import { ChevronLeft, Clock, ChevronRight, CheckCircle, Tag } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { styles, PRIMARY, PRIMARY_FILL, SURFACE, PAGE_BG, BORDER } from '@/src/customer/styles/booking/bookingConfirm.styles';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import ImageWithFallback from '@/src/customer/components/common/ImageWithFallback';
import { PAYMENT_METHODS, PaymentMethodId } from '@/src/customer/utils/booking/bookingConfirm.utils';

interface BookingFormViewProps {
  goBack: () => void;
  isWebLayout: boolean;
  insets: { top: number; bottom: number };
  hotelName: string;
  roomName: string;
  hotelAddress: string;
  roomImage: string;
  durationLabel: string;
  checkIn: any;
  checkOut: any;
  customerPhone: string;
  customerEmail: string;
  customerName: string;
  paymentBreakdown: any;
  price: string;
  cancellationDeadline: string;
  showPaymentMethodSheet: boolean;
  setShowPaymentMethodSheet: (value: boolean) => void;
  selectedPaymentMethod: any;
  selectedPaymentMethodId: string | null;
  handleSelectPaymentMethod: (id: PaymentMethodId) => void;
  saving: boolean;
  paymentActionLabel: string;
  savingActionLabel: string;
  handlePaymentButtonPress: () => void;
  onRoomPress?: () => void;
}

export default function BookingFormView({
  goBack,
  isWebLayout,
  insets,
  hotelName,
  roomName,
  hotelAddress,
  roomImage,
  durationLabel,
  checkIn,
  checkOut,
  customerPhone,
  customerEmail,
  customerName,
  paymentBreakdown,
  price,
  cancellationDeadline,
  showPaymentMethodSheet,
  setShowPaymentMethodSheet,
  selectedPaymentMethod,
  selectedPaymentMethodId,
  handleSelectPaymentMethod,
  saving,
  paymentActionLabel,
  savingActionLabel,
  handlePaymentButtonPress,
  onRoomPress,
}: BookingFormViewProps) {
  const router = useRouter();
  const { currentTheme } = useThemeContext();
  const [roomPressed, setRoomPressed] = useState(false);

  return (
    <View
      style={[
        styles.container,
        isWebLayout && styles.webContainer,
        { paddingTop: isWebLayout ? 0 : insets.top, backgroundColor: isWebLayout ? PAGE_BG : SURFACE },
      ]}
    >
      <View style={[styles.header, isWebLayout && styles.webHeader]}>
        <Pressable onPress={goBack} style={styles.headerIconBtn}>
          <ChevronLeft size={24} color="#050506" strokeWidth={2.6} />
        </Pressable>
        <Text style={styles.headerTitle}>Xác nhận và thanh toán</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={isWebLayout}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 176 },
          isWebLayout && styles.webScrollContent,
        ]}
      >
        <View style={[styles.section, isWebLayout && styles.webSection]}>
          <Text style={styles.sectionTitle}>Lựa chọn của bạn</Text>
          <Pressable
            onPress={onRoomPress}
            onPressIn={() => setRoomPressed(true)}
            onPressOut={() => setRoomPressed(false)}
            style={[
              localStyles.choiceCard,
              isWebLayout && localStyles.webChoiceCard,
              roomPressed && localStyles.choiceCardPressed,
              !onRoomPress && localStyles.choiceCardNoPress,
            ]}
            disabled={!onRoomPress}
          >
            <View style={[styles.choiceRow, isWebLayout && styles.webChoiceRow]}>
              <ImageWithFallback uri={roomImage} alt={roomName} style={[styles.roomImage, isWebLayout && styles.webRoomImage]} />
              <View style={[styles.choiceInfo, { gap: 2 }]}>
                <Text style={styles.hotelName}>{hotelName}</Text>
                <Text style={styles.roomName}>{roomName}</Text>
                <Text style={styles.addressText}>{hotelAddress}</Text>
                {!!onRoomPress && (
                  <View style={localStyles.tapHint}>
                    <Text style={localStyles.tapHintText}>Nhấn để xem chi tiết</Text>
                    <ChevronRight size={12} color={PRIMARY} />
                  </View>
                )}
              </View>
            </View>
          </Pressable>

          <View style={styles.thinDivider} />

          <View style={[styles.timeRow, isWebLayout && styles.webTimeRow]}>
            <View style={[styles.durationCard, isWebLayout && styles.webDurationCard]}>
              <View style={styles.clockCircle}>
                <Clock size={26} color={PRIMARY} fill={SURFACE} />
              </View>
              <Text style={styles.durationText}>{durationLabel}</Text>
            </View>
            <View style={[styles.timeCard, isWebLayout && styles.webTimeCard]}>
              <Text style={styles.timeLabel}>Nhận phòng</Text>
              <Text style={styles.timeValue}>{checkIn.time}  •  {checkIn.dateText}</Text>
              <Text style={[styles.timeLabel, styles.checkoutLabel]}>Trả phòng</Text>
              <Text style={styles.timeValue}>{checkOut.time}  •  {checkOut.dateText}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.band, isWebLayout && styles.webBand]} />

        <View style={[styles.section, isWebLayout && styles.webSection]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Người đặt phòng</Text>
          </View>
          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Số điện thoại</Text>
            <Text style={styles.infoValue}>{customerPhone}</Text>
          </View>
          {!!customerEmail && (
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{customerEmail}</Text>
            </View>
          )}
          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Họ tên</Text>
            <Text style={styles.infoValue}>{customerName}</Text>
          </View>
        </View>

        <View style={[styles.band, isWebLayout && styles.webBand]} />

        <View style={[styles.section, isWebLayout && styles.webSection]}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
          <View style={[styles.paymentLine, styles.paymentLineTop]}>
            <Text style={styles.paymentLabel}>Giá {paymentBreakdown.durationLabel}</Text>
            <Text style={styles.paymentValue}>{paymentBreakdown.pricePerUnitText}</Text>
          </View>
          <View style={styles.paymentLine}>
            <Text style={styles.paymentLabel}>Số {paymentBreakdown.durationLabel}</Text>
            <Text style={styles.paymentValue}>{paymentBreakdown.duration}</Text>
          </View>
          {paymentBreakdown.isDaily && paymentBreakdown.days > 0 && (
            <View style={styles.paymentLine}>
              <Text style={styles.paymentLabel}>Số giờ sử dụng</Text>
              <Text style={styles.paymentValue}>0</Text>
            </View>
          )}
          <View style={[styles.paymentLine, styles.paymentLineSeparator]}>
            <Text style={styles.paymentLabel}>
              {paymentBreakdown.pricePerUnitText} × {paymentBreakdown.duration}
            </Text>
            <Text style={styles.paymentValue}>{paymentBreakdown.subtotalText}</Text>
          </View>
          <View style={styles.paymentLine}>
            <Text style={styles.totalTitle}>Tổng thanh toán</Text>
            <Text style={styles.totalTitle}>{price}</Text>
          </View>
        </View>

        <View style={[styles.band, isWebLayout && styles.webBand]} />

        <View style={[styles.section, isWebLayout && styles.webSection]}>
          <Text style={styles.sectionTitle}>Chính sách hủy phòng</Text>
          <Text style={styles.policyText}>
            Hủy miễn phí trước <Text style={styles.policyStrong}>{cancellationDeadline}</Text> đối với tất cả các phương thức thanh toán.
          </Text>
          <Text style={styles.policyText}>
            💡 Gợi ý nhỏ: Hãy lựa chọn phương thức thanh toán để xem chi tiết chính sách nhé.
          </Text>
          <Text style={styles.policyText}>
            Tôi đồng ý với{' '}
            <Text
              style={styles.inlineLink}
              onPress={() => router.push('/customer/support/terms' as any)}
            >
              Điều khoản và Chính sách
            </Text>{' '}
            đặt phòng.
          </Text>
          <Text style={styles.policyText}>
            Dịch vụ hỗ trợ khách hàng -{' '}
            <Text
              style={styles.inlineLink}
              onPress={() => router.push('/customer/support/contact' as any)}
            >
              Liên hệ ngay
            </Text>
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          isWebLayout && styles.webBottomBar,
          { paddingBottom: insets.bottom + 10 },
        ]}
      >
        <Pressable style={styles.paymentMethodRow} onPress={() => setShowPaymentMethodSheet(true)}>
          <View style={styles.rowLabelWrap}>
            <View style={styles.paymentMethodTextBlock}>
              <Text style={styles.paymentMethodText}>
                {selectedPaymentMethod?.title || 'Chọn phương thức thanh toán'}
              </Text>
              {!!selectedPaymentMethod && (
                <Text style={styles.paymentMethodSubText}>Bấm để đổi phương thức</Text>
              )}
            </View>
          </View>
          <ChevronRight size={24} color={PRIMARY} strokeWidth={2.6} />
        </Pressable>
        <View style={styles.bottomDivider} />
        <View style={styles.bottomSummaryRow}>
          <View>
            <Text style={styles.bottomLabel}>Tổng thanh toán</Text>
            <Text style={styles.bottomPrice}>{price}</Text>
          </View>
          <Pressable style={[styles.bookButton, saving && styles.bookButtonDisabled]} onPress={handlePaymentButtonPress} disabled={saving}>
            <Text style={styles.bookButtonText}>
              {saving ? savingActionLabel : paymentActionLabel}
            </Text>
          </Pressable>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={showPaymentMethodSheet}
        onRequestClose={() => setShowPaymentMethodSheet(false)}
      >
        <Pressable style={styles.methodOverlay} onPress={() => setShowPaymentMethodSheet(false)}>
          <Pressable style={[styles.methodSheet, isWebLayout && styles.webMethodSheet]} onPress={(event) => event.stopPropagation()}>
            <View style={styles.methodSheetHeader}>
              <View>
                <Text style={styles.methodSheetTitle}>Phương thức thanh toán</Text>
                <Text style={styles.methodSheetSubtitle}>Chọn một phương thức để tiếp tục</Text>
              </View>
              <Pressable style={styles.methodCloseBtn} onPress={() => setShowPaymentMethodSheet(false)}>
                <Text style={styles.methodCloseText}>Đóng</Text>
              </Pressable>
            </View>

            <View style={styles.methodList}>
              {PAYMENT_METHODS.map(({ Icon, available, description, id, title }: any) => {
                const selected = selectedPaymentMethodId === id;
                return (
                  <Pressable
                    key={id}
                    style={[
                      styles.methodOption,
                      selected && styles.methodOptionSelected,
                      !available && styles.methodOptionDisabled,
                    ]}
                    onPress={() => handleSelectPaymentMethod(id)}
                    disabled={!available}
                  >
                    <View style={[styles.methodIconWrap, selected && styles.methodIconWrapSelected]}>
                      <Icon size={22} color={selected ? SURFACE : PRIMARY} />
                    </View>
                    <View style={styles.methodInfo}>
                      <View style={styles.methodTitleRow}>
                        <Text style={[styles.methodTitle, !available && styles.methodTextDisabled]}>{title}</Text>
                        {!available && <Text style={styles.methodBadge}>Sắp có</Text>}
                      </View>
                      <Text style={[styles.methodDescription, !available && styles.methodTextDisabled]}>{description}</Text>
                    </View>
                    {selected && <CheckCircle size={22} color={PRIMARY} />}
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={[styles.methodContinueBtn, !selectedPaymentMethodId && styles.methodContinueBtnDisabled]}
              onPress={() => {
                if (!selectedPaymentMethodId) return;
                setShowPaymentMethodSheet(false);
              }}
              disabled={!selectedPaymentMethodId}
            >
              <Text style={styles.methodContinueText}>Tiếp tục</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const localStyles = StyleSheet.create({
  choiceCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    padding: 12,
    backgroundColor: '#fafafa',
  },
  webChoiceCard: {
    borderRadius: 16,
    padding: 14,
  },
  choiceCardPressed: {
    backgroundColor: 'rgba(133,194,164,0.08)',
    borderColor: 'rgba(133,194,164,0.5)',
  },
  choiceCardNoPress: {
    borderWidth: 0,
    padding: 0,
    backgroundColor: 'transparent',
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 6,
  },
  tapHintText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: '700',
  },
});
