import type { LogEntry } from '../types'

const LOGS_KEY = 'symply-logs'

// 전체 로그 불러오기
export function getLogs(): Record<string, LogEntry> {
  try {
    const raw = localStorage.getItem(LOGS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// 날짜별 로그 불러오기 (YYYY-MM-DD)
export function getLog(date: string): LogEntry | null {
  const logs = getLogs()
  return logs[date] ?? null
}

// 로그 저장
export function saveLog(entry: LogEntry): void {
  const logs = getLogs()
  logs[entry.id] = entry
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}

// 최근 N일 로그 불러오기
export function getRecentLogs(days: number): LogEntry[] {
  const logs = getLogs()
  return Object.values(logs)
    .sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime())
    .slice(0, days)
}

// 날짜 포맷 헬퍼 (오늘 = YYYY-MM-DD)
export function todayId(): string {
  return new Date().toISOString().split('T')[0]
}
