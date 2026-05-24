import { PrismaClient, VoucherStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function makeError(message: string, statusCode = 400) {
  const error: any = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function formatVoucher(voucher: any) {
  const voucherRoomTypes = voucher.roomTypes || [];

  return {
    ...voucher,
    applicableRoomTypeIds:
      voucherRoomTypes.length > 0
        ? voucherRoomTypes.map((item: any) => item.roomTypeId)
        : ['all'],

    roomTypes: voucherRoomTypes.map((item: any) => ({
      id: item.roomType?.id,
      name: item.roomType?.name,
    })),
  };
}

async function checkHotelOwner(hotelId: string, ownerId: string) {
  if (!ownerId) {
    throw makeError('Bạn chưa đăng nhập', 401);
  }

  const hotel = await prisma.hotel.findFirst({
    where: {
      id: hotelId,
      ownerId,
    },
  });

  if (!hotel) {
    throw makeError(
      'Không tìm thấy khách sạn hoặc bạn không có quyền truy cập',
      404
    );
  }

  return hotel;
}

async function validateRoomTypesBelongToHotel(
  hotelId: string,
  applicableRoomTypeIds: string[]
) {
  if (!applicableRoomTypeIds.length || applicableRoomTypeIds.includes('all')) {
    return;
  }

  const count = await prisma.roomType.count({
    where: {
      hotelId,
      id: {
        in: applicableRoomTypeIds,
      },
    },
  });

  if (count !== applicableRoomTypeIds.length) {
    throw makeError('Một hoặc nhiều loại phòng không thuộc khách sạn này', 400);
  }
}

export const voucherService = {
  async listByHotel(hotelId: string, ownerId: string) {
    await checkHotelOwner(hotelId, ownerId);

    const vouchers = await prisma.voucher.findMany({
      where: {
        hotelId,
      },
      include: {
        roomTypes: {
          include: {
            roomType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return vouchers.map(formatVoucher);
  },

  async getById(hotelId: string, voucherId: string, ownerId: string) {
    await checkHotelOwner(hotelId, ownerId);

    const voucher = await prisma.voucher.findFirst({
      where: {
        id: voucherId,
        hotelId,
      },
      include: {
        roomTypes: {
          include: {
            roomType: true,
          },
        },
      },
    });

    if (!voucher) {
      throw makeError('Không tìm thấy voucher', 404);
    }

    return formatVoucher(voucher);
  },

  async create(hotelId: string, ownerId: string, data: any) {
    await checkHotelOwner(hotelId, ownerId);

    const applicableRoomTypeIds =
      Array.isArray(data.applicableRoomTypeIds) &&
      data.applicableRoomTypeIds.length > 0
        ? data.applicableRoomTypeIds
        : ['all'];

    await validateRoomTypesBelongToHotel(hotelId, applicableRoomTypeIds);

    const voucher = await prisma.voucher.create({
      data: {
        hotelId,
        code: String(data.code || '').trim().toUpperCase(),
        name: String(data.name || '').trim(),
        discountType: data.discountType || 'percent',
        discountValue: Number(data.discountValue || 0),
        minOrderValue:
          data.minOrderValue !== undefined && data.minOrderValue !== null
            ? Number(data.minOrderValue)
            : null,
        maxDiscount:
          data.maxDiscount !== undefined && data.maxDiscount !== null
            ? Number(data.maxDiscount)
            : null,
        usageLimit:
          data.usageLimit !== undefined && data.usageLimit !== null
            ? Number(data.usageLimit)
            : 100,
        usedCount: 0,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: VoucherStatus.ACTIVE,
      } as any,
    });

    if (!applicableRoomTypeIds.includes('all')) {
      await prisma.voucherRoomType.createMany({
        data: applicableRoomTypeIds.map((roomTypeId: string) => ({
          voucherId: voucher.id,
          roomTypeId,
        })) as any,
        skipDuplicates: true,
      });
    }

    return this.getById(hotelId, voucher.id, ownerId);
  },

  async update(hotelId: string, voucherId: string, ownerId: string, data: any) {
    await checkHotelOwner(hotelId, ownerId);

    const existingVoucher = await prisma.voucher.findFirst({
      where: {
        id: voucherId,
        hotelId,
      },
    });

    if (!existingVoucher) {
      throw makeError('Không tìm thấy voucher', 404);
    }

    const applicableRoomTypeIds =
      Array.isArray(data.applicableRoomTypeIds) &&
      data.applicableRoomTypeIds.length > 0
        ? data.applicableRoomTypeIds
        : ['all'];

    await validateRoomTypesBelongToHotel(hotelId, applicableRoomTypeIds);

    await prisma.voucher.update({
      where: {
        id: voucherId,
      },
      data: {
        code:
          data.code !== undefined
            ? String(data.code).trim().toUpperCase()
            : undefined,
        name:
          data.name !== undefined
            ? String(data.name).trim()
            : undefined,
        discountType:
          data.discountType !== undefined ? data.discountType : undefined,
        discountValue:
          data.discountValue !== undefined
            ? Number(data.discountValue)
            : undefined,
        minOrderValue:
          data.minOrderValue !== undefined
            ? Number(data.minOrderValue)
            : undefined,
        maxDiscount:
          data.maxDiscount !== undefined
            ? Number(data.maxDiscount)
            : undefined,
        usageLimit:
          data.usageLimit !== undefined ? Number(data.usageLimit) : undefined,
        startDate:
          data.startDate !== undefined ? new Date(data.startDate) : undefined,
        endDate:
          data.endDate !== undefined ? new Date(data.endDate) : undefined,
      } as any,
    });

    await prisma.voucherRoomType.deleteMany({
      where: {
        voucherId,
      },
    });

    if (!applicableRoomTypeIds.includes('all')) {
      await prisma.voucherRoomType.createMany({
        data: applicableRoomTypeIds.map((roomTypeId: string) => ({
          voucherId,
          roomTypeId,
        })) as any,
        skipDuplicates: true,
      });
    }

    return this.getById(hotelId, voucherId, ownerId);
  },

  async remove(hotelId: string, voucherId: string, ownerId: string) {
    await checkHotelOwner(hotelId, ownerId);

    const existingVoucher = await prisma.voucher.findFirst({
      where: {
        id: voucherId,
        hotelId,
      },
    });

    if (!existingVoucher) {
      throw makeError('Không tìm thấy voucher', 404);
    }

    await prisma.voucher.delete({
      where: {
        id: voucherId,
      },
    });

    return true;
  },
};
