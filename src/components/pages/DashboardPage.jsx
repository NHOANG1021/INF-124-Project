import '../../styles/pages/dashboard.css'

export function DashboardPage({
  weekPlan,
  selectedDay,
  todayKey,
  onSelectDay,
  activeDay,
  completedCount,
  onToggleTask,
  onIncrementTask,
  onDecrementTask,
  newTaskTitle,
  onNewTaskTitleChange,
  newTaskMode,
  onNewTaskModeChange,
  newTaskTarget,
  onNewTaskTargetChange,
  availableTaskExtensions,
  taskFeedback,
  onAddTask,
}) {
  const canAddTasks = availableTaskExtensions > 0

  return (
    <section className="dashboard-layout">
      <div className="section-header">
        <p className="section-kicker">Planner</p>
        <h2>7 Day Task Calendar</h2>
      </div>

      <div className="stats-strip">
        <article className="stat-card">
          <strong>{completedCount}</strong>
          <span>Completed tasks this week</span>
        </article>
        <article className="stat-card">
          <strong>{activeDay.tasks.length}</strong>
          <span>Tasks scheduled for {activeDay.fullLabel}</span>
        </article>
        <article className="stat-card">
          <strong>{activeDay.fullLabel}</strong>
          <span>Active planning day</span>
        </article>
        <article className="stat-card">
          <strong>{availableTaskExtensions}</strong>
          <span>Custom task slot{availableTaskExtensions === 1 ? '' : 's'} available</span>
        </article>
      </div>

      <div className="calendar-grid">
        {weekPlan.map((day) => {
          const doneCount = day.tasks.filter((t) => t.progress >= t.target).length
          return (
            <button
              key={day.key}
              className={
                selectedDay === day.key
                  ? 'day-card is-active'
                  : day.key === todayKey
                    ? 'day-card is-today'
                    : 'day-card'
              }
              onClick={() => onSelectDay(day.key)}
            >
              <span>{day.label}</span>
              <strong>{day.fullLabel}</strong>
              <small>
                {doneCount}/{day.tasks.length} done
              </small>
            </button>
          )
        })}
      </div>

      <div className="planner-grid">
        <section className="planner-panel">
          <div className="panel-heading">
            <div>
              <h3>{activeDay.fullLabel} Schedule</h3>
              <p>Check off tasks or count progress to earn coins and XP.</p>
            </div>
          </div>

          <div className="task-stack">
            {activeDay.tasks.map((task) => (
              <article key={task.id} className="task-card">
                <div className="task-main">
                  <div>
                    <h4>{task.title}</h4>
                    <p>
                      Reward: {task.coinReward} coins + {task.xpReward} XP
                    </p>
                  </div>
                  {task.mode === 'check' ? (
                    <label className="checkbox-pill">
                      <input
                        type="checkbox"
                        checked={task.progress >= task.target}
                        onChange={() => onToggleTask(activeDay.key, task)}
                      />
                      <span>{task.progress >= task.target ? 'Done' : 'Mark Done'}</span>
                    </label>
                  ) : (
                    <div className="counter-pill">
                      <button type="button" onClick={() => onDecrementTask(activeDay.key, task)}>
                        -
                      </button>
                      <span>
                        {task.progress}/{task.target}
                      </span>
                      <button type="button" onClick={() => onIncrementTask(activeDay.key, task)}>
                        +
                      </button>
                    </div>
                  )}
                </div>
                <div className="task-progress-bar">
                  <span style={{ width: `${(task.progress / task.target) * 100}%` }} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="planner-panel planner-side">
          <div className="panel-heading">
            <div>
              <h3>Add Daily or Task</h3>
              <p>
                {canAddTasks
                  ? 'Spend one Task Extension to add one custom task to the selected day.'
                  : 'Buy a Task Extension in the store to add one custom task slot.'}
              </p>
            </div>
          </div>

          {taskFeedback && <p className="store-feedback">{taskFeedback}</p>}

          <div className="task-form">
            <label>
              Task Title
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => onNewTaskTitleChange(e.target.value)}
                placeholder="e.g. Finish lab report"
                disabled={!canAddTasks}
              />
            </label>

            <label>
              Tracking Type
              <select
                value={newTaskMode}
                onChange={(e) => onNewTaskModeChange(e.target.value)}
                disabled={!canAddTasks}
              >
                <option value="check">Checkbox</option>
                <option value="count">Count Goal</option>
              </select>
            </label>

            {newTaskMode === 'count' && (
              <label>
                Target Count
                <input
                  type="number"
                  min="1"
                  value={newTaskTarget}
                  onChange={(e) => onNewTaskTargetChange(Number(e.target.value))}
                  disabled={!canAddTasks}
                />
              </label>
            )}

            <button
              type="button"
              className="primary-btn full-width"
              onClick={onAddTask}
              disabled={!canAddTasks}
            >
              Add To {activeDay.fullLabel}
            </button>
          </div>
        </aside>
      </div>
    </section>
  )
}
