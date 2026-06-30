import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, updateUser, activateUser, deactivateUser, getUserAssignments, changePassword } from "@/services/user";
import { getUsersRequest } from "@/api/user";
import type { UserAssignment, UserListResponse } from "@/types/user";
import type { UserUpdateInput, PasswordChangeInput } from "@/validations/user";
import type { UserResponse } from "@/validations/auth";

// --- Used in ProjectsPage ---
export const useUsersByRole = (roleId: number) => {
  return useQuery<UserResponse[]>({
    queryKey: ["users", roleId],
    queryFn: async () => {
      const res = await getUsersRequest(undefined, 1, 100)
      const users: UserResponse[] = res.data.items
      return users.filter((u) => u.role_id === roleId && u.is_active)
    },
  });
};

// --- Used in ManageUsersPage ---
export const useUsers = (scope?: 'mine' | 'all', page: number = 1, pageSize: number = 20, search: string = '') => {
  return useQuery<UserListResponse>({
    queryKey: ["users", scope ?? 'all', page, pageSize, search],
    queryFn: () => getUsers(scope, page, pageSize, search),
    placeholderData: (prev) => prev,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UserUpdateInput }) => {
      return updateUser(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useActivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => {
      return activateUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => {
      return deactivateUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUserAssignments = (userId: number | null) => {
  return useQuery<UserAssignment[]>({
    queryKey: ["user-assignments", userId],
    queryFn: () => getUserAssignments(userId!),
    enabled: !!userId,
  })
}
// --- Used in SettingsPage ---
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: Omit<PasswordChangeInput, 'confirm_new_password'>) => changePassword(data),
  })
}