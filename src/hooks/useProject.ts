import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  assignManager,
  assignWorker,
  createPhase,
  updatePhase,
} from "@/services/project";
import type { ProjectCreate, ProjectUpdate, PhaseCreate, PhaseUpdate, AssignUserRequest } from "@/validations/project";


// --- Used in ProjectsPage ---
export const useProjects = (status?: string) => {
  return useQuery({
    queryKey: ["projects", status ?? "all"],
    queryFn: async () => {
      const data = await getProjects(status);
      return data;
    },
  });
};

// --- Used in ProjectsPage ---
export const useProject = (projectId: number | null) => {
  return useQuery({
    queryKey: ["projects", "detail", projectId],
    queryFn: async () => getProjectById(projectId as number),
    enabled: projectId !== null,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectCreate) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: ProjectUpdate }) => updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useAssignManager = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: AssignUserRequest }) => assignManager(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useAssignWorker = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: AssignUserRequest }) => assignWorker(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useCreatePhase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: PhaseCreate }) => createPhase(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["projects", "detail", projectId] });
    },
  });
};

export const useUpdatePhase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, phaseId, data }: { projectId: number; phaseId: number; data: PhaseUpdate }) =>
      updatePhase(projectId, phaseId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["projects", "detail", projectId] });
    },
  });
};