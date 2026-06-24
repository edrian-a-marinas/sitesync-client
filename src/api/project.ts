import api from "@/lib/axios";
import type { ProjectCreate, ProjectUpdate, PhaseCreate, PhaseUpdate, AssignUserRequest } from "@/validations/project";

// --- Used in DashboardPage ---
export const getProjectsRequest = (status?: string) =>
  api.get("/projects", { params: status ? { status } : undefined });

// --- Used in ProjectsPage ---
export const getProjectByIdRequest = (projectId: number) =>
  api.get(`/projects/${projectId}`);

export const createProjectRequest = (data: ProjectCreate) =>
  api.post("/projects", data);

export const updateProjectRequest = (projectId: number, data: ProjectUpdate) =>
  api.patch(`/projects/${projectId}`, data);

export const assignManagerRequest = (projectId: number, data: AssignUserRequest) =>
  api.post(`/projects/${projectId}/assign-manager`, data);

export const assignWorkerRequest = (projectId: number, data: AssignUserRequest) =>
  api.post(`/projects/${projectId}/assign-worker`, data);

export const createPhaseRequest = (projectId: number, data: PhaseCreate) =>
  api.post(`/projects/${projectId}/phases`, data);

export const updatePhaseRequest = (projectId: number, phaseId: number, data: PhaseUpdate) =>
  api.patch(`/projects/${projectId}/phases/${phaseId}`, data);