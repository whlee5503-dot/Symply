import { useState, useEffect } from 'react'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { getLogs } from '../lib/storage'
import type { LogEntry } from '../types'

function isMockData(): boolean {
  try {
    const raw = localStorage.getItem('symply-logs')
    if (!raw) return false
    const logs = JSON.parse(raw) as Record<string, LogEntry>
    const first = Object.values(logs)[0]
    return first?.userId === 'mock-user'
  } catch { return false }
}

export function useFirestoreLogs(uid: string | null | undefined) {
  const [logs,    setLogs]    = useState<Record<string, LogEntry>>(getLogs())
  const [loading, setLoading] = useState(!!uid && !isMockData())

  useEffect(() => {
    // mock 데이터가 주입된 상태면 localStorage 우선 사용
    if (isMockData()) {
      setLogs(getLogs())
      setLoading(false)
      return
    }

    if (!uid) {
      setLogs(getLogs())
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    async function fetch() {
      try {
        const q    = query(
          collection(db, 'logs', uid!, 'entries'),
          orderBy('id', 'desc')
        )
        const snap = await getDocs(q)

        if (cancelled) return

        if (!snap.empty) {
          const firestoreLogs: Record<string, LogEntry> = {}
          snap.docs.forEach(d => {
            const entry = d.data() as LogEntry
            firestoreLogs[entry.id] = entry
          })
          setLogs(firestoreLogs)
        } else {
          setLogs(getLogs())
        }
      } catch {
        if (!cancelled) setLogs(getLogs())
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [uid])

  return { logs, loading }
}
