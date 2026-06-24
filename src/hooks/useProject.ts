import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  unassignUser,
  assignManager,
  assignWorker,
  createPhase,
  updatePhase,
} from "@/services/project";
import type { ProjectCreate, ProjectUpdate, ProjectDetailResponse, PhaseCreate, PhaseUpdate, AssignUserRequest } from "@/validations/project";


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
  return useQuery<ProjectDetailResponse>({
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

export const useDeleteProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: number) => deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export const useUnassignUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, userId, type }: { projectId: number; userId: number; type: 'manager' | 'worker' }) =>
      unassignUser(projectId, userId, type),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'detail', projectId] })
    },
  })
}

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