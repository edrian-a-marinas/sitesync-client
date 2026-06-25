import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, updateUser, activateUser, deactivateUser, getUserAssignments } from "@/services/user";
import type { UserAssignment } from "@/types/user";
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
export const useUsers = (scope?: 'mine' | 'all') => {
  return useQuery<UserResponse[]>({
    queryKey: ["users", scope ?? 'all'],
    queryFn: async () => {
      const users = await getUsers(scope);
      return users;
    },
    placeholderData: (prev) => prev,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UserUpdateInput }) => {
      return updateUser(userId, data);
    },
    onSuccess: (updated) => {
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
    onSuccess: (updated) => {
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
    onSuccess: (updated) => {
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