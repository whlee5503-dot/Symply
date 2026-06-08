import {
  doc, setDoc, getDoc, collection,
  query, orderBy, limit, getDocs, Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import type { LogEntry } from '../types'

const LOGS_KEY = 'symply-logs'

export function todayId(): string {
  return new Date().toISOString().split('T')[0]
}

function getLocalLogs(): Record<string, LogEntry> {
  try {
    const raw = localStorage.getItem(LOGS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveLocalLog(entry: LogEntry): void {
  const logs = getLocalLogs()
  logs[entry.id] = entry
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}

export async function saveLog(entry: LogEntry, uid?: string): Promise<void> {
  saveLocalLog(entry)
  if (!uid) return
  const ref = doc(db, 'logs', uid, 'entries', entry.id)
  await setDoc(ref, {
    ...entry,
    createdAt: Timestamp.fromDate(new Date(entry.createdAt)),
    updatedAt: Timestamp.fromDate(new Date()),
  })
}

export async function getLog(date: string, uid?: string): Promise<LogEntry | null> {
  if (uid) {
    try {
      const snap = await getDoc(doc(db, 'logs', uid, 'entries', date))
      if (snap.exists()) return snap.data() as LogEntry
    } catch { /* fall through */ }
  }
  return getLocalLogs()[date] ?? null
}

export async function getRecentLogs(days: number, uid?: string): Promise<LogEntry[]> {
  if (uid) {
    try {
      const q    = query(collection(db, 'logs', uid, 'entries'), orderBy('id', 'desc'), limit(days))
      const snap = await getDocs(q)
      if (!snap.empty) return snap.docs.map(d => d.data() as LogEntry)
    } catch { /* fall through */ }
  }
  return Object.values(getLocalLogs())
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, days)
}

export function getLogs(): Record<string, LogEntry> {
  return getLocalLogs()
}

