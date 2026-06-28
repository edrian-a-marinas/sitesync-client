export interface AIQueryRequest {
  question: string
  project_id?: number | null
}

export interface AIQueryResponse {
  id: number
  user_id: number
  project_id: number | null
  question: string
  answer: string | null
  status: 'Pending' | 'Done' | 'Failed'
}