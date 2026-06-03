import { useEffect, useMemo, useRef, useState } from 'react'
import { notifications as seedNotifications } from '../constants/data'

const claimedSessionStreakIds = new Set()
const shownSessionStreakIds = new Set()

export function useNotifications(
  weekPlan,
  todayKey,
  isEnabled = true,
  applyReward = () => {},
) {
  const [staticNotifications, setStaticNotifications] = useState(() =>
    seedNotifications.map((item) => ({ ...item })),
  )
  const [readIds, setReadIds] = useState([])
  const [dismissedReminderIds, setDismissedReminderIds] = useState([])
  const [popupNotification, setPopupNotification] = useState(null)
  const lastBrowserNoticeRef = useRef('')
  const loginReminderShownRef = useRef('')

  const todayPlan = useMemo(
    () => weekPlan.find((day) => day.key === todayKey) ?? null,
    [weekPlan, todayKey],
  )

  const reminderNotification = useMemo(() => {
    if (!todayPlan || todayPlan.tasks.length === 0) return null

    const remainingTasks = todayPlan.tasks.filter(
      (task) => task.progress < task.target,
    )

    if (remainingTasks.length === 0) return null

    const preview = remainingTasks
      .slice(0, 2)
      .map((task) => task.title)
      .join(', ')

    const key = `daily-reminder-${todayPlan.key}:${remainingTasks
      .map((task) => `${task.id}:${task.progress}/${task.target}`)
      .join('|')}`

    const reminderId = `daily-reminder-${todayPlan.key}`
    if (dismissedReminderIds.includes(reminderId)) return null

    return {
      id: reminderId,
      key,
      type: 'reminder',
      title: `Finish your ${todayPlan.fullLabel} tasks`,
      body:
        remainingTasks.length === 1
          ? `You still need to complete "${remainingTasks[0].title}" today.`
          : `You still have ${remainingTasks.length} tasks left today, including ${preview}.`,
      unread: !readIds.includes(reminderId),
      dismissible: true,
    }
  }, [dismissedReminderIds, readIds, todayPlan])

  const streakNotification = useMemo(() => {
    const totalTasks = weekPlan.reduce((sum, day) => sum + day.tasks.length, 0)
    if (totalTasks === 0) return null

    const allCompleted = weekPlan.every((day) =>
      day.tasks.every((task) => task.progress >= task.target),
    )

    if (!allCompleted) return null

    const streakId = `weekly-streak-${weekPlan
      .map((day) => `${day.key}:${day.tasks.map((task) => `${task.id}:${task.target}`).join(',')}`)
      .join('|')}`

    return {
      id: streakId,
      key: streakId,
      type: 'streak',
      title: 'Weekly streak complete',
      body: 'You finished every task this week and earned 50 coins plus 100 XP.',
      unread: !readIds.includes(streakId),
      dismissible: false,
      reward: { coins: 50, xp: 100 },
    }
  }, [readIds, weekPlan])

  const items = useMemo(() => {
    const dynamic = [
      ...(reminderNotification ? [reminderNotification] : []),
      ...(streakNotification ? [streakNotification] : []),
    ]
    return [...dynamic, ...staticNotifications]
  }, [reminderNotification, staticNotifications, streakNotification])

  const markAsRead = (id, key = id) => {
    if (id.startsWith('daily-reminder-') || id.startsWith('weekly-streak-')) {
      setReadIds((current) => (current.includes(id) ? current : [...current, id]))
      setPopupNotification((current) => (current?.id === id ? null : current))
      return
    }

    setStaticNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    )
  }

  const turnOffNotification = (id, key = id) => {
    if (!id.startsWith('daily-reminder-')) return

    setDismissedReminderIds((current) =>
      current.includes(id) ? current : [...current, id],
    )
    setPopupNotification((current) => (current?.id === id ? null : current))
  }

  useEffect(() => {
    if (!streakNotification) return
    if (claimedSessionStreakIds.has(streakNotification.id)) return

    claimedSessionStreakIds.add(streakNotification.id)
    applyReward(streakNotification.reward.coins, streakNotification.reward.xp)
    setPopupNotification(streakNotification)
  }, [applyReward, streakNotification])

  useEffect(() => {
    if (!isEnabled) {
      return
    }

    if (!streakNotification || !streakNotification.unread) return
    if (shownSessionStreakIds.has(streakNotification.id)) return

    shownSessionStreakIds.add(streakNotification.id)
    setPopupNotification(streakNotification)
  }, [isEnabled, streakNotification])

  useEffect(() => {
    if (!isEnabled || !reminderNotification) return
    if (typeof window === 'undefined' || typeof Notification === 'undefined') return
    if (Notification.permission !== 'granted') return

    const reminderKey = reminderNotification.key
    if (lastBrowserNoticeRef.current === reminderKey) return

    lastBrowserNoticeRef.current = reminderKey
    const notification = new Notification(reminderNotification.title, {
      body: reminderNotification.body,
    })

    window.setTimeout(() => notification.close(), 5000)
  }, [isEnabled, reminderNotification])

  useEffect(() => {
    if (!isEnabled) return
    if (typeof window === 'undefined' || typeof Notification === 'undefined') return
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }, [isEnabled])

  useEffect(() => {
    if (!isEnabled) {
      loginReminderShownRef.current = ''
      setPopupNotification(null)
      return
    }

    if (streakNotification?.unread) {
      return
    }

    if (!reminderNotification || !reminderNotification.unread) {
      setPopupNotification((current) =>
        current?.type === 'reminder' ? null : current,
      )
      return
    }

    if (loginReminderShownRef.current === reminderNotification.key) return

    loginReminderShownRef.current = reminderNotification.key
    setPopupNotification(reminderNotification)
  }, [isEnabled, reminderNotification])

  return {
    items,
    reminderNotification,
    streakNotification,
    popupNotification,
    closePopup: () => setPopupNotification(null),
    markAsRead,
    turnOffNotification,
  }
}
