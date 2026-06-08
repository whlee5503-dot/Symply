import { useState, useEffect } from 'react'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { getLogs } from '../lib/storage'
import type { LogEntry } from '../types'

/**
 * Fetches logs from Firestore when logged in,
 * falls back to localStorage when logged out.
 * Returns { logs: Record<string,LogEntry>, loading }
 */
export function useFirestoreLogs(uid: string | null | undefined) {
  const [logs,    setLogs]    = useState<Record<string, LogEntry>>(getLogs())
  const [loading, setLoading] = useState(!!uid)

  useEffect(() => {
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
          // Firestore 비어있으면 localStorage fallback
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
