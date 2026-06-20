import { useMutation } from "@tanstack/react-query";
//import { useRouter } from "next/navigation";
import { loginUser, getMe } from "@/services/auth";
//import { useAuthStore } from "@/store/auth";
import { saveToken } from "@/lib/token";
import { ROUTES } from "@/constants";
import type { LoginInput } from "@/validations/auth";


export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginInput) => loginUser(data),
    onSuccess: async (data) => {
      saveToken(data.access_token);
      const user = await getMe();
      setAuth(user, data.access_token);
      router.push(ROUTES.HOME);
    },
  });
};