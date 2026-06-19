import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ROUTES } from "@/app/constants";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (token) redirect(ROUTES.DASHBOARD);
  else redirect(ROUTES.LOGIN);
}