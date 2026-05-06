import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { sendResponse } from '../utils/response.util';

const ROLE_PERMISSION_ROLES = ['SUPER_ADMIN', 'OPERATOR', 'ACCOUNTANT'] as const;
const PERMISSION_MODULES = ['revenue', 'booking', 'lodging', 'users', 'partners', 'finance', 'voucher', 'reviews', 'content'];
const PERMISSION_ACTIONS = ['view', 'edit', 'delete', 'approve'];
const ROOT_ADMIN_ROLES = ['SUPER_ADMIN', 'admin'];
const PROTECTED_ADMIN_ROLES = ['admin', 'SUPER_ADMIN', 'OPERATOR', 'ACCOUNTANT'];

const asArray = <T>(items: (T | false | null | undefined)[]) => items.filter(Boolean) as T[];

const getDefaultPermissions = (role: string) => {
  const permissions: Record<string, Record<string, boolean>> = {};

  for (const moduleId of PERMISSION_MODULES) {
    permissions[moduleId] = {};
    for (const actionId of PERMISSION_ACTIONS) {
      permissions[moduleId]![actionId] = ROOT_ADMIN_ROLES.includes(role);
    }
  }

  if (role === 'OPERATOR') {
    for (const moduleId of ['booking', 'lodging', 'partners', 'voucher', 'reviews', 'content']) {
      permissions[moduleId]!.view = true;
      permissions[moduleId]!.edit = true;
      permissions[moduleId]!.approve = true;
    }
  }

  if (role === 'ACCOUNTANT') {
    for (const moduleId of ['revenue', 'finance', 'booking', 'voucher']) {
      permissions[moduleId]!.view = true;
    }
    permissions.finance!.edit = true;
    permissions.finance!.approve = true;
  }

  return permissions;
};

const normalizeVoucher = (voucher: any) => ({
  ...voucher,
  endDate: voucher.expiry,
  status: voucher.isActive ? 'ACTIVE' : 'INACTIVE',
});

const normalizeBooking = (booking: any) => ({
  ...booking,
  property: booking.room?.property || null,
});

const normalizeReview = (review: any) => ({
  ...review,
  guest: review.user?.username || 'Khach hang',
  property: review.booking?.room?.property?.name || 'N/A',
  date: review.createdAt,
});

const normalizeContent = (post: any) => ({
  ...post,
  author: post.author?.username || 'Admin',
  date: post.updatedAt,
});

export const createUser = async (req: Request, res: Response) => {
  const { email, password, username, role } = req.body;
  const requesterRole = (req as any).user?.role;

  if (!email || !password || !username || !role) {
    return sendResponse(res, 400, 'Missing required user fields');
  }

  if (PROTECTED_ADMIN_ROLES.includes(role) && !ROOT_ADMIN_ROLES.includes(requesterRole)) {
    return sendResponse(res, 403, 'Only Super Admin can create admin or staff accounts');
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendResponse(res, 409, 'Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: role as any,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return sendResponse(res, 201, 'User created successfully', user);
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { username, role, email } = req.body;
  const requesterRole = (req as any).user?.role;

  try {
    const targetUser = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!targetUser) {
      return sendResponse(res, 404, 'User not found');
    }

    if (
      !ROOT_ADMIN_ROLES.includes(requesterRole) &&
      (PROTECTED_ADMIN_ROLES.includes(targetUser.role) || (role !== undefined && PROTECTED_ADMIN_ROLES.includes(role)))
    ) {
      return sendResponse(res, 403, 'Only Super Admin can update admin or staff accounts');
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(username !== undefined ? { username } : {}),
        ...(role !== undefined ? { role: role as any } : {}),
        ...(email !== undefined ? { email } : {}),
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return sendResponse(res, 200, 'User updated successfully', user);
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const requesterRole = (req as any).user?.role;

  try {
    const targetUser = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!targetUser) {
      return sendResponse(res, 404, 'User not found');
    }

    if (!ROOT_ADMIN_ROLES.includes(requesterRole) && PROTECTED_ADMIN_ROLES.includes(targetUser.role)) {
      return sendResponse(res, 403, 'Only Super Admin can delete admin or staff accounts');
    }

    await prisma.$transaction(async (tx) => {
      const properties = await tx.property.findMany({
        where: { ownerId: id },
        include: { rooms: { select: { id: true } } },
      });
      const propertyIds = properties.map((property: any) => property.id);
      const ownedRoomIds = properties.flatMap((property: any) => property.rooms.map((room: any) => room.id));

      const bookings = await tx.booking.findMany({
        where: {
          OR: asArray([
            { userId: id },
            ownedRoomIds.length ? { roomId: { in: ownedRoomIds } } : null,
          ]),
        },
        select: { id: true },
      });
      const bookingIds = bookings.map((booking) => booking.id);

      await tx.review.deleteMany({
        where: {
          OR: asArray([
            { userId: id },
            bookingIds.length ? { bookingId: { in: bookingIds } } : null,
          ]),
        },
      });

      if (bookingIds.length) {
        await tx.booking.deleteMany({ where: { id: { in: bookingIds } } });
      }
      if (ownedRoomIds.length) {
        await tx.room.deleteMany({ where: { id: { in: ownedRoomIds } } });
      }
      if (propertyIds.length) {
        await tx.property.deleteMany({ where: { id: { in: propertyIds } } });
      }

      await tx.contentPost.updateMany({ where: { authorId: id }, data: { authorId: null } });
      await tx.user.delete({ where: { id } });
    });

    return sendResponse(res, 200, 'User deleted successfully');
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  const q = String(req.query.q || '').trim();
  const role = String(req.query.role || '').trim();
  const requesterRole = (req as any).user?.role;
  const canViewProtectedUsers = ROOT_ADMIN_ROLES.includes(requesterRole);

  try {
    const users = await prisma.user.findMany({
      where: {
        ...(q
          ? {
              OR: [
                { username: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
                { role: { equals: q as any } },
              ],
            }
          : {}),
        ...(role
          ? { role: role as any }
          : !canViewProtectedUsers
            ? { role: { notIn: PROTECTED_ADMIN_ROLES as any } }
            : {}),
        ...(role && !canViewProtectedUsers && PROTECTED_ADMIN_ROLES.includes(role)
          ? { id: '__forbidden_admin_role__' }
          : {}),
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return sendResponse(res, 200, 'Users retrieved successfully', users);
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const getAllVouchers = async (_req: Request, res: Response) => {
  try {
    const vouchers = await prisma.voucher.findMany({ orderBy: { createdAt: 'desc' } });
    return sendResponse(res, 200, 'Vouchers retrieved successfully', vouchers.map(normalizeVoucher));
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const createVoucher = async (req: Request, res: Response) => {
  const { code, discount, type, expiry, endDate, usageLimit, isActive, status } = req.body;
  const expiryDate = expiry || endDate;

  if (!code || discount === undefined || !type || !expiryDate) {
    return sendResponse(res, 400, 'Missing required voucher fields');
  }

  try {
    const voucher = await prisma.voucher.create({
      data: {
        code: String(code).trim().toUpperCase(),
        discount: Number(discount),
        type,
        expiry: new Date(expiryDate),
        usageLimit: Number(usageLimit || 100),
        isActive: isActive ?? status !== 'INACTIVE',
      },
    });
    return sendResponse(res, 201, 'Voucher created successfully', normalizeVoucher(voucher));
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const updateVoucher = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { code, discount, type, expiry, endDate, usageLimit, usedCount, isActive, status } = req.body;

  try {
    const voucher = await prisma.voucher.update({
      where: { id },
      data: {
        ...(code !== undefined ? { code: String(code).trim().toUpperCase() } : {}),
        ...(discount !== undefined ? { discount: Number(discount) } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(expiry !== undefined || endDate !== undefined ? { expiry: new Date(expiry || endDate) } : {}),
        ...(usageLimit !== undefined ? { usageLimit: Number(usageLimit) } : {}),
        ...(usedCount !== undefined ? { usedCount: Number(usedCount) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        ...(status !== undefined ? { isActive: status === 'ACTIVE' } : {}),
      },
    });
    return sendResponse(res, 200, 'Voucher updated successfully', normalizeVoucher(voucher));
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const deleteVoucher = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  try {
    await prisma.voucher.delete({ where: { id } });
    return sendResponse(res, 200, 'Voucher deleted successfully');
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const getProperties = async (req: Request, res: Response) => {
  const q = String(req.query.q || '').trim();

  try {
    const properties = await prisma.property.findMany({
      ...(q
        ? { where: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { address: { contains: q, mode: 'insensitive' } },
              { city: { contains: q, mode: 'insensitive' } },
              { type: { contains: q, mode: 'insensitive' } },
            ],
          } }
        : {}),
      include: {
        owner: { select: { username: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    } as any);
    return sendResponse(res, 200, 'Properties retrieved successfully', properties);
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const updateProperty = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { name, description, address, city, type, status } = req.body;

  try {
    const property = await prisma.property.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(status !== undefined ? { status: status as any } : {}),
      },
      include: { owner: { select: { username: true, email: true } } },
    });
    return sendResponse(res, 200, 'Property updated successfully', property);
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const updatePropertyStatus = async (req: Request, res: Response) => {
  req.body = { status: req.body.status };
  return updateProperty(req, res);
};

export const deleteProperty = async (req: Request, res: Response) => {
  const id = String(req.params.id);

  try {
    await prisma.$transaction(async (tx) => {
      const rooms = await tx.room.findMany({ where: { propertyId: id }, select: { id: true } });
      const roomIds = rooms.map((room) => room.id);
      const bookings = roomIds.length
        ? await tx.booking.findMany({ where: { roomId: { in: roomIds } }, select: { id: true } })
        : [];
      const bookingIds = bookings.map((booking) => booking.id);

      if (bookingIds.length) {
        await tx.review.deleteMany({ where: { bookingId: { in: bookingIds } } });
        await tx.booking.deleteMany({ where: { id: { in: bookingIds } } });
      }
      if (roomIds.length) {
        await tx.room.deleteMany({ where: { id: { in: roomIds } } });
      }
      await tx.property.delete({ where: { id } });
    });

    return sendResponse(res, 200, 'Property deleted successfully');
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const getAllBookings = async (req: Request, res: Response) => {
  const q = String(req.query.q || '').trim();

  try {
    const bookings = await prisma.booking.findMany({
      ...(q
        ? { where: {
            OR: [
              { user: { username: { contains: q, mode: 'insensitive' } } },
              { room: { name: { contains: q, mode: 'insensitive' } } },
              { room: { property: { name: { contains: q, mode: 'insensitive' } } } },
              { status: { equals: q as any } },
            ],
          } }
        : {}),
      include: {
        user: { select: { username: true, email: true } },
        room: {
          include: {
            property: { select: { name: true, address: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    } as any);
    return sendResponse(res, 200, 'Bookings retrieved successfully', bookings.map(normalizeBooking));
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { status } = req.body;

  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status: status as any },
      include: {
        user: { select: { username: true, email: true } },
        room: { include: { property: { select: { name: true, address: true } } } },
      },
    });
    return sendResponse(res, 200, 'Booking updated successfully', normalizeBooking(booking));
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  const id = String(req.params.id);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.review.deleteMany({ where: { bookingId: id } });
      await tx.booking.delete({ where: { id } });
    });
    return sendResponse(res, 200, 'Booking deleted successfully');
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const getAllReviews = async (req: Request, res: Response) => {
  const q = String(req.query.q || '').trim();

  try {
    const reviews = await prisma.review.findMany({
      ...(q
        ? { where: {
            OR: [
              { comment: { contains: q, mode: 'insensitive' } },
              { user: { username: { contains: q, mode: 'insensitive' } } },
              { booking: { room: { property: { name: { contains: q, mode: 'insensitive' } } } } },
            ],
          } }
        : {}),
      include: {
        user: { select: { username: true, email: true } },
        booking: { include: { room: { include: { property: { select: { name: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
    } as any);
    return sendResponse(res, 200, 'Reviews retrieved successfully', reviews.map(normalizeReview));
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const updateReview = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { rating, comment, status } = req.body;

  try {
    const review = await prisma.review.update({
      where: { id },
      data: {
        ...(rating !== undefined ? { rating: Number(rating) } : {}),
        ...(comment !== undefined ? { comment } : {}),
        ...(status !== undefined ? { status: status as any } : {}),
      },
      include: {
        user: { select: { username: true, email: true } },
        booking: { include: { room: { include: { property: { select: { name: true } } } } } },
      },
    });
    return sendResponse(res, 200, 'Review updated successfully', normalizeReview(review));
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  try {
    await prisma.review.delete({ where: { id } });
    return sendResponse(res, 200, 'Review deleted successfully');
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const getAllContent = async (req: Request, res: Response) => {
  const q = String(req.query.q || '').trim();

  try {
    const posts = await prisma.contentPost.findMany({
      ...(q
        ? { where: {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { category: { contains: q, mode: 'insensitive' } },
              { body: { contains: q, mode: 'insensitive' } },
            ],
          } }
        : {}),
      include: { author: { select: { username: true } } },
      orderBy: { updatedAt: 'desc' },
    } as any);
    return sendResponse(res, 200, 'Content retrieved successfully', posts.map(normalizeContent));
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const createContent = async (req: Request, res: Response) => {
  const { title, category, excerpt, body, status, authorId } = req.body;

  if (!title || !category || !body) {
    return sendResponse(res, 400, 'Missing required content fields');
  }

  try {
    const post = await prisma.contentPost.create({
      data: {
        title,
        category,
        excerpt,
        body,
        status: (status || 'DRAFT') as any,
        authorId: authorId || (req as any).user?.id || null,
      },
      include: { author: { select: { username: true } } },
    });
    return sendResponse(res, 201, 'Content created successfully', normalizeContent(post));
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const updateContent = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { title, category, excerpt, body, status } = req.body;

  try {
    const post = await prisma.contentPost.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(excerpt !== undefined ? { excerpt } : {}),
        ...(body !== undefined ? { body } : {}),
        ...(status !== undefined ? { status: status as any } : {}),
      },
      include: { author: { select: { username: true } } },
    });
    return sendResponse(res, 200, 'Content updated successfully', normalizeContent(post));
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const deleteContent = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  try {
    await prisma.contentPost.delete({ where: { id } });
    return sendResponse(res, 200, 'Content deleted successfully');
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const getRolePermissions = async (_req: Request, res: Response) => {
  try {
    const permissions = await Promise.all(
      ROLE_PERMISSION_ROLES.map(async (role) => {
        const item = await prisma.rolePermission.upsert({
          where: { role },
          update: {},
          create: { role, permissions: getDefaultPermissions(role) },
        });
        return item;
      }),
    );
    return sendResponse(res, 200, 'Role permissions retrieved successfully', permissions);
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const updateRolePermissions = async (req: Request, res: Response) => {
  const role = String(req.params.role);
  const { permissions } = req.body;

  if (!ROLE_PERMISSION_ROLES.includes(role as any)) {
    return sendResponse(res, 400, 'Unsupported permission role');
  }

  if (!permissions || typeof permissions !== 'object') {
    return sendResponse(res, 400, 'Permissions payload is required');
  }

  try {
    const updated = await prisma.rolePermission.upsert({
      where: { role: role as any },
      update: { permissions },
      create: { role: role as any, permissions },
    });
    return sendResponse(res, 200, 'Role permissions saved successfully', updated);
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const getNotifications = async (_req: Request, res: Response) => {
  try {
    const [pendingProperties, pendingBookings, pendingReviews, recentUsers] = await Promise.all([
      prisma.property.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.review.count({ where: { status: 'PENDING' } }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, username: true, role: true, createdAt: true },
      }),
    ]);

    const notifications = [
      ...(pendingProperties
        ? [{ id: 'pending-properties', type: 'lodging', title: 'Co so luu tru cho duyet', message: `${pendingProperties} co so dang cho duyet`, tab: 'lodging' }]
        : []),
      ...(pendingBookings
        ? [{ id: 'pending-bookings', type: 'booking', title: 'Booking cho xu ly', message: `${pendingBookings} booking dang cho xu ly`, tab: 'booking' }]
        : []),
      ...(pendingReviews
        ? [{ id: 'pending-reviews', type: 'reviews', title: 'Danh gia moi', message: `${pendingReviews} danh gia dang cho duyet`, tab: 'reviews' }]
        : []),
      ...recentUsers.map((item) => ({
        id: `user-${item.id}`,
        type: 'users',
        title: 'Nguoi dung moi',
        message: `${item.username} (${item.role}) vua tham gia`,
        tab: item.role === 'customer' ? 'customers' : item.role === 'partner' ? 'partners' : 'admins',
        createdAt: item.createdAt,
      })),
    ];

    return sendResponse(res, 200, 'Notifications retrieved successfully', notifications);
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const getStats = async (_req: Request, res: Response) => {
  try {
    const [totalUsers, totalProperties, totalBookings, totalRevenue, pendingReviews] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({ _sum: { totalPrice: true } }),
      prisma.review.count({ where: { status: 'PENDING' } }),
    ]);

    return sendResponse(res, 200, 'Stats retrieved successfully', {
      totalUsers,
      totalProperties,
      totalBookings,
      pendingReviews,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      trends: {
        revenue: 12.5,
        bookings: 8.2,
        users: -2.4,
        partners: 15.0,
      },
    });
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};

export const getFinanceRecords = async (_req: Request, res: Response) => {
  try {
    const finance = await prisma.finance.findMany({ orderBy: { createdAt: 'desc' } });
    return sendResponse(res, 200, 'Finance records retrieved successfully', finance);
  } catch (error: any) {
    return sendResponse(res, 500, error.message);
  }
};
