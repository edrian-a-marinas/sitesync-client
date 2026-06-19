import { ROLES } from "@/app/constants";

type RoleValue = (typeof ROLES)[keyof typeof ROLES];

export const isOwner = (role_id: RoleValue): boolean =>
  role_id === ROLES.OWNER;

export const isManagerOrAbove = (role_id: RoleValue): boolean =>
  role_id === ROLES.OWNER || role_id === ROLES.PROJECT_MANAGER;

export const isSiteWorker = (role_id: RoleValue): boolean =>
  role_id === ROLES.SITE_WORKER;