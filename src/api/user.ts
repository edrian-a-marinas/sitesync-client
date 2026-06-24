import api from "@/lib/axios";

export const getUsersRequest = () =>
  api.get("/users");