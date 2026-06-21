import { z } from "zod";
export const ProjectResponseSchema = z.object({
  id: z.number(),
  owner_id: z.number(),
  name: z.string(),
  location: z.string(),
  total_budget: z.number(),
  start_date: z.string(),
  target_end_date: z.string(),
  status: z.string(),
});
export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;