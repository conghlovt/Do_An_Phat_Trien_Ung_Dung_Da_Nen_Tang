import prisma from '../../login/lib/prisma';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { AppError } from '../../shared/utils/app-error.util';
import {
  ACTIVE_USER_STATUSES,
  BLOCKED_USER_STATUSES,
  isActiveUserStatus,
  isBlockedUserStatus,
  isValidUserStatus,
} from '../../shared/utils/user-status.util';

const ROOT_ADMIN_ROLES = ['SUPER_ADMIN', 'admin'];
const PROTECTED_ADMIN_ROLES = ['admin', 'SUPER_ADMIN', 'OPERATOR', 'ACCOUNTANT'];

const asArray = <T>(items: (T | false | null | undefined)[]) => items.filter(Boolean) as T[];

export const userService = {
  getAllUsers: async (options: { q?: string; role?: string; status?: string; requesterRole: string; page?: number; limit?: number }) => {
    const { q, role, status, requesterRole, page = 1, limit = 10 } = options;
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

    if (status) {
      if (isActiveUserStatus(status)) {
        where.status = { in: [...ACTIVE_USER_STATUSES] as any };
      } else if (isBlockedUserStatus(status)) {
        where.status = { in: [...BLOCKED_USER_STATUSES] as any };
      } else if (isValidUserStatus(status)) {
        where.status = status as any;
      }
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
  updateUserStatus: async (id: string, status: string, requesterRole: string, requesterId?: string) => {
    if (!isValidUserStatus(status)) {
      throw new AppError(400, 'VALIDATION_ERROR', {
        userMessage: 'Trạng thái người dùng không hợp lệ.',
        errors: { status: 'Trạng thái người dùng không hợp lệ.' },
      });
    }

    const targetUser = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, status: true } });
    if (!targetUser) {
      throw new AppError(404, 'USER_NOT_FOUND');
    }

    const isBlocking = isBlockedUserStatus(status);
    if (isBlocking && requesterId && requesterId === targetUser.id) {
      throw new AppError(400, 'VALIDATION_ERROR', {
        userMessage: 'Không thể tự khóa tài khoản của chính mình.',
        errors: { user: 'Không thể tự khóa tài khoản của chính mình.' },
      });
    }

    if (targetUser.role === 'SUPER_ADMIN' && requesterRole !== 'SUPER_ADMIN') {
      throw new AppError(403, 'ADMIN_ACCOUNT_FORBIDDEN');
    }

    if (!ROOT_ADMIN_ROLES.includes(requesterRole) && PROTECTED_ADMIN_ROLES.includes(targetUser.role)) {
      throw new AppError(403, 'ADMIN_ACCOUNT_FORBIDDEN');
    }

    if (isBlocking && ['admin', 'SUPER_ADMIN'].includes(targetUser.role)) {
      const remainingActiveAdmins = await prisma.user.count({
        where: {
          id: { not: targetUser.id },
          role: { in: ['admin', 'SUPER_ADMIN'] as any },
          status: { in: [...ACTIVE_USER_STATUSES] as any },
        },
      });

      if (remainingActiveAdmins === 0) {
        throw new AppError(400, 'VALIDATION_ERROR', {
          userMessage: 'Không thể khóa quản trị viên active cuối cùng.',
          errors: { user: 'Không thể khóa quản trị viên active cuối cùng.' },
        });
      }
    }

    return await prisma.user.update({
      where: { id },
      data: {
        status: status as any,
        ...(isBlocking ? { refreshToken: null } : {}),
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        status: true,
      },
    });
  },

  blockUser: async (id: string, requesterRole: string, requesterId?: string) => {
    return userService.updateUserStatus(id, BLOCKED_USER_STATUSES[0], requesterRole, requesterId);
  },

  unblockUser: async (id: string, requesterRole: string, requesterId?: string) => {
    return userService.updateUserStatus(id, ACTIVE_USER_STATUSES[0], requesterRole, requesterId);
  },
};
