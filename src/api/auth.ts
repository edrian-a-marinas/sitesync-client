import api from "@/app/lib/axios";
import type { LoginInput, TokenResponse, UserResponse } from "@/app/validations/auth";

export const loginRequest = (data: LoginInput) =>
  api.post<TokenResponse>("/auth/login", data);

export const getMeRequest = () =>
  api.get<UserResponse>("/auth/me");