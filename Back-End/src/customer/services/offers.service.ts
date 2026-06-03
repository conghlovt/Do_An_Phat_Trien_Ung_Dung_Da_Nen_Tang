import { type Voucher } from "@prisma/client";
import prisma from "../../login/lib/prisma";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "../../../../data");
const COLLECTED_FILE = path.join(DATA_DIR, "collected-vouchers.json");

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure collected file exists
if (!fs.existsSync(COLLECTED_FILE)) {
  fs.writeFileSync(COLLECTED_FILE, JSON.stringify({}));
}

interface CollectedVouchers {
  [userId: string]: string[]; // Array of collected voucher codes
}

interface FormattedOffer {
  id: string;
  iconKey: string;
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  gradient?: {
    colors: string[];
    start: { x: number; y: number };
    end: { x: number; y: number };
  };
  collectInfo: {
    code: string;
    name: string;
    discountLabel: string;
    accentColor: string;
    hotelName?: string;
  };
}

interface FormattedHotelOffer extends FormattedOffer {
  image: string;
  benefit: string;
  note: string;
}

const getCollectedData = (): CollectedVouchers => {
  try {
    const data = fs.readFileSync(COLLECTED_FILE, "utf-8");
    return JSON.parse(data) as CollectedVouchers;
  } catch (err) {
    return {};
  }
};

const saveCollectedData = (data: CollectedVouchers) => {
  fs.writeFileSync(COLLECTED_FILE, JSON.stringify(data, null, 2));
};

const isVoucherInDateRange = (voucher: Voucher) => {
  const constraints = (voucher.constraints || {}) as any;
  const now = Date.now();
  if (constraints.startDate && new Date(constraints.startDate).getTime() > now) {
    return false;
  }
  if (constraints.endDate && new Date(constraints.endDate).getTime() < now) {
    return false;
  }
  return true;
};

