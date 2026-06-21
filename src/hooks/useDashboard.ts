import { useQuery } from "@tanstack/react-query";
import {
  getOwnerDashboard,
  getManagerDashboard,
  getManagerAggregateDashboard,
  getWorkerDashboard,
} from "@/services/dashboard";

export const useOwnerDashboard = () => {
  return useQuery({
    queryKey: ["dashboard", "owner"],
    queryFn: async () => {
      const data = await getOwnerDashboard();
      console.log("[useOwnerDashboard] fetched:", data);
      return data;
    },
  });
};

export const useManagerDashboard = (projectId: number | null) => {
  return useQuery({
    queryKey: ["dashboard", "manager", projectId],
    queryFn: async () => {
      const data = await getManagerDashboard(projectId as number);
      console.log("[useManagerDashboard] fetched:", data);
      return data;
    },
    enabled: projectId !== null,
  });
};

export const useManagerAggregateDashboard = () => {
  return useQuery({
    queryKey: ["dashboard", "manager", "aggregate"],
    queryFn: async () => {
      const data = await getManagerAggregateDashboard();
      console.log("[useManagerAggregateDashboard] fetched:", data);
      return data;
    },
  });
};

export const useWorkerDashboard = () => {
  return useQuery({
    queryKey: ["dashboard", "worker"],
    queryFn: async () => {
      const data = await getWorkerDashboard();
      console.log("[useWorkerDashboard] fetched:", data);
      return data;
    },
  });
};