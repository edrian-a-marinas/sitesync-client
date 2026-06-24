import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/services/user";
import type { UserResponse } from "@/validations/auth";

export const useUsersByRole = (roleId: number) => {
  return useQuery<UserResponse[]>({
    queryKey: ["users", roleId],
    queryFn: async () => {
      const users = await getUsers();
      return users.filter((u) => u.role_id === roleId && u.is_active);
    },
  });
};