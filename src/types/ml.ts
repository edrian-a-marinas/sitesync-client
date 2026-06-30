export interface BudgetOverrunResult {
  project_id: number
  project_name: string
  overrun_probability: number
  is_over_budget: boolean
  total_budget: number
  total_spent: number
}

export interface DelayRiskResult {
  project_id: number
  project_name: string
  delay_risk_score: number
  risk_level: 'Low' | 'Medium' | 'High'
}

export interface MaterialForecastResult {
  project_id: number
  project_name: string
  forecast_month: number
  predicted_cost: number
}

export interface BudgetOverrunResponse {
  results: BudgetOverrunResult[]
}

export interface DelayRiskResponse {
  results: DelayRiskResult[]
}

export interface MaterialForecastResponse {
  results: MaterialForecastResult[]
}

export interface MLModelStatus {
  ready: boolean
  last_trained: string | null
}

export interface MLStatus {
  budget_overrun: MLModelStatus
  delay_risk: MLModelStatus
  material_forecast: MLModelStatus
}
