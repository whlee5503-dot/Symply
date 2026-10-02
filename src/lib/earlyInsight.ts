import type { LogEntry } from '../types'

export interface EarlyInsight {
    days: number
    avgPain: number
    avgFatigue: number
    peak: { date: string; pain: number; triggers: string[] } | null
}

const MIN_DAYS = 3
const MAX_DAYS = 14

function round1(n: number): number {
    return Math.round(n * 10) / 10
}

// Summarizes what was logged so far. Pure calculation on the device;
// returns null until there are enough days (and after the early period).
export function computeEarlyInsight(logs: Record<string, LogEntry>): EarlyInsight | null {
    const entries = Object.values(logs).filter(
        e => e && typeof e.pain === 'number' && typeof e.fatigue === 'number',
    )
    if (entries.length < MIN_DAYS || entries.length > MAX_DAYS) return null

    const avgPain = entries.reduce((s, e) => s + e.pain, 0) / entries.length
    const avgFatigue = entries.reduce((s, e) => s + e.fatigue, 0) / entries.length

    // Highest pain day; on a tie, the most recent date wins.
    const top = [...entries].sort((a, b) => b.pain - a.pain || b.id.localeCompare(a.id))[0]
    const peak =
        top.pain > 0
            ? {
                date: top.id,
                pain: top.pain,
                triggers: Object.entries(top.triggers ?? {})
                    .filter(([, on]) => on)
                    .map(([key]) => key)
                    .slice(0, 3),
            }
            : null

    return {
        days: entries.length,
        avgPain: round1(avgPain),
        avgFatigue: round1(avgFatigue),
        peak,
    }
}