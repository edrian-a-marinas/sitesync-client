import { loginRequest, getMeRequest } from "@/app/api/auth";
import type { LoginInput, TokenResponse, UserResponse } from "@/app/validations/auth";

export const loginUser = async (data: LoginInput): Promise<TokenResponse> => {
  const response = await loginRequest(data);
  return response.data;
};

export const getMe = async (): Promise<UserResponse> => {
  const response = await getMeRequest();
  return response.data;
};