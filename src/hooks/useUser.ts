import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, updateUser, activateUser, deactivateUser } from "@/services/user";
import type { UserResponse, UserUpdateInput } from "@/validations/auth";

// --- Used in ProjectsPage ---
export const useUsersByRole = (roleId: number) => {
  return useQuery<UserResponse[]>({
    queryKey: ["users", roleId],
    queryFn: async () => {
      const users = await getUsers();
      return users.filter((u) => u.role_id === roleId && u.is_active);
    },
  });
};

// --- Used in ManageUsersPage ---
export const useUsers = () => {
  return useQuery<UserResponse[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const users = await getUsers();
      console.log("[useUsers] fetched users:", users);
      return users;
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UserUpdateInput }) => {
      console.log("[useUpdateUser] updating user:", userId, data);
      return updateUser(userId, data);
    },
    onSuccess: (updated) => {
      console.log("[useUpdateUser] success:", updated);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useActivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => {
      console.log("[useActivateUser] activating user:", userId);
      return activateUser(userId);
    },
    onSuccess: (updated) => {
      console.log("[useActivateUser] success:", updated);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => {
      console.log("[useDeactivateUser] deactivating user:", userId);
      return deactivateUser(userId);
    },
    onSuccess: (updated) => {
      console.log("[useDeactivateUser] success:", updated);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};