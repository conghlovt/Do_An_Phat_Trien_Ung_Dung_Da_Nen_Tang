import apiInstance from "@/src/customer/core/api/api.instance";
import { ApiResponse } from "@/src/customer/core/types/api.types";

export type ProfileResponse = {
  id: string;
  email: string;
  username: string;
  nickname?: string | null;
  phone?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  dateOfBirth?: string | null;
  avatar?: string | null;
  role: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export const getMyProfile = async (): Promise<ProfileResponse> => {
  const res = await apiInstance.get<ApiResponse<ProfileResponse>>(
    "/api/customer/profile/me",
  );
  return res.data.data;
};

export const updateMyProfile = async (
  payload: Partial<ProfileResponse>,
): Promise<ProfileResponse> => {
  const res = await apiInstance.patch<ApiResponse<ProfileResponse>>(
    "/api/customer/profile/me",
    payload,
  );
  return res.data.data;
};
