import api from "@/lib/axios";
import type { LoginInput, RegisterInput, TokenResponse, UserResponse } from "@/validations/auth";

export const loginRequest = (data: LoginInput) =>
  api.post<TokenResponse>("/auth/login", data);

export const getMeRequest = () =>
  api.get<UserResponse>("/auth/me");

export const registerRequest = (data: RegisterInput) =>
  api.post<UserResponse>("/auth/register", data);