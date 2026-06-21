import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/services/project";

export const useProjects = (status?: string) => {
  return useQuery({
    queryKey: ["projects", status ?? "all"],
    queryFn: async () => {
      const data = await getProjects(status);
      console.log("[useProjects] fetched:", data);
      return data;
    },
  });
};