import prisma from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { AppError } from '../../utils/app-error.util';

const ROOT_ADMIN_ROLES = ['SUPER_ADMIN', 'admin'];
const PROTECTED_ADMIN_ROLES = ['admin', 'SUPER_ADMIN', 'OPERATOR', 'ACCOUNTANT'];

const asArray = <T>(items: (T | false | null | undefined)[]) => items.filter(Boolean) as T[];

export const userService = {
  getAllUsers: async (options: { q?: string; role?: string; requesterRole: string; page?: number; limit?: number }) => {
    const { q, role, requesterRole, page = 1, limit = 10 } = options;
    const canViewProtectedUsers = ROOT_ADMIN_ROLES.includes(requesterRole);
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (q) {
      where.OR = [
        { username: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { role: { equals: q as any } },
      ];
    }

    if (role) {
      where.role = role as any;
    } else if (!canViewProtectedUsers) {
      where.role = { notIn: PROTECTED_ADMIN_ROLES as any };
    }

    if (role && !canViewProtectedUsers && PROTECTED_ADMIN_ROLES.includes(role)) {
      where.id = '__forbidden_admin_role__';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  },

  createUser: async (data: any, requesterRole: string) => {
    const { email, password, username, role } = data;

    if (PROTECTED_ADMIN_ROLES.includes(role) && !ROOT_ADMIN_ROLES.includes(requesterRole)) {
      throw new AppError(403, 'ADMIN_ACCOUNT_FORBIDDEN');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError(409, 'EMAIL_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return await prisma.user.create({
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
  },

  updateUser: async (id: string, data: any, requesterRole: string) => {
    const { username, role, email } = data;

    const targetUser = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!targetUser) {
      throw new AppError(404, 'USER_NOT_FOUND');
    }

    if (
      !ROOT_ADMIN_ROLES.includes(requesterRole) &&
      (PROTECTED_ADMIN_ROLES.includes(targetUser.role) || (role !== undefined && PROTECTED_ADMIN_ROLES.includes(role)))
    ) {
      throw new AppError(403, 'ADMIN_ACCOUNT_FORBIDDEN');
    }

    return await prisma.user.update({
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
  },

  deleteUser: async (id: string, requesterRole: string) => {
    const targetUser = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!targetUser) {
      throw new AppError(404, 'USER_NOT_FOUND');
    }

    if (!ROOT_ADMIN_ROLES.includes(requesterRole) && PROTECTED_ADMIN_ROLES.includes(targetUser.role)) {
      throw new AppError(403, 'ADMIN_ACCOUNT_FORBIDDEN');
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
  },
  updateUserStatus: async (id: string, status: string, requesterRole: string) => {
    const targetUser = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!targetUser) {
      throw new AppError(404, 'USER_NOT_FOUND');
    }

    if (!ROOT_ADMIN_ROLES.includes(requesterRole) && PROTECTED_ADMIN_ROLES.includes(targetUser.role)) {
      throw new AppError(403, 'ADMIN_ACCOUNT_FORBIDDEN');
    }

    return await prisma.user.update({
      where: { id },
      data: { status: status as any },
      select: {
        id: true,
        username: true,
        role: true,
        status: true,
      },
    });
  },
};
