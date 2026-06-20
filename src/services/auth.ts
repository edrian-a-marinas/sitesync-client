import { loginRequest, getMeRequest, registerRequest } from "@/api/auth";
import type { LoginInput, RegisterInput, TokenResponse, UserResponse } from "@/validations/auth";

export const loginUser = async (data: LoginInput): Promise<TokenResponse> => {
  const response = await loginRequest(data);
  return response.data;
};

export const getMe = async (): Promise<UserResponse> => {
  const response = await getMeRequest();
  return response.data;
};

export const registerUser = async (data: RegisterInput): Promise<UserResponse> => {
  const response = await registerRequest(data);
  return response.data;
};