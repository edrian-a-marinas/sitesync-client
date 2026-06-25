import api from "@/lib/axios";


// --- Used in ProjectsPage and ManageUsersPage ---
export const getUsersRequest = (scope?: string) =>
  api.get("/users", { params: scope ? { scope } : undefined });

// --- Used in ManageUsersPage ---
export const updateUserRequest = (userId: number, data: Record<string, unknown>) =>
  api.patch(`/users/${userId}`, data);

export const activateUserRequest = (userId: number) =>
  api.patch(`/users/${userId}/activate`);

export const deactivateUserRequest = (userId: number) =>
  api.patch(`/users/${userId}/deactivate`);

export const getUserAssignmentsRequest = (userId: number) =>
  api.get(`/users/${userId}/assignments`);