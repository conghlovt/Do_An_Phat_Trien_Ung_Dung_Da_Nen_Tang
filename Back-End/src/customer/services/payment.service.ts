import prisma from "../../login/lib/prisma";
import { AppError } from "../../shared/utils/app-error.util";

type PaymentBankAccount = {
  bankCode: string;
  bankName?: string | null;
  accountNumber: string;
  accountName: string;
  template: string;
};

type SepayWebhookPayload = {
  id: number | null;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  subAccount: string | null;
  code: string | null;
  content: string;
  transferType: string;
  description: string;
  transferAmount: number;
  accumulated: number | null;
  referenceCode: string;
};

const DEFAULT_BANK_CODE = "Vietcombank";
const DEFAULT_ACCOUNT_NUMBER = "0000000001";
const DEFAULT_ACCOUNT_NAME = "CONG TY STAYHUB (ADMIN)";
const DEFAULT_TEMPLATE = "";
const BOOKING_CODE_PATTERN = /\bBK\d{12}\b/i;
const PAYMENT_CODE_PATTERN = /\bPM\d{14}\b/i;
const FINAL_PAYMENT_STATUSES = ["EXPIRED_FINAL", "PAYMENT_NOT_RECORDED"];

const normalizeAccountNumber = (value: unknown) =>
  String(value ?? "").replace(/\s+/g, "");

const toText = (value: unknown) => String(value ?? "").trim();

const toNullableText = (value: unknown) => {
  const text = toText(value);
  return text ? text : null;
};

const toNumber = (value: unknown) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const toNullableNumber = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
};

const getEnv = (name: string, fallback: string) => {
  const value = process.env[name]?.trim();
  return value || fallback;
};

export const buildVietQrQuickLink = (params: {
  bankCode: string;
  accountNumber: string;
  template: string;
  amount: number;
  content: string;
  accountName: string;
}) => {
  const search = new URLSearchParams({
    bank: params.bankCode,
    acc: params.accountNumber,
    template: params.template,
    amount: String(Math.max(0, Math.round(Number(params.amount) || 0))),
  });

  if (params.content) {
    search.set("des", params.content);
  }

  return `https://qr.sepay.vn/img?${search.toString()}`;
};

export const getHotelPaymentAccount = async (
  hotelId: string,
  client: any = prisma,
): Promise<PaymentBankAccount> => {
  console.log(
    "[getHotelPaymentAccount] Using StayHub admin account for hotel:",
    hotelId,
  );

  const hotel = await client.hotel.findUnique({
    where: { id: hotelId },
    select: { name: true },
  });

  if (!hotel) {
    console.error("[getHotelPaymentAccount] Hotel not found:", hotelId);
    throw new AppError(404, "RESOURCE_NOT_FOUND", {
      userMessage: "Không tìm thấy khách sạn để lấy tài khoản thanh toán.",
    });
  }

  const defaultAccount = {
    bankCode: getEnv(
      "STAYHUB_BANK_CODE",
      getEnv("VIETQR_BANK_CODE", DEFAULT_BANK_CODE),
    ),
    bankName: process.env.STAYHUB_BANK_NAME?.trim() || DEFAULT_BANK_CODE,
    accountNumber: getEnv(
      "STAYHUB_BANK_ACCOUNT_NUMBER",
      getEnv("VIETQR_ACCOUNT_NUMBER", DEFAULT_ACCOUNT_NUMBER),
    ),
    accountName: getEnv(
      "STAYHUB_BANK_ACCOUNT_NAME",
      getEnv("VIETQR_ACCOUNT_NAME", DEFAULT_ACCOUNT_NAME),
    ),
    template: getEnv("STAYHUB_SEPAY_TEMPLATE", getEnv("VIETQR_TEMPLATE", DEFAULT_TEMPLATE)),
  };

  console.log("[getHotelPaymentAccount] StayHub admin account selected:", {
    bankCode: defaultAccount.bankCode,
    accountNumber: defaultAccount.accountNumber?.slice(-4),
  });

  return defaultAccount;
};

const normalizeSepayPayload = (body: any): SepayWebhookPayload => ({
  id: toNullableNumber(body?.id),
  gateway: toText(body?.gateway),
  transactionDate: toText(body?.transactionDate),
  accountNumber: normalizeAccountNumber(body?.accountNumber),
  subAccount: toNullableText(body?.subAccount),
  code: toNullableText(body?.code),
  content: toText(body?.content),
  transferType: toText(body?.transferType).toLowerCase(),
  description: toText(body?.description),
  transferAmount: toNumber(body?.transferAmount),
  accumulated:
    body?.accumulated === null || body?.accumulated === undefined
      ? null
      : toNumber(body.accumulated),
  referenceCode: toText(body?.referenceCode),
});

