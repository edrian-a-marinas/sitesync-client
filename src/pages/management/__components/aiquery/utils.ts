import { useState, useEffect } from 'react'
export interface ScopeMarker {
  id: string
  timestamp: number
  projectName: string
}
export const SUGGESTED_QUESTIONS = [
  'Which project has the highest budget overrun risk?',
  'How many incidents are still open across all projects?',
  'What is the material cost trend for Sta. Mesa this month?',
]

export type ParsedAnswer =
  | { type: 'rate_limit'; retryAfter: number }
  | { type: 'timeout' }
  | { type: 'error' }
  | { type: 'ok'; text: string }

export function parseAnswer(answer: string | null): ParsedAnswer | null {
  if (!answer) return null
  if (answer.startsWith('RATE_LIMIT:')) {
    const seconds = parseInt(answer.split(':')[1], 10)
    return { type: 'rate_limit', retryAfter: isNaN(seconds) ? 60 : seconds }
  }
  if (answer === 'TIMEOUT') return { type: 'timeout' }
  if (answer === 'ERROR') return { type: 'error' }
  return { type: 'ok', text: answer }
}

export function useCountdown(until: number | null) {
  const [left, setLeft] = useState(0)
  useEffect(() => {
    if (!until) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets countdown when timer target is cleared
      setLeft(0)
      return
    }
    const tick = () =>
      setLeft(Math.max(0, Math.ceil((until - Date.now()) / 1000)))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [until])
  return left
}

export function formatCooldown(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}
