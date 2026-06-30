import { ROLES } from '@/constants'

export const getRoleLabel = (role_id: number): string => {
  switch (role_id) {
    case ROLES.OWNER:
      return 'Owner'
    case ROLES.PROJECT_MANAGER:
      return 'Project Manager'
    case ROLES.SITE_WORKER:
      return 'Site Worker'
    default:
      return 'Unknown'
  }
}
