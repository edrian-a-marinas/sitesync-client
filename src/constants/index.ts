// --- Client-side route paths for Next.js navigation ---
export const ROUTES = {
  LOGIN: "/login",
  LOGIN_ADMIN: "/login/admin",
  REGISTER: "/register",
  HOME: "/home",
  DASHBOARD: "/dashboard",
  PROJECTS: "/projects",
  WORKERS: "/workers",
  AI: "/ai",
  SETTINGS: "/settings",
  DAILY_LOGS: "/daily-logs",
  REPORTS: "/reports",
  MANAGE_USERS: "/manage-users",
  ANALYTICS: "/analytics",
  ATTENDANCE: "/attendance",
} as const;


// --- Role IDs as seeded in the database — must match roles table ---
export const ROLES = {
  OWNER: 1,
  PROJECT_MANAGER: 2,
  SITE_WORKER: 3,
} as const;