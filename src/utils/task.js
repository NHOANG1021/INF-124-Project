/**
 * Creates a task object with a unique id.
 */
export function createTask(title, mode, target, coinReward, xpReward) {
  return {
    id: `${title}-${mode}-${target}-${coinReward}-${xpReward}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    title,
    mode,
    target,
    progress: 0,
    rewarded: false,
    coinReward,
    xpReward,
  }
}

/**
 * The default week template, built once at module load time.
 * Using a factory function so each app instance gets its own copy
 * (prevents shared mutable state in tests / HMR).
 */
export function buildWeekTemplate() {
  return [
    {
      key: 'mon',
      label: 'Mon',
      fullLabel: 'Monday',
      tasks: [
        createTask('Review lecture notes', 'check', 1, 18, 10),
        createTask('Drink water', 'count', 6, 18, 12),
      ],
    },
    {
      key: 'tue',
      label: 'Tue',
      fullLabel: 'Tuesday',
      tasks: [
        createTask('Study for 45 minutes', 'check', 1, 20, 14),
        createTask('Finish 3 focused work blocks', 'count', 3, 15, 12),
      ],
    },
    {
      key: 'wed',
      label: 'Wed',
      fullLabel: 'Wednesday',
      tasks: [
        createTask('Workout or long walk', 'check', 1, 18, 10),
        createTask('Reply to important messages', 'check', 1, 12, 8),
      ],
    },
    {
      key: 'thu',
      label: 'Thu',
      fullLabel: 'Thursday',
      tasks: [
        createTask('Read chapter notes', 'check', 1, 16, 8),
        createTask('Clean up workspace', 'check', 1, 12, 8),
      ],
    },
    {
      key: 'fri',
      label: 'Fri',
      fullLabel: 'Friday',
      tasks: [
        createTask('Finish weekly priority task', 'check', 1, 24, 16),
        createTask('Plan next week tasks', 'check', 1, 16, 10),
      ],
    },
    {
      key: 'sat',
      label: 'Sat',
      fullLabel: 'Saturday',
      tasks: [
        createTask('Laundry', 'check', 1, 14, 8),
        createTask('Reset room or desk', 'check', 1, 14, 8),
      ],
    },
    {
      key: 'sun',
      label: 'Sun',
      fullLabel: 'Sunday',
      tasks: [
        createTask('Weekly reset', 'check', 1, 22, 12),
        createTask('Rest and recharge', 'check', 1, 10, 6),
      ],
    },
  ]
}