export class OffersService {
  /**
   * Get all active offers, grouped by category
   */
  async getGroupedOffers(userId?: string) {
    const customerVouchers = await prisma.voucher.findMany({
      where: {
        status: "ACTIVE",
        hotelId: null,
      },
      distinct: ["code"],
      include: {
        hotel: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
    const hotelVouchers = await prisma.voucher.findMany({
      where: {
        status: "ACTIVE",
        hotelId: { not: null },
      },
      distinct: ["code"],
      include: {
        hotel: {
          select: { id: true, name: true, slug: true },
        },
      },
      take: 12,
    });
    const vouchers = customerVouchers.filter(isVoucherInDateRange);
    const validHotelVouchers = hotelVouchers.filter(isVoucherInDateRange);

    const flashDeals: FormattedOffer[] = [];
    const customerRewards: FormattedOffer[] = [];
    const hotelOffers: FormattedHotelOffer[] = [];
    const nearbyOffers: FormattedOffer[] = [];

    // Custom formatting for frontend display
    const formatOffer = (v: any): FormattedOffer => {
      let iconKey = "tag";
      let title = v.name as string;
      let subtitle = "Ưu đãi dành cho bạn";
      let color = "#207e54";
      let bg = "#d7efe5";
      let gradient:
        | {
            colors: string[];
            start: { x: number; y: number };
            end: { x: number; y: number };
          }
        | undefined = undefined;
      let discountLabel = "";

      const actions = v.actions as any[];
      if (actions && actions.length > 0) {
        if (actions[0].type === "percent") {
          discountLabel = `Giảm ${actions[0].value}%`;
        } else if (actions[0].type === "fixed") {
          discountLabel = `Giảm ${actions[0].value / 1000}K`;
        }
      }

      // Infer details based on code
      const code = (v.code as string).toUpperCase();
      if (code.includes("FLASH")) {
        iconKey = "zap";
        color = "#FFA500";
        bg = "#fff8e8";
        subtitle = "Khuyến mãi giờ vàng";
        gradient = {
          colors: ["#FF8C00", "#FFD700"],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
        };
      } else if (
        code.includes("LOYAL") ||
        code.includes("VIP") ||
        code.includes("BIRTHDAY") ||
        code.includes("WELCOME") ||
        code.includes("NEWUSER") ||
        code.includes("MEMBER") ||
        code.includes("COMEBACK") ||
        code.includes("STAY") ||
        code.includes("WEEKEND") ||
        code.includes("EARLYBIRD") ||
        code.includes("LASTMINUTE") ||
        code.includes("HOURLY")
      ) {
        iconKey = "gift";
        color = "#5cae8c";
        bg = "#d7efe5";
        subtitle = "Ưu đãi khách sạn";
        gradient = {
          colors: ["#1e90ff", "#9d4edd"],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
        };
      } else if (code.includes("WEEKEND") || code.includes("COMEBACK")) {
        iconKey = "calendar";
        color = "#ff8d29";
        bg = "#fff4e5";
        gradient = {
          colors: ["#00d4ff", "#7b2cbf"],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
        };
      }

      return {
        id: v.id as string,
        iconKey,
        title,
        subtitle,
        color,
        bg,
        ...(gradient && { gradient }),
        collectInfo: {
          code: v.code as string,
          name: v.name as string,
          discountLabel,
          accentColor: color,
          hotelName: v.hotel?.name,
        },
      };
    };

    vouchers.forEach((v) => {
      const formatted = formatOffer(v);
      const code = v.code.toUpperCase();

      if (code.includes("FLASH")) {
        flashDeals.push(formatted);
      } else if (
        code.includes("LOYAL") ||
        code.includes("VIP") ||
        code.includes("BIRTHDAY") ||
        code.includes("WELCOME") ||
        code.includes("NEWUSER") ||
        code.includes("MEMBER") ||
        code.includes("COMEBACK") ||
        code.includes("STAY") ||
        code.includes("WEEKEND") ||
        code.includes("EARLYBIRD") ||
        code.includes("LASTMINUTE") ||
        code.includes("HOURLY")
      ) {
        customerRewards.push(formatted);
      } else {
        nearbyOffers.push(formatted);
      }
    });

    validHotelVouchers.forEach((v) => {
      const formatted = formatOffer(v);
      hotelOffers.push({
        ...formatted,
        image:
          "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=600",
        benefit: formatted.collectInfo.discountLabel,
        note: v.name,
      });
    });

    // If nearbyOffers is empty, fallback some offers for UI balance
    if (nearbyOffers.length === 0) {
      const rest = vouchers.filter((v) => {
        const code = v.code.toUpperCase();
        return (
          !code.includes("FLASH") &&
          !code.includes("LOYAL") &&
          !code.includes("VIP") &&
          !code.includes("BIRTHDAY") &&
          !code.includes("WELCOME") &&
          !code.includes("NEWUSER") &&
          !code.includes("MEMBER") &&
          !code.includes("COMEBACK") &&
          !code.includes("STAY") &&
          !code.includes("WEEKEND") &&
          !code.includes("EARLYBIRD") &&
          !code.includes("LASTMINUTE") &&
          !code.includes("HOURLY") &&
          !v.hotelId
        );
      });
      if (rest.length === 0 && vouchers.length > 0) {
        const fallback = vouchers.slice(0, 3).map(formatOffer);
        nearbyOffers.push(...fallback);
      }
    }

    return {
      flashDeals,
      customerRewards,
      nearbyOffers,
      hotelOffers,
    };
  }

  /**
   * Collect a voucher for a user
   */
  async collectOffer(userId: string, offerId: string) {
    console.log(
      `🔵 collectOffer called - userId: ${userId}, offerId: ${offerId}`,
    );

    const voucher = await prisma.voucher.findUnique({
      where: { id: offerId },
    });

    if (!voucher || voucher.hotelId || voucher.status !== "ACTIVE" || !isVoucherInDateRange(voucher)) {
      throw new Error("Offer not found or not collectable");
    }

    const data = getCollectedData();
    console.log(`📄 Current collected data:`, data);

    if (!data[userId]) {
      data[userId] = [];
    }

    if (!data[userId].includes(voucher.code)) {
      data[userId].push(voucher.code);
      saveCollectedData(data);
      console.log(`✅ Saved - userId: ${userId}, codes:`, data[userId]);
    } else {
      console.log(
        `⚠️ Already collected - userId: ${userId}, code: ${voucher.code}`,
      );
    }

    return { success: true, message: "Đã thu thập thành công" };
  }

  /**
   * Get collected vouchers for a user (wallet)
   */
  async getWalletVouchers(userId: string) {
    console.log(`🟢 getWalletVouchers called - userId: ${userId}`);

    const data = getCollectedData();
    console.log(`📄 All collected data:`, data);

    const collectedCodes = data[userId] || [];
    console.log(`🔍 Collected codes for user ${userId}:`, collectedCodes);

    if (collectedCodes.length === 0) {
      return {
        vouchers: [],
        voucherCount: 0,
      };
    }

    const vouchers = await prisma.voucher.findMany({
      where: {
        code: {
          in: collectedCodes,
        },
        status: "ACTIVE",
        hotelId: null,
      },
      distinct: ["code"],
      include: {
        hotel: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    const walletVouchers = vouchers.filter(isVoucherInDateRange).map((v) => {
      const actions = v.actions as any[];
      let discountType = "percent";
      let discountValue = 0;
      let maxDiscount: number | null = null;

      if (actions && actions.length > 0) {
        discountType = actions[0].type;
        discountValue = actions[0].value;
        maxDiscount = actions[0].max || null;
      }

      const rules = v.rules as any[];
      let minOrderValue: number | null = null;
      if (rules) {
        const minOrderRule = rules.find((r) => r.type === "minOrder");
        if (minOrderRule) {
          minOrderValue = minOrderRule.value;
        }
      }

      const constraints = v.constraints as any;
      let startDate: string | null = null;
      let endDate: string | null = null;
      if (constraints) {
        startDate = constraints.startDate || null;
        endDate = constraints.endDate || null;
      }

      const discountText =
        discountType === "percent"
          ? `Giảm ${discountValue}%`
          : `Giảm ${discountValue / 1000}K`;
      const minOrderText = minOrderValue
        ? `Đơn tối thiểu ${minOrderValue / 1000}K`
        : undefined;

      return {
        id: v.id,
        code: v.code,
        name: v.name,
        discountType,
        discountValue,
        minOrderValue,
        maxDiscount,
        startDate,
        endDate,
        isUsable: true,
        hotel: v.hotel,
        display: {
          title: discountText,
          subtitle: minOrderText,
          expiryText: endDate
            ? `HSD: ${new Date(endDate).toLocaleDateString("vi-VN")}`
            : "Không giới hạn thời gian",
          discountText: v.name,
          minOrderText: minOrderText,
          badgeText: v.hotel ? "Khách sạn" : "Hệ thống",
          iconKey: v.code.includes("FLASH") ? "zap" : "ticket",
          gradient: v.code.includes("FLASH")
            ? {
                colors: ["#FF8C00", "#FFD700"],
                start: { x: 0, y: 0 },
                end: { x: 1, y: 1 },
              }
            : {
                colors: ["#1e90ff", "#9d4edd"],
                start: { x: 0, y: 0 },
                end: { x: 1, y: 1 },
              },
          accentColor: v.code.includes("FLASH") ? "#FF8C00" : "#5cae8c",
        },
      };
    });

    return {
      vouchers: walletVouchers,
      voucherCount: walletVouchers.length,
    };
  }
}
