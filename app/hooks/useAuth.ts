import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginUser, getMe } from "@/app/services/auth";
import { useAuthStore } from "@/app/store/auth";
import { saveToken } from "@/app/lib/token";
import { ROUTES } from "@/app/constants";
import type { LoginInput } from "@/app/validations/auth";


export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginInput) => loginUser(data),
    onSuccess: async (data) => {
      saveToken(data.access_token);
      const user = await getMe();
      setAuth(user, data.access_token);
      router.push(ROUTES.DASHBOARD);
    },
  });
};