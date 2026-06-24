import { getUsersRequest } from "@/api/user";
import type { UserResponse } from "@/validations/auth";

export const getUsers = async (): Promise<UserResponse[]> => {
  const response = await getUsersRequest();
  return response.data;
};