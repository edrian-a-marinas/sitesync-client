import { getUsersRequest, updateUserRequest, activateUserRequest, deactivateUserRequest } from "@/api/user";
import type { UserResponse } from "@/validations/auth";
import type { UserUpdateInput } from "@/validations/auth";

// --- Used in ProjectsPage ---
export const getUsers = async (): Promise<UserResponse[]> => {
  const response = await getUsersRequest();
  return response.data;
};

// --- Used in ManageUsersPage ---
export const updateUser = async (userId: number, data: UserUpdateInput): Promise<UserResponse> => {
  const response = await updateUserRequest(userId, data);
  return response.data;
};

export const activateUser = async (userId: number): Promise<UserResponse> => {
  const response = await activateUserRequest(userId);
  return response.data;
};

export const deactivateUser = async (userId: number): Promise<UserResponse> => {
  const response = await deactivateUserRequest(userId);
  return response.data;
};