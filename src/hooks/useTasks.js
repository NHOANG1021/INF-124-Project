import { useCallback, useMemo, useRef, useState } from 'react'
import { DAY_KEYS } from '../constants/data'
import { buildWeekTemplate, createTask } from '../utils/task'

export function useTasks(applyReward) {
  const todayKey = DAY_KEYS[new Date().getDay()] ?? 'mon'

  const [weekPlan, setWeekPlan] = useState(buildWeekTemplate)
  const [selectedDay, setSelectedDay] = useState(todayKey)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskMode, setNewTaskMode] = useState('check')
  const [newTaskTarget, setNewTaskTarget] = useState(1)

  const activeDay = useMemo(
    () => weekPlan.find((d) => d.key === selectedDay) ?? weekPlan[0],
    [weekPlan, selectedDay],
  )

  const completedCount = useMemo(
    () =>
      weekPlan.reduce(
        (sum, day) =>
          sum + day.tasks.filter((t) => t.progress >= t.target).length,
        0,
      ),
    [weekPlan],
  )

  // Ref lets us smuggle the reward delta out of the setState updater.
  // React calls functional setState updaters synchronously during the same
  // call stack, so the ref is populated before applyReward executes below.
  const pendingReward = useRef({ coins: 0, xp: 0 })

  const updateTask = useCallback(
    (dayKey, taskId, updater) => {
      pendingReward.current = { coins: 0, xp: 0 }

      setWeekPlan((plan) =>
        plan.map((day) => {
          if (day.key !== dayKey) return day
          return {
            ...day,
            tasks: day.tasks.map((task) => {
              if (task.id !== taskId) return task
              const next = updater(task)

              if (!task.rewarded && next.rewarded) {
                pendingReward.current.coins += next.coinReward
                pendingReward.current.xp += next.xpReward
              } else if (task.rewarded && !next.rewarded) {
                pendingReward.current.coins -= next.coinReward
                pendingReward.current.xp -= next.xpReward
              }

              return next
            }),
          }
        }),
      )

      const { coins, xp } = pendingReward.current
      if (coins !== 0 || xp !== 0) {
        applyReward(coins, xp)
      }
    },
    [applyReward],
  )

  const toggleTask = useCallback(
    (dayKey, task) => {
      updateTask(dayKey, task.id, (t) => {
        const nextProgress = t.progress >= t.target ? 0 : t.target
        return { ...t, progress: nextProgress, rewarded: nextProgress >= t.target }
      })
    },
    [updateTask],
  )

  const incrementTask = useCallback(
    (dayKey, task) => {
      updateTask(dayKey, task.id, (t) => {
        const nextProgress = Math.min(t.progress + 1, t.target)
        return {
          ...t,
          progress: nextProgress,
          rewarded: t.rewarded || nextProgress >= t.target,
        }
      })
    },
    [updateTask],
  )

  const decrementTask = useCallback(
    (dayKey, task) => {
      updateTask(dayKey, task.id, (t) => {
        const nextProgress = Math.max(t.progress - 1, 0)
        return { ...t, progress: nextProgress, rewarded: nextProgress >= t.target }
      })
    },
    [updateTask],
  )

  const addTaskToDay = useCallback(() => {
    const trimmed = newTaskTitle.trim()
    if (!trimmed) return

    const target = newTaskMode === 'check' ? 1 : Math.max(1, Number(newTaskTarget) || 1)
    const task = createTask(
      trimmed,
      newTaskMode,
      target,
      newTaskMode === 'check' ? 18 : 24,
      newTaskMode === 'check' ? 10 : 14,
    )

    setWeekPlan((plan) =>
      plan.map((day) =>
        day.key === selectedDay ? { ...day, tasks: [...day.tasks, task] } : day,
      ),
    )

    setNewTaskTitle('')
    setNewTaskMode('check')
    setNewTaskTarget(1)
  }, [newTaskTitle, newTaskMode, newTaskTarget, selectedDay])

  return {
    todayKey,
    weekPlan,
    selectedDay,
    setSelectedDay,
    activeDay,
    completedCount,
    newTaskTitle,
    setNewTaskTitle,
    newTaskMode,
    setNewTaskMode,
    newTaskTarget,
    setNewTaskTarget,
    toggleTask,
    incrementTask,
    decrementTask,
    addTaskToDay,
  }
}