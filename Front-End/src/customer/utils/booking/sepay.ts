import type { BookingPaymentQr } from '@/src/customer/services/booking/bookings.api';

export const STAYHUB_SEPAY_RECEIVER = {
  bank: 'Vietcombank',
  bankName: 'Vietcombank',
  accountNumber: '0000000001',
  accountName: 'CONG TY STAYHUB (ADMIN)',
  template: '',
} as const;

type SepayQrParams = {
  amount: number;
  content?: string | null;
};

export function buildStayHubSepayQrUrl({ amount, content }: SepayQrParams) {
  const normalizedAmount = Math.max(0, Math.round(Number(amount) || 0));
  const params = new URLSearchParams({
    bank: STAYHUB_SEPAY_RECEIVER.bank,
    acc: STAYHUB_SEPAY_RECEIVER.accountNumber,
    template: STAYHUB_SEPAY_RECEIVER.template,
    amount: String(normalizedAmount),
  });

  if (content) {
    params.set('des', content);
  }

  return `https://qr.sepay.vn/img?${params.toString()}`;
}

export function getStayHubPaymentView(payment: BookingPaymentQr) {
  const transferContent = payment.content || payment.paymentCode || '';

  return {
    ...payment,
    content: transferContent,
    bankCode: STAYHUB_SEPAY_RECEIVER.bank,
    bankName: STAYHUB_SEPAY_RECEIVER.bankName,
    accountNumber: STAYHUB_SEPAY_RECEIVER.accountNumber,
    accountName: STAYHUB_SEPAY_RECEIVER.accountName,
    vietQrUrl: buildStayHubSepayQrUrl({
      amount: payment.amount,
      content: transferContent,
    }),
  };
}
