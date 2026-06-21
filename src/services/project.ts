import { getProjectsRequest } from "@/api/project";
import type { ProjectResponse } from "@/validations/project";
export const getProjects = async (status?: string): Promise<ProjectResponse[]> => {
  const response = await getProjectsRequest(status);
  return response.data;
};