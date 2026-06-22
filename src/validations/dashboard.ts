import { z } from "zod";

// --- Owner ---
export const ProjectBudgetSummarySchema = z.object({
  project_id: z.number(),
  project_name: z.string(),
  total_budget: z.number(),
  actual_spending: z.number(),
  is_over_budget: z.boolean(),
});
export const MaterialWeeklyTrendSchema = z.object({
  week: z.string(),
  material_name: z.string(),
  total_quantity: z.number(),
});
export const OwnerDashboardSchema = z.object({
  total_active_projects: z.number(),
  total_budget: z.number(),
  total_spending: z.number(),
  over_budget_projects: z.array(ProjectBudgetSummarySchema),
  all_projects_budget: z.array(ProjectBudgetSummarySchema),
  material_trends: z.array(MaterialWeeklyTrendSchema),
  total_workers_active: z.number(),
  total_material_cost: z.number(),
  incidents_this_week: z.number(),
  total_active_projects_delta: z.number().nullable().optional(),
  total_spending_delta_percent: z.number().nullable().optional(),
  total_workers_active_delta: z.number().nullable().optional(),
  incidents_this_week_delta: z.number().nullable().optional(),
});
// --- Project Manager ---
export const PhaseBudgetSummarySchema = z.object({
  phase_id: z.number(),
  phase_name: z.string(),
  allocated_budget: z.number(),
  actual_spending: z.number(),
  is_over_budget: z.boolean(),
});
export const ProjectManagerDashboardSchema = z.object({
  project_id: z.number(),
  project_name: z.string(),
  logs_submitted: z.number(),
  attendance_rate: z.number(),
  total_material_cost: z.number(),
  total_incidents: z.number(),
  incidents_this_week: z.number(),
  open_incidents: z.number(),
  phases: z.array(PhaseBudgetSummarySchema),
  logs_submitted_delta: z.number().nullable().optional(),
  attendance_rate_delta: z.number().nullable().optional(),
  total_spending_delta_percent: z.number().nullable().optional(),
  incidents_this_week_delta: z.number().nullable().optional(),
});

export const ProjectManagerAggregateDashboardSchema = z.object({
  total_logs_submitted: z.number(),
  total_budget: z.number(),
  total_spending: z.number(),
  average_attendance_rate: z.number(),
  incidents_this_week: z.number(),
  over_budget_projects: z.array(ProjectBudgetSummarySchema),
  all_projects_budget: z.array(ProjectBudgetSummarySchema),
  material_trends: z.array(MaterialWeeklyTrendSchema),
  total_logs_submitted_delta: z.number().nullable().optional(),
  total_spending_delta_percent: z.number().nullable().optional(),
  average_attendance_rate_delta: z.number().nullable().optional(),
  incidents_this_week_delta: z.number().nullable().optional(),
});

// --- Worker ---
export const CurrentShiftLogSchema = z.object({
  log_id: z.number(),
  log_date: z.string(),
  work_accomplished: z.string(),
  weather_condition: z.string().nullable(),
});

export const WorkerDashboardSchema = z.object({
  worker_id: z.number(),
  worker_name: z.string(),
  assigned_project: z.string().nullable(),
  total_logs: z.number(),
  total_hours_worked: z.number(),
  current_shift_log: CurrentShiftLogSchema.nullable(),
});

// --- Inferred types ---
export type ProjectBudgetSummary = z.infer<typeof ProjectBudgetSummarySchema>;
export type MaterialWeeklyTrend = z.infer<typeof MaterialWeeklyTrendSchema>;
export type OwnerDashboard = z.infer<typeof OwnerDashboardSchema>;
export type PhaseBudgetSummary = z.infer<typeof PhaseBudgetSummarySchema>;
export type ProjectManagerDashboard = z.infer<typeof ProjectManagerDashboardSchema>;
export type ProjectManagerAggregateDashboard = z.infer<typeof ProjectManagerAggregateDashboardSchema>;
export type CurrentShiftLog = z.infer<typeof CurrentShiftLogSchema>;
export type WorkerDashboard = z.infer<typeof WorkerDashboardSchema>;