import { useCallback, useEffect, useMemo, useState } from 'react'
import { DAY_KEYS } from '../constants/data'
import { buildWeekTemplate, createTask } from '../utils/task'

function getTaskStorageKey(profileKey) {
  return `gametask:week-plan:${profileKey}`
}

export function useTasks(applyReward, profileKey) {
  const todayKey = DAY_KEYS[new Date().getDay()] ?? 'mon'

  const [weekPlan, setWeekPlan] = useState(() => buildWeekTemplate())
  const [selectedDay, setSelectedDay] = useState(todayKey)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskMode, setNewTaskMode] = useState('check')
  const [newTaskTarget, setNewTaskTarget] = useState(1)
  const [taskFeedback, setTaskFeedback] = useState('')

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

  // Compute reward deltas deterministically from the current weekPlan and
  // apply them immediately after updating state. This avoids relying on
  // refs and any assumptions about when React executes functional updaters.
  const updateTask = useCallback(
    (dayKey, taskId, updater) => {
      const pending = { coins: 0, xp: 0 }

      const newPlan = weekPlan.map((day) => {
        if (day.key !== dayKey) return day
        return {
          ...day,
          tasks: day.tasks.map((task) => {
            if (task.id !== taskId) return task
            const next = updater(task)

            if (!task.rewarded && next.rewarded) {
              pending.coins += next.coinReward
              pending.xp += next.xpReward
            } else if (task.rewarded && !next.rewarded) {
              pending.coins -= next.coinReward
              pending.xp -= next.xpReward
            }

            return next
          }),
        }
      })

      setWeekPlan(newPlan)

      if (pending.coins !== 0 || pending.xp !== 0) {
        applyReward(pending.coins, pending.xp)
      }
    },
    [weekPlan, applyReward],
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
    setTaskFeedback(`${task.title} added to ${activeDay.fullLabel}.`)

    setNewTaskTitle('')
    setNewTaskMode('check')
    setNewTaskTarget(1)
  }, [
    newTaskTitle,
    newTaskMode,
    newTaskTarget,
    selectedDay,
    activeDay.fullLabel,
  ])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const savedWeekPlan = window.localStorage.getItem(getTaskStorageKey(profileKey))
      if (savedWeekPlan) {
        setWeekPlan(JSON.parse(savedWeekPlan))
      } else {
        setWeekPlan(buildWeekTemplate())
      }
    } catch (error) {
      console.error('Error loading saved tasks:', error)
      setWeekPlan(buildWeekTemplate())
    }

    setSelectedDay(todayKey)
    setTaskFeedback('')
    setNewTaskTitle('')
    setNewTaskMode('check')
    setNewTaskTarget(1)
  }, [profileKey, todayKey])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(
        getTaskStorageKey(profileKey),
        JSON.stringify(weekPlan),
      )
    } catch (error) {
      console.error('Error saving tasks:', error)
    }
  }, [profileKey, weekPlan])

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
    taskFeedback,
    toggleTask,
    incrementTask,
    decrementTask,
    addTaskToDay,
  }
}
