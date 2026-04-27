import type { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { sendResponse } from '../utils/response.util';
import bcrypt from 'bcryptjs';

export const createUser = async (req: Request, res: Response) => {
  const { email, password, username, role } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendResponse(res, 400, 'Email đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role
      }
    });

    sendResponse(res, 201, 'Tạo tài khoản thành công', { id: user.id, email: user.email, role: user.role });
  } catch (error: any) {
    sendResponse(res, 500, error.message);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, role, email } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { username, role, email }
    });
    sendResponse(res, 200, 'Cập nhật thành công', user);
  } catch (error: any) {
    sendResponse(res, 500, error.message);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
    sendResponse(res, 200, 'Xóa người dùng thành công');
  } catch (error: any) {
    sendResponse(res, 500, error.message);
  }
};

// Voucher Management
export const getAllVouchers = async (req: Request, res: Response) => {
  try {
    const vouchers = await prisma.voucher.findMany();
    sendResponse(res, 200, 'Success', vouchers);
  } catch (error: any) {
    sendResponse(res, 500, error.message);
  }
};

export const createVoucher = async (req: Request, res: Response) => {
  try {
    const voucher = await prisma.voucher.create({ data: req.body });
    sendResponse(res, 201, 'Tạo voucher thành công', voucher);
  } catch (error: any) {
    sendResponse(res, 500, error.message);
  }
};

export const deleteVoucher = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.voucher.delete({ where: { id } });
    sendResponse(res, 200, 'Xóa voucher thành công');
  } catch (error: any) {
    sendResponse(res, 500, error.message);
  }
};

// Booking Management
export const updateBookingStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status }
    });
    sendResponse(res, 200, 'Cập nhật trạng thái booking thành công', booking);
  } catch (error: any) {
    sendResponse(res, 500, error.message);
  }
};

export const deleteProperty = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.property.delete({ where: { id } });
    sendResponse(res, 200, 'Xóa cơ sở lưu trú thành công');
  } catch (error: any) {
    sendResponse(res, 500, error.message);
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalProperties, totalBookings, totalRevenue] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({
        _sum: { totalPrice: true }
      })
    ]);

    sendResponse(res, 200, 'Stats retrieved successfully', {
      totalUsers,
      totalProperties,
      totalBookings,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      // Trends could be calculated here comparing with last month
      trends: {
        revenue: 12.5,
        bookings: 8.2,
        users: -2.4,
        partners: 15.0
      }
    });
  } catch (error: any) {
    sendResponse(res, 500, error.message);
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    sendResponse(res, 200, 'Users retrieved successfully', users);
  } catch (error: any) {
    sendResponse(res, 500, error.message);
  }
};

export const getProperties = async (req: Request, res: Response) => {
  try {
    const properties = await prisma.property.findMany({
      include: {
        owner: {
          select: { username: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    sendResponse(res, 200, 'Properties retrieved successfully', properties);
  } catch (error: any) {
    sendResponse(res, 500, error.message);
  }
};

export const updatePropertyStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // PENDING, ACTIVE, INACTIVE

  try {
    const property = await prisma.property.update({
      where: { id },
      data: { status }
    });
    sendResponse(res, 200, 'Property status updated', property);
  } catch (error: any) {
    sendResponse(res, 500, error.message);
  }
};

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { username: true } },
        room: {
          include: {
            property: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    sendResponse(res, 200, 'Bookings retrieved successfully', bookings);
  } catch (error: any) {
    sendResponse(res, 500, error.message);
  }
};

export const getFinanceRecords = async (req: Request, res: Response) => {
  try {
    const finance = await prisma.finance.findMany({
      orderBy: { createdAt: 'desc' }
    });
    sendResponse(res, 200, 'Finance records retrieved successfully', finance);
  } catch (error: any) {
    sendResponse(res, 500, error.message);
  }
};
