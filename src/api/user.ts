import api from "@/lib/axios";


// --- Used in ProjectsPage ---
export const getUsersRequest = () =>
  api.get("/users");

// --- Used in ManageUsersPage ---
export const updateUserRequest = (userId: number, data: Record<string, unknown>) =>
  api.patch(`/users/${userId}`, data);

export const activateUserRequest = (userId: number) =>
  api.patch(`/users/${userId}/activate`);

export const deactivateUserRequest = (userId: number) =>
  api.patch(`/users/${userId}/deactivate`);