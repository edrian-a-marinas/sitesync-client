// --- Client-side route paths for Next.js navigation ---
export const ROUTES = {
  LOGIN: '/login',
  LOGIN_ADMIN: '/login/admin',
  REGISTER: '/register',

  // Owner and PM Pages
  HOME: '/home',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  WORKERS: '/workers',
  AI_ASSISTANT: '/ai-assistant',
  SETTINGS: '/settings',
  DAILY_LOGS: '/daily-logs',
  REPORTS: '/reports',
  MANAGE_USERS: '/manage-users',
  ANALYTICS: '/analytics',
  ATTENDANCE: '/attendance',

  // Worker Pages
  WORKER_DAILY_LOG: '/worker-daily-log',
} as const

// --- Used in ManageUsersPage ---
export const ROLE_LABEL: Record<number, string> = {
  1: 'Owner',
  2: 'Project Manager',
  3: 'Site Worker',
}

// --- Role IDs as seeded in the database — must match roles table ---
export const ROLES = {
  OWNER: 1,
  PROJECT_MANAGER: 2,
  SITE_WORKER: 3,
} as const
