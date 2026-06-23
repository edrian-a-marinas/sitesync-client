import { useQuery } from "@tanstack/react-query";
import {
  getOwnerDashboard,
  getManagerDashboard,
  getManagerAggregateDashboard,
  getWorkerDashboard,
} from "@/services/dashboard";

export const useOwnerDashboard = (enabled: boolean = true, year?: number) => {
  return useQuery({
    queryKey: ["dashboard", "owner", year ?? "all"],
    queryFn: async () => {
      const data = await getOwnerDashboard(year);
      return data;
    },
    enabled,
  });
};

export const useManagerDashboard = (projectId: number | null) => {
  return useQuery({
    queryKey: ["dashboard", "manager", projectId],
    queryFn: async () => {
      const data = await getManagerDashboard(projectId as number);
      return data;
    },
    enabled: projectId !== null,
  });
};

export const useManagerAggregateDashboard = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["dashboard", "manager", "aggregate"],
    queryFn: async () => {
      const data = await getManagerAggregateDashboard();
      return data;
    },
    enabled,
  });
};

export const useWorkerDashboard = () => {
  return useQuery({
    queryKey: ["dashboard", "worker"],
    queryFn: async () => {
      const data = await getWorkerDashboard();
      return data;
    },
  });
};