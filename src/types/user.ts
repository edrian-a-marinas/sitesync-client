import type { UserResponse } from '@/validations/auth'

export type UserAssignment = {
  id: number
  name: string
  location: string
  status: string
  role: string
}

export interface UserListResponse {
  items: UserResponse[]
  total: number
  page: number
  page_size: number
}

export interface UsersSearch {
  page: number
  search: string
}