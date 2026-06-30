import { getUsersRequest, updateUserRequest, activateUserRequest, deactivateUserRequest, getUserAssignmentsRequest, changePasswordRequest } from "@/api/user";
import type { UserResponse } from "@/validations/auth";
import type { UserUpdateInput, PasswordChangeInput } from "@/validations/user";
import type { UserAssignment, UserListResponse } from "@/types/user";

// --- Used in ProjectsPage and ManageUsersPage ---
export const getUsers = async (scope?: string, page: number = 1, pageSize: number = 20, search?: string): Promise<UserListResponse> => {
  const response = await getUsersRequest(scope, page, pageSize, search);
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

export const getUserAssignments = async (userId: number): Promise<UserAssignment[]> => {
  const response = await getUserAssignmentsRequest(userId)
  return response.data
}
// --- Used in SettingsPage ---
export const changePassword = async (data: PasswordChangeInput): Promise<{ detail: string }> => {
  const response = await changePasswordRequest(data)
  return response.data
}
