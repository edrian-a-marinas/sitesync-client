import { z } from "zod";

// --- Used in DashboardPage ---
export const ProjectResponseSchema = z.object({
  id: z.number(),
  owner_id: z.number(),
  name: z.string(),
  location: z.string(),
  total_budget: z.number(),
  start_date: z.string(),
  target_end_date: z.string(),
  status: z.string(),
  phases: z.array(z.lazy(() => PhaseResponseSchema)).optional(),
});

// --- Used in ProjectsPage ---
export const AssignedUserSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
})

export const ProjectDetailResponseSchema = ProjectResponseSchema.extend({
  managers: z.array(AssignedUserSchema).optional(),
  workers: z.array(AssignedUserSchema).optional(),
})

export const ProjectCreateSchema = z.object({
  name: z.string().min(1).max(100),
  location: z.string().min(1),
  total_budget: z.number().min(1).max(999_999_999_999_999),
  start_date: z.string().min(1),
  target_end_date: z.string().min(1),
  status: z.string().min(1),
});

export const ProjectUpdateSchema = ProjectCreateSchema;

export const PhaseResponseSchema = z.object({
  id: z.number(),
  project_id: z.number(),
  name: z.string(),
  allocated_budget: z.number(),
  status: z.string(),
});

export const PhaseCreateSchema = z.object({
  name: z.string().min(1).max(100),
  allocated_budget: z.number().min(0),
  status: z.string(),
});

export const PhaseUpdateSchema = PhaseCreateSchema;

export const AssignUserRequestSchema = z.object({
  user_id: z.number(),
});

// --- Inferred types ---
export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;

export type AssignedUser = z.infer<typeof AssignedUserSchema>;
export type ProjectDetailResponse = z.infer<typeof ProjectDetailResponseSchema>;
export type ProjectCreate = z.infer<typeof ProjectCreateSchema>;
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>;
export type PhaseResponse = z.infer<typeof PhaseResponseSchema>;
export type PhaseCreate = z.infer<typeof PhaseCreateSchema>;
export type PhaseUpdate = z.infer<typeof PhaseUpdateSchema>;
export type AssignUserRequest = z.infer<typeof AssignUserRequestSchema>;