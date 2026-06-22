const NOTIF_KEY = 'symply-notifications'

export interface NotificationSettings {
  enabled: boolean
  time: string  // "HH:MM" 24시간 형식
}

export function loadNotifSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(NOTIF_KEY)
    return raw ? JSON.parse(raw) : { enabled: false, time: '20:00' }
  } catch {
    return { enabled: false, time: '20:00' }
  }
}

export function saveNotifSettings(s: NotificationSettings) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(s))
}

export function isNotificationSupported(): boolean {
  return 'Notification' in window
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied'
  return Notification.requestPermission()
}

/** 오늘 알림 시간까지 남은 밀리초 (이미 지났으면 내일) */
function msUntilNext(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(h, m, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  return target.getTime() - now.getTime()
}

let _timerId: ReturnType<typeof setTimeout> | null = null

function scheduleNext(settings: NotificationSettings, title: string, body: string) {
  if (_timerId !== null) clearTimeout(_timerId)
  if (!settings.enabled || Notification.permission !== 'granted') return

  const ms = msUntilNext(settings.time)
  _timerId = setTimeout(async () => {
    // SW가 있으면 SW를 통해 발송 (백그라운드 포함)
    const reg = navigator.serviceWorker?.controller
      ? await navigator.serviceWorker.ready
      : null

    if (reg) {
      await reg.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'symply-checkin',
        renotify: true,
        data: { url: '/' },
      })
    } else {
      new Notification(title, { body, icon: '/icon-192.png' })
    }

    // 다음 날 스케줄
    scheduleNext(settings, title, body)
  }, ms)
}

/** App 시작 시 호출 — 알림 활성화돼 있으면 오늘/내일 알림 예약 */
export function initNotifications(title: string, body: string) {
  const settings = loadNotifSettings()
  if (!isNotificationSupported()) return
  if (!settings.enabled) return
  if (Notification.permission !== 'granted') return
  scheduleNext(settings, title, body)
}

/** Settings에서 토글/시간 변경 시 호출 */
export function applyNotifSettings(
  settings: NotificationSettings,
  title: string,
  body: string
) {
  saveNotifSettings(settings)
  if (!isNotificationSupported()) return
  if (!settings.enabled) {
    if (_timerId !== null) { clearTimeout(_timerId); _timerId = null }
    return
  }
  if (Notification.permission !== 'granted') return
  scheduleNext(settings, title, body)
}
