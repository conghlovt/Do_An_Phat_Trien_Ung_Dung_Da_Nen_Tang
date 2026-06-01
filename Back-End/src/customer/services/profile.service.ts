// src/customer/services/profile.service.ts

import prisma from "../../login/lib/prisma";
import { Prisma } from "@prisma/client";

export type UpdateProfilePayload = {
  nickname?: string;
  phone?: string;
  gender?: string | null;
  dateOfBirth?: string | null;
  avatar?: string | null;
  email?: string;
};

// In-memory cache for temporary profile updates
const inMemoryProfileOverrides = new Map<
  string,
  {
    email?: string;
    nickname?: string;
    phone?: string | null;
    gender?: string | null;
    dateOfBirth?: string | null;
    avatar?: string | null;
  }
>();

const toProfileResponse = (user: any) => {
  if (!user) return null;

  const baseResponse = {
    id: user.id,
    email: user.email,
    username: user.username,
    nickname: user.username ?? null,
    phone: user.phone ?? null,
    gender: null,
    dateOfBirth: null,
    avatar: user.avatar ?? null,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  const override = inMemoryProfileOverrides.get(user.id);
  if (override) {
    return {
      ...baseResponse,
      ...override,
    };
  }

  return baseResponse;
};

export const getMyProfileByUserId = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      phone: true,
      avatar: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return toProfileResponse(user);
};

export const updateMyProfileByUserId = async (
  userId: string,
  payload: UpdateProfilePayload,
) => {
  const { nickname, phone, avatar, email, gender, dateOfBirth } = payload;

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { phone: true },
  });

  const existingOverride = inMemoryProfileOverrides.get(userId) || {};
  const currentPhone =
    existingOverride.phone !== undefined
      ? existingOverride.phone
      : existingUser?.phone;

  if (currentPhone && phone !== undefined && phone !== currentPhone) {
    throw new Error(
      "Số điện thoại chỉ được cập nhật một lần và không thể thay đổi.",
    );
  }

  // Update overrides in memory
  const updatedOverride = {
    ...existingOverride,
  };

  if (email !== undefined) updatedOverride.email = email;
  if (nickname !== undefined) updatedOverride.nickname = nickname;
  if (phone !== undefined) updatedOverride.phone = phone === "" ? null : phone;
  if (avatar !== undefined) updatedOverride.avatar = avatar;
  if (gender !== undefined) updatedOverride.gender = gender;
  if (dateOfBirth !== undefined) updatedOverride.dateOfBirth = dateOfBirth;

  inMemoryProfileOverrides.set(userId, updatedOverride);

  // Retrieve base user to build the profile response
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      phone: true,
      avatar: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("Không tìm thấy người dùng.");
  }

  return toProfileResponse(user);
};
