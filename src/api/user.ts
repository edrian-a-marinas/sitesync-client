import api from "@/lib/axios";

// --- Used in ProjectsPage and ManageUsersPage ---
export const getUsersRequest = (scope?: string, page: number = 1, pageSize: number = 20, search?: string) =>
  api.get("/users", { params: { ...(scope ? { scope } : {}), page, page_size: pageSize, search: search || undefined } });

// --- Used in ManageUsersPage ---
export const getUserAssignmentsRequest = (userId: number) =>
  api.get(`/users/${userId}/assignments`);

export const updateUserRequest = (userId: number, data: Record<string, unknown>) =>
  api.patch(`/users/${userId}`, data);

export const activateUserRequest = (userId: number) =>
  api.patch(`/users/${userId}/activate`);

export const deactivateUserRequest = (userId: number) =>
  api.patch(`/users/${userId}/deactivate`);

export const resetPasswordRequest = (userId: number, data: { new_password: string }) =>
  api.patch(`/users/${userId}/password/reset`, data);

// --- Used in SettingsPage ---
export const changePasswordRequest = (data: { current_password: string; new_password: string }) =>
  api.patch("/users/me/password", data);