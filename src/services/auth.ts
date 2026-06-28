import { loginRequest, getMeRequest, registerRequest } from "@/api/auth";
import { saveToken, clearToken } from "@/lib/token";
import type { LoginInput, TokenResponse, UserResponse } from "@/validations/auth";
import type { RegisterInput } from "@/validations/user";

export const loginUser = async (data: LoginInput): Promise<UserResponse> => {
  const tokenRes: TokenResponse = (await loginRequest(data)).data;
  saveToken(tokenRes.access_token);
  const user = await getMe();
  return user;
};

export const getMe = async (): Promise<UserResponse> => {
  const response = await getMeRequest();
  return response.data;
};

export const registerUser = async (data: RegisterInput): Promise<UserResponse> => {
  const response = await registerRequest(data);
  return response.data;
};

export const logoutUser = () => {
  clearToken();
};