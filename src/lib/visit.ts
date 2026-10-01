import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

const VISIT_KEY = 'symply-next-visit'

export interface NextVisit {
    date: string // 'YYYY-MM-DD' in the device's local time
    note?: string
}

function isValidDate(s: unknown): s is string {
    return (
        typeof s === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(s) &&
        !Number.isNaN(new Date(s + 'T00:00:00').getTime())
    )
}

// Local calendar date (not UTC), so early-morning check-ins in Korea
// are not shifted to the previous day.
export function localDateId(d: Date = new Date()): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

// Days from today (local) until the given date. 0 = today, negative = past.
export function daysUntil(dateStr: string, from: Date = new Date()): number {
    const target = new Date(dateStr + 'T00:00:00')
    const start = new Date(from.getFullYear(), from.getMonth(), from.getDate())
    return Math.round((target.getTime() - start.getTime()) / 86400000)
}

function getLocalVisit(): NextVisit | null {
    try {
        const raw = localStorage.getItem(VISIT_KEY)
        if (!raw) return null
        const v = JSON.parse(raw) as NextVisit
        return v && isValidDate(v.date) ? v : null
    } catch {
        return null
    }
}

export async function getNextVisit(uid?: string): Promise<NextVisit | null> {
    const local = getLocalVisit()
    if (!uid) return local
    try {
        const snap = await getDoc(doc(db, 'users', uid))
        const remote = snap.data()?.nextVisit as NextVisit | undefined
        if (remote && isValidDate(remote.date)) {
            localStorage.setItem(VISIT_KEY, JSON.stringify(remote))
            return remote
        }
    } catch {
        /* fall back to local value */
    }
    return local
}

export async function saveNextVisit(visit: NextVisit, uid?: string): Promise<void> {
    // Firestore rejects `undefined` values, so only include note when present.
    const clean: NextVisit = visit.note?.trim()
        ? { date: visit.date, note: visit.note.trim() }
        : { date: visit.date }
    localStorage.setItem(VISIT_KEY, JSON.stringify(clean))
    if (!uid) return
    await setDoc(doc(db, 'users', uid), { nextVisit: clean }, { merge: true })
}

export async function clearNextVisit(uid?: string): Promise<void> {
    localStorage.removeItem(VISIT_KEY)
    if (!uid) return
    await setDoc(doc(db, 'users', uid), { nextVisit: null }, { merge: true })
}