import {
  getProjectsRequest,
  getProjectByIdRequest,
  createProjectRequest,
  updateProjectRequest,
  deleteProjectRequest,
  unassignUserRequest,
  assignManagerRequest,
  assignWorkerRequest,
  createPhaseRequest,
  updatePhaseRequest,
} from "@/api/project";
import type {
  ProjectResponse,
  ProjectDetailResponse,
  ProjectCreate,
  ProjectUpdate,
  PhaseResponse,
  PhaseCreate,
  PhaseUpdate,
  AssignUserRequest,
} from "@/validations/project";

// --- Used in DashboardPage ---
export const getProjects = async (status?: string): Promise<ProjectResponse[]> => {
  const response = await getProjectsRequest(status);
  return response.data;
};

// --- Used in ProjectsPage ---
export const getProjectById = async (projectId: number): Promise<ProjectResponse> => {
  const response = await getProjectByIdRequest(projectId);
  return response.data;
};

export const createProject = async (data: ProjectCreate): Promise<ProjectResponse> => {
  const response = await createProjectRequest(data);
  return response.data;
};

export const updateProject = async (projectId: number, data: ProjectUpdate): Promise<ProjectResponse> => {
  const response = await updateProjectRequest(projectId, data);
  return response.data;
};

export const deleteProject = async (projectId: number): Promise<void> => {
  await deleteProjectRequest(projectId)
}

export const assignManager = async (projectId: number, data: AssignUserRequest): Promise<{ message: string }> => {
  const response = await assignManagerRequest(projectId, data);
  return response.data;
};

export const unassignUser = async (projectId: number, userId: number, type: 'manager' | 'worker'): Promise<void> => {
  await unassignUserRequest(projectId, userId, type)
}

export const assignWorker = async (projectId: number, data: AssignUserRequest): Promise<{ message: string }> => {
  const response = await assignWorkerRequest(projectId, data);
  return response.data;
};

export const createPhase = async (projectId: number, data: PhaseCreate): Promise<PhaseResponse> => {
  const response = await createPhaseRequest(projectId, data);
  return response.data;
};

export const updatePhase = async (projectId: number, phaseId: number, data: PhaseUpdate): Promise<PhaseResponse> => {
  const response = await updatePhaseRequest(projectId, phaseId, data);
  return response.data;
};

// --- Used in ManageUsersPage ---
export const getProjectDetail = async (projectId: number): Promise<ProjectDetailResponse> => {
  const response = await getProjectByIdRequest(projectId);
  return response.data;
};