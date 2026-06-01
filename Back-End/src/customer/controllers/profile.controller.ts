import type { Request, Response } from "express";
import { sendError, sendResponse } from "../../shared/utils/response.util";
import {
  getMyProfileByUserId,
  updateMyProfileByUserId,
} from "../services/profile.service";

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return sendResponse(res, 401, "Bạn chưa đăng nhập.");
    }

    const profile = await getMyProfileByUserId(userId);

    if (!profile) {
      return sendResponse(res, 404, "Không tìm thấy người dùng.");
    }

    return sendResponse(res, 200, "Lấy hồ sơ thành công.", profile);
  } catch (error) {
    return sendError(res, error);
  }
};

export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return sendResponse(res, 401, "Bạn chưa đăng nhập.");
    }

    const { nickname, phone, gender, dateOfBirth, avatar, email } = req.body;

    const updatedProfile = await updateMyProfileByUserId(userId, {
      nickname,
      phone,
      gender,
      dateOfBirth,
      avatar,
      email,
    });

    return sendResponse(res, 200, "Cập nhật hồ sơ thành công.", updatedProfile);
  } catch (error) {
    return sendError(res, error);
  }
};
