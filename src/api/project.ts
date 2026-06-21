import api from "@/lib/axios";
export const getProjectsRequest = (status?: string) =>
  api.get("/projects", { params: status ? { status } : undefined });