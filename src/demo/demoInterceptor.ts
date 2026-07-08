// DEMO FEATURE: delete this entire file if demo mode is retired
import { toast } from 'sonner'
import type { AxiosError } from 'axios'

const DEMO_READONLY_MESSAGE =
  'Demo accounts are read-only. Owner demo can use AI Assistant, Analytics, and generate reports only.'

export function handleDemoWriteBlocked(error: AxiosError): boolean {
  const detail = (error.response?.data as { detail?: string })?.detail
  if (error.response?.status === 403 && detail === DEMO_READONLY_MESSAGE) {
    toast.error(DEMO_READONLY_MESSAGE)
    return true
  }
  return false
}