const extractBookingCode = (payload: SepayWebhookPayload) => {
  const haystack = [payload.content, payload.code, payload.description]
    .filter(Boolean)
    .join(" ");
  const match = haystack.match(BOOKING_CODE_PATTERN);
  return match?.[0]?.toUpperCase() || null;
};

const extractPaymentCode = (payload: SepayWebhookPayload) => {
  const haystack = [payload.content, payload.code, payload.description]
    .filter(Boolean)
    .join(" ");
  const match = haystack.match(PAYMENT_CODE_PATTERN);
  return match?.[0]?.toUpperCase() || null;
};

const getPayloadSearchText = (payload: SepayWebhookPayload) =>
  [payload.content, payload.code, payload.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const getMatchedPayment = async (
  client: any,
  bookingCode: string,
  payload: SepayWebhookPayload,
) => {
  const paymentCode = extractPaymentCode(payload);

  if (paymentCode) {
    const payment = await client.payment.findUnique({
      where: { paymentCode },
      include: { booking: true },
    });
    if (payment) return payment;
  }

  const payments = await client.payment.findMany({
    where: {
      booking: { bookingCode },
    },
    include: { booking: true },
    orderBy: [{ attemptNo: "desc" }, { createdAt: "desc" }],
  });

  const haystack = getPayloadSearchText(payload);
  return (
    payments.find((payment: any) =>
      haystack.includes(String(payment.content).toLowerCase()),
    ) ||
    payments[0] ||
    null
  );
};

const createWebhookLog = async (
  client: any,
  payload: SepayWebhookPayload,
  rawPayload: unknown,
  processed: boolean,
  message: string,
  options: { eventType?: string; paymentId?: string | null } = {},
) => {
  await client.paymentWebhookLog.create({
    data: {
      provider: "sepay",
      paymentId: options.paymentId || null,
      eventType: options.eventType || null,
      referenceCode: payload.referenceCode || null,
      sepayTransactionId: payload.id,
      payload: rawPayload as any,
      processed,
      message,
    },
  });
};

const failPayment = async (
  client: any,
  payment: any,
  payload: SepayWebhookPayload,
  rawPayload: unknown,
  reason: string,
  message: string,
  eventType = reason,
) => {
  if (payment.status === "PENDING") {
    const data: any = {
      status: "PAYMENT_NOT_RECORDED",
      failureReason: reason,
      failureMessage: message,
      sepayPayload: rawPayload as any,
    };

    if (payload.referenceCode) {
      data.referenceCode = payload.referenceCode;
    }

    if (payload.id !== null) {
      data.sepayTransactionId = payload.id;
    }

    await client.payment.update({
      where: { id: payment.id },
      data,
    });
  }

  await createWebhookLog(client, payload, rawPayload, false, message, {
    eventType,
    paymentId: payment.id,
  });
};

const markLatePayment = async (
  client: any,
  payment: any,
  payload: SepayWebhookPayload,
  rawPayload: unknown,
  message = "Giao dịch đến sau thời gian tự động ghi nhận.",
) => {
  if (payment.status === "PENDING") {
    await client.payment.update({
      where: { id: payment.id },
      data: {
        status: "EXPIRED_FINAL",
        expiredAt: new Date(),
        failureReason: "LATE_PAYMENT",
        failureMessage: message,
        sepayPayload: rawPayload as any,
      },
    });
  }

  await createWebhookLog(client, payload, rawPayload, false, message, {
    eventType: "LATE_PAYMENT",
    paymentId: payment.id,
  });
};

const findDuplicatePayment = async (
  client: any,
  payload: SepayWebhookPayload,
) => {
  const orConditions: any[] = [];

  if (payload.referenceCode) {
    orConditions.push({ referenceCode: payload.referenceCode });
  }

  if (payload.id !== null && Number.isFinite(payload.id)) {
    orConditions.push({ sepayTransactionId: payload.id });
  }

  if (!orConditions.length) return null;

  return client.payment.findFirst({
    where: { OR: orConditions },
    include: { booking: true },
  });
};

export const handleSepayWebhook = async (body: unknown) => {
  const rawPayload = body && typeof body === "object" ? body : {};
  const payload = normalizeSepayPayload(rawPayload);

  await prisma.$transaction(async (tx) => {
    const duplicateLog = payload.referenceCode
      ? await tx.paymentWebhookLog.findFirst({
          where: { referenceCode: payload.referenceCode },
        })
      : null;
    if (duplicateLog) {
      return;
    }

    const duplicatePayment = await findDuplicatePayment(tx, payload);
    if (duplicatePayment?.status === "PAID") {
      await createWebhookLog(
        tx,
        payload,
        rawPayload,
        false,
        "Webhook đã được xử lý trước đó.",
      );
      return;
    }

    if (payload.transferType !== "in") {
      await createWebhookLog(
        tx,
        payload,
        rawPayload,
        false,
        "Bỏ qua giao dịch không phải tiền vào.",
      );
      return;
    }

    if (!payload.referenceCode) {
      await createWebhookLog(
        tx,
        payload,
        rawPayload,
        false,
        "Thiếu referenceCode.",
      );
      return;
    }

    const bookingCode = extractBookingCode(payload);
    const paymentCode = extractPaymentCode(payload);
    if (!bookingCode && !paymentCode) {
      await createWebhookLog(
        tx,
        payload,
        rawPayload,
        false,
        "Sai nội dung chuyển khoản: không tìm thấy bookingCode hoặc paymentCode.",
        {
          eventType: "INVALID_CONTENT",
        },
      );
      return;
    }

    const payment = bookingCode
      ? await getMatchedPayment(tx, bookingCode, payload)
      : await tx.payment.findUnique({
          where: { paymentCode: paymentCode! },
          include: { booking: true },
        });

    if (!payment) {
      await createWebhookLog(
        tx,
        payload,
        rawPayload,
        false,
        `Không tìm thấy booking/payment tương ứng cho ${bookingCode || paymentCode}.`,
        {
          eventType: "PAYMENT_NOT_FOUND",
        },
      );
      return;
    }

    if (
      bookingCode &&
      payment.booking?.bookingCode &&
      payment.booking.bookingCode !== bookingCode
    ) {
      await createWebhookLog(
        tx,
        payload,
        rawPayload,
        false,
        "Sai nội dung chuyển khoản: bookingCode không khớp với paymentCode.",
        {
          eventType: "INVALID_CONTENT",
          paymentId: payment.id,
        },
      );
      return;
    }

    if (payment.status === "PAID") {
      await createWebhookLog(
        tx,
        payload,
        rawPayload,
        false,
        `${bookingCode} đã thanh toán.`,
        {
          eventType: "DUPLICATE_PAYMENT",
          paymentId: payment.id,
        },
      );
      return;
    }

    if (
      ["CANCELLED", "FAILED", "PAYMENT_NOT_RECORDED"].includes(payment.status)
    ) {
      await createWebhookLog(
        tx,
        payload,
        rawPayload,
        false,
        "Payment đã hết hạn, đã bị hủy hoặc đã bị đánh dấu không ghi nhận.",
        {
          eventType: "PAYMENT_EXPIRED_OR_CANCELLED",
          paymentId: payment.id,
        },
      );
      return;
    }

    if (payload.transferAmount < payment.amount) {
      await failPayment(
        tx,
        payment,
        payload,
        rawPayload,
        "INVALID_AMOUNT",
        "Khách chuyển thiếu tiền so với số tiền cần thanh toán.",
      );
      return;
    }

    if (
      normalizeAccountNumber(payment.accountNumber) !== payload.accountNumber
    ) {
      await failPayment(
        tx,
        payment,
        payload,
        rawPayload,
        "INVALID_ACCOUNT",
        "Sai tài khoản nhận tiền.",
      );
      return;
    }

    if (
      FINAL_PAYMENT_STATUSES.includes(payment.status) ||
      new Date() > payment.graceExpiresAt
    ) {
      await markLatePayment(
        tx,
        payment,
        payload,
        rawPayload,
        `${bookingCode || payment.booking?.bookingCode || payment.paymentCode} nhận giao dịch sau thời gian tự động ghi nhận. Khách cần gửi khiếu nại để được hỗ trợ kiểm tra.`,
      );
      return;
    }

    if (duplicatePayment && duplicatePayment.id !== payment.id) {
      await createWebhookLog(
        tx,
        payload,
        rawPayload,
        false,
        "referenceCode hoặc id SePay đã gắn với payment khác.",
        {
          eventType: "DUPLICATE_REFERENCE",
          paymentId: payment.id,
        },
      );
      return;
    }

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        referenceCode: payload.referenceCode,
        sepayTransactionId: payload.id,
        sepayPayload: rawPayload as any,
        paidAt: new Date(),
      },
    });

    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { status: "CONFIRMED" },
    });

    await createWebhookLog(
      tx,
      payload,
      rawPayload,
      true,
      `${bookingCode} đã thanh toán hợp lệ.`,
      {
        eventType: "PAYMENT_CONFIRMED",
        paymentId: payment.id,
      },
    );
  });
};
