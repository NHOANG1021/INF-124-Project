import { useState } from 'react'

const navItems = [
  'Dashboard',
  'Store',
  'Leaderboard',
  'Profile',
  'Friends',
  'Notifications',
]

const friendList = [
  { name: 'PeterAnteater', level: 4, favorite: true },
  { name: 'TopTierDev', level: 10, favorite: false },
  { name: 'DataWiz', level: 20, favorite: true },
]

const requests = [
  { name: 'QuestCrafter', level: 12 },
  { name: 'PixelPilot', level: 8 },
]

const notifications = [
  {
    id: 1,
    type: 'challenge',
    title: 'Daily Challenge Updated',
    body: 'Finish 2 internship applications today.',
    unread: true,
  },
  {
    id: 2,
    type: 'friend',
    title: 'PeterAnteater sent you a friend request',
    body: 'Wants to add you as a friend.',
    unread: true,
  },
]

const storeItems = [
  {
    id: 1,
    category: 'Themes',
    title: 'Dark Theme',
    price: 500,
    art: 'moon',
    description: 'A midnight UI skin for deep-focus work sessions.',
  },
  {
    id: 2,
    category: 'Themes',
    title: 'Space Theme',
    price: 500,
    art: 'planet',
    description: 'A cosmic dashboard with brighter highlights and stars.',
  },
  {
    id: 3,
    category: 'Themes',
    title: 'Forest Theme',
    price: 500,
    art: 'forest',
    description: 'A calm woodland palette for a softer productivity mood.',
  },
  {
    id: 4,
    category: 'Powerups',
    title: 'Double XP',
    price: 1000,
    art: 'xp',
    description: 'Boost rewards for the next streak of completed tasks.',
  },
  {
    id: 5,
    category: 'Powerups',
    title: 'Task Extension',
    price: 750,
    art: 'calendar',
    description: 'Use one extension token when you need extra time.',
  },
  {
    id: 6,
    category: 'Powerups',
    title: 'Custom Avatar',
    price: 1200,
    art: 'avatar',
    description: 'Unlock a personalized profile look and badge frame.',
  },
]

const starterCart = []
const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const weekTemplate = [
  {
    key: 'mon',
    label: 'Mon',
    fullLabel: 'Monday',
    tasks: [
      createTask('Math homework', 'check', 1, 18, 10),
      createTask('Drink water', 'count', 8, 24, 12),
    ],
  },
  {
    key: 'tue',
    label: 'Tue',
    fullLabel: 'Tuesday',
    tasks: [
      createTask('Study 45 minutes', 'check', 1, 20, 14),
      createTask('Pomodoro sessions', 'count', 3, 15, 12),
    ],
  },
  {
    key: 'wed',
    label: 'Wed',
    fullLabel: 'Wednesday',
    tasks: [createTask('Workout', 'check', 1, 18, 10)],
  },
  {
    key: 'thu',
    label: 'Thu',
    fullLabel: 'Thursday',
    tasks: [createTask('Read chapter notes', 'check', 1, 16, 8)],
  },
  {
    key: 'fri',
    label: 'Fri',
    fullLabel: 'Friday',
    tasks: [createTask('Applications sent', 'count', 2, 24, 16)],
  },
  {
    key: 'sat',
    label: 'Sat',
    fullLabel: 'Saturday',
    tasks: [createTask('Laundry', 'check', 1, 14, 8)],
  },
  {
    key: 'sun',
    label: 'Sun',
    fullLabel: 'Sunday',
    tasks: [createTask('Weekly reset', 'check', 1, 22, 12)],
  },
]

function createTask(title, mode, target, coinReward, xpReward) {
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

function App() {
  const todayKey = dayKeys[new Date().getDay()] ?? 'mon'
  const [authMode, setAuthMode] = useState('login')
  const [hasEntered, setHasEntered] = useState(false)
  const [sessionType, setSessionType] = useState('guest')
  const [currentPage, setCurrentPage] = useState('Dashboard')
  
  const [userSettings, setUserSettings] = useState({
    firstName: 'Task',
    lastName: 'Guide',
    username: 'TaskGuide123',
    email: 'guide@uci.edu',
    password: 'password123',
    darkMode: true,
  })

  const [friendTab, setFriendTab] = useState('Friends')
  const [friendFilter, setFriendFilter] = useState('All')
  const [notificationFilter, setNotificationFilter] = useState('All')
  const [storeFilter, setStoreFilter] = useState('All')
  const [cart, setCart] = useState(starterCart)
  const [coins, setCoins] = useState(1500)
  const [xp, setXp] = useState(320)
  const [weekPlan, setWeekPlan] = useState(weekTemplate)
  const [selectedDay, setSelectedDay] = useState(todayKey)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskMode, setNewTaskMode] = useState('check')
  const [newTaskTarget, setNewTaskTarget] = useState(1)

  const filteredFriends =
    friendFilter === 'Favorites'
      ? friendList.filter((friend) => friend.favorite)
      : friendList

  const filteredNotifications =
    notificationFilter === 'Unread'
      ? notifications.filter((item) => item.unread)
      : notifications

  const filteredStore =
    storeFilter === 'All'
      ? storeItems
      : storeItems.filter((item) => item.category === storeFilter)

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0)
  const activeDay =
    weekPlan.find((day) => day.key === selectedDay) ?? weekPlan[0]

  const enterApp = (type) => {
    setSessionType(type)
    setHasEntered(true)
    setCurrentPage('Dashboard')
  }

  const logout = () => {
    setHasEntered(false)
    setSessionType('guest')
    setCurrentPage('Dashboard')
  }

  const addToCart = (item) => {
    if (!cart.some((entry) => entry.id === item.id)) {
      setCart((current) => [...current, item])
    }
  }

  const removeFromCart = (itemId) => {
    setCart((current) => current.filter((item) => item.id !== itemId))
  }

  const updateTask = (dayKey, taskId, updater) => {
    let rewardDelta = null

    setWeekPlan((currentWeek) =>
      currentWeek.map((day) => {
        if (day.key !== dayKey) {
          return day
        }

        return {
          ...day,
          tasks: day.tasks.map((task) => {
            if (task.id !== taskId) {
              return task
            }

            const nextTask = updater(task)

            if (!task.rewarded && nextTask.rewarded) {
              rewardDelta = {
                coins: nextTask.coinReward,
                xp: nextTask.xpReward,
              }
            }

            return nextTask
          }),
        }
      }),
    )

    if (rewardDelta) {
      setCoins((current) => current + rewardDelta.coins)
      setXp((current) => current + rewardDelta.xp)
    }
  }

  const toggleTask = (dayKey, task) => {
    updateTask(dayKey, task.id, (currentTask) => {
      const nextProgress = currentTask.progress >= currentTask.target ? 0 : currentTask.target

      return {
        ...currentTask,
        progress: nextProgress,
        rewarded: nextProgress >= currentTask.target ? currentTask.rewarded || true : false,
      }
    })
  }

  const incrementTask = (dayKey, task) => {
    updateTask(dayKey, task.id, (currentTask) => {
      const nextProgress = Math.min(currentTask.progress + 1, currentTask.target)
      return {
        ...currentTask,
        progress: nextProgress,
        rewarded: currentTask.rewarded || nextProgress >= currentTask.target,
      }
    })
  }

  const decrementTask = (dayKey, task) => {
    updateTask(dayKey, task.id, (currentTask) => ({
      ...currentTask,
      progress: Math.max(currentTask.progress - 1, 0),
      rewarded: currentTask.progress - 1 >= currentTask.target ? currentTask.rewarded : false,
    }))
  }

  const addTaskToDay = () => {
    const trimmedTitle = newTaskTitle.trim()
    if (!trimmedTitle) {
      return
    }

    const target = newTaskMode === 'check' ? 1 : Math.max(1, Number(newTaskTarget) || 1)
    const createdTask = createTask(
      trimmedTitle,
      newTaskMode,
      target,
      newTaskMode === 'check' ? 18 : 24,
      newTaskMode === 'check' ? 10 : 14,
    )

    setWeekPlan((currentWeek) =>
      currentWeek.map((day) =>
        day.key === selectedDay
          ? { ...day, tasks: [...day.tasks, createdTask] }
          : day,
      ),
    )

    setNewTaskTitle('')
    setNewTaskMode('check')
    setNewTaskTarget(1)
  }

  return (
    <div className={`app-shell ${userSettings.darkMode ? 'theme-dark' : 'theme-light'}`}>
      <div className="backdrop-glow backdrop-glow-left" />
      <div className="backdrop-glow backdrop-glow-right" />

      <main className={hasEntered ? 'page-stack app-mode' : 'page-stack auth-mode'}>
        {!hasEntered ? (
          <EntryScreen
            authMode={authMode}
            onSwitchMode={setAuthMode}
            onEnterApp={enterApp}
          />
        ) : (
          <section className="dashboard-frame">
            <Sidebar
              currentPage={currentPage}
              onSelectPage={setCurrentPage}
              onLogout={logout}
            />
            <div className="content-panel">
              <HeaderBadge 
                coins={coins} 
                xp={xp} 
                sessionType={sessionType} 
                username={userSettings.username} 
              />

              {currentPage === 'Dashboard' && (
                <DashboardPage
                  weekPlan={weekPlan}
                  selectedDay={selectedDay}
                  todayKey={todayKey}
                  onSelectDay={setSelectedDay}
                  activeDay={activeDay}
                  onToggleTask={toggleTask}
                  onIncrementTask={incrementTask}
                  onDecrementTask={decrementTask}
                  newTaskTitle={newTaskTitle}
                  onNewTaskTitleChange={setNewTaskTitle}
                  newTaskMode={newTaskMode}
                  onNewTaskModeChange={setNewTaskMode}
                  newTaskTarget={newTaskTarget}
                  onNewTaskTargetChange={setNewTaskTarget}
                  onAddTask={addTaskToDay}
                />
              )}

              {currentPage === 'Friends' && (
                <FriendsPage
                  currentTab={friendTab}
                  onTabChange={setFriendTab}
                  friendFilter={friendFilter}
                  onFilterChange={setFriendFilter}
                  friends={filteredFriends}
                  requests={requests}
                />
              )}

              {currentPage === 'Notifications' && (
                <NotificationsPage
                  filter={notificationFilter}
                  onFilterChange={setNotificationFilter}
                  items={filteredNotifications}
                />
              )}

              {currentPage === 'Store' && (
                <StorePage
                  filter={storeFilter}
                  onFilterChange={setStoreFilter}
                  items={filteredStore}
                  onAddToCart={addToCart}
                  cart={cart}
                  total={cartTotal}
                  onRemoveFromCart={removeFromCart}
                />
              )}

              {currentPage === 'Settings' && (
                <SettingsPage 
                  settings={userSettings} 
                  onUpdateSettings={setUserSettings} 
                  onLogout={logout}
                />
                )}
                
                {currentPage === 'Profile' && (
                  <ProfilePage/>
                )}

              {![
                'Dashboard',
                'Friends',
                'Notifications',
                'Store',
                'Settings',
                'Profile',
              ].includes(currentPage) && <ComingSoon page={currentPage} />}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function EntryScreen({ authMode, onSwitchMode, onEnterApp }) {
  return (
    <section className="entry-screen-shell">
      <div className="entry-screen-card">
        <div className="auth-toggle large">
          <button
            className={authMode === 'login' ? 'is-active' : ''}
            onClick={() => onSwitchMode('login')}
          >
            Log In
          </button>
          <button
            className={authMode === 'signup' ? 'is-active' : ''}
            onClick={() => onSwitchMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <AuthCard
          mode={authMode}
          onSwitchMode={onSwitchMode}
          onEnterApp={onEnterApp}
        />
      </div>
    </section>
  )
}

function AuthCard({ mode, onSwitchMode, onEnterApp }) {
  const isLogin = mode === 'login'

  return (
    <div className="auth-card auth-card-large">
      <div className="social-stack">
        <button className="social-btn">
          <span className="social-icon google">G</span>
          Continue with Google
        </button>
        <button className="social-btn">
          <span className="social-icon apple">A</span>
          Continue with Apple
        </button>
      </div>

      <div className="separator">
        <span>OR</span>
      </div>

      <form className="auth-form">
        {isLogin ? (
          <>
            <label>
              Username or Email
              <input type="text" placeholder="case-sensitive" />
            </label>
            <label>
              <div className="label-row">
                <span>Password</span>
                <button type="button" className="linkish">
                  Forgot Password?
                </button>
              </div>
              <input type="password" placeholder="Password" />
            </label>
            <button
              type="button"
              className="primary-btn full-width"
              onClick={() => onEnterApp('member')}
            >
              Log In
            </button>
            <button
              type="button"
              className="secondary-btn full-width"
              onClick={() => onEnterApp('guest')}
            >
              Continue as Guest
            </button>
            <p className="form-foot">
              Don&apos;t have a GAMETASK account?{' '}
              <button
                type="button"
                className="text-link"
                onClick={() => onSwitchMode('signup')}
              >
                Sign Up
              </button>
            </p>
          </>
        ) : (
          <>
            <label>
              Email
              <input type="email" placeholder="e.g. peteranteater@example.com" />
            </label>
            <label>
              Password
              <input type="password" placeholder="e.g. *************" />
            </label>
            <label>
              Confirm Password
              <input type="password" placeholder="Make sure it matches." />
            </label>
            <button
              type="button"
              className="primary-btn full-width"
              onClick={() => onEnterApp('member')}
            >
              Continue
            </button>
            <button
              type="button"
              className="secondary-btn full-width"
              onClick={() => onEnterApp('guest')}
            >
              Continue as Guest
            </button>
            <p className="form-foot">
              Already have a GAMETASK account?{' '}
              <button
                type="button"
                className="text-link"
                onClick={() => onSwitchMode('login')}
              >
                Log In
              </button>
            </p>
          </>
        )}
      </form>
    </div>
  )
}

function Sidebar({ currentPage, onSelectPage, onLogout }) {
  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-brand">GAMETASK</div>
        <nav className="nav-list">
          {navItems.map((item) => (
            <button
              key={item}
              className={currentPage === item ? 'nav-item is-current' : 'nav-item'}
              onClick={() => onSelectPage(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <button 
          className={currentPage === 'Settings' ? 'nav-item is-current' : 'nav-item'} 
          onClick={() => onSelectPage('Settings')}
        >
          Settings
        </button>
        <button className="nav-item" onClick={onLogout}>
          Logout
        </button>
      </div>
    </aside>
  )
}

function HeaderBadge({ coins, xp, sessionType, username }) {
  return (
    <div className="top-rail">
      <div className="top-profile">
        <CharacterIcon />
        <div>
          <strong>{username}</strong>
          <span>{sessionType === 'guest' ? 'Guest Mode' : 'Member Mode'}</span>
        </div>
      </div>
      <div className="resource-chip coin-chip">🪙 {coins.toLocaleString()} Coins</div>
      <div className="resource-chip xp-chip">⭐ {xp.toLocaleString()} XP</div>
    </div>
  )
}

function DashboardPage({
  weekPlan,
  selectedDay,
  todayKey,
  onSelectDay,
  activeDay,
  onToggleTask,
  onIncrementTask,
  onDecrementTask,
  newTaskTitle,
  onNewTaskTitleChange,
  newTaskMode,
  onNewTaskModeChange,
  newTaskTarget,
  onNewTaskTargetChange,
  onAddTask,
}) {
  const completedTasks = weekPlan.reduce(
    (sum, day) =>
      sum + day.tasks.filter((task) => task.progress >= task.target).length,
    0,
  )

  return (
    <section className="dashboard-layout">
      <div className="section-header">
        <p className="section-kicker">Planner</p>
        <h2>7 Day Task Calendar</h2>
      </div>

      <div className="stats-strip">
        <article className="stat-card">
          <strong>{completedTasks}</strong>
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
      </div>

      <div className="calendar-grid">
        {weekPlan.map((day) => {
          const doneCount = day.tasks.filter(
            (task) => task.progress >= task.target,
          ).length

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
                {doneCount}/{day.tasks.length || 0} done
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
                      <button
                        type="button"
                        onClick={() => onDecrementTask(activeDay.key, task)}
                      >
                        -
                      </button>
                      <span>
                        {task.progress}/{task.target}
                      </span>
                      <button
                        type="button"
                        onClick={() => onIncrementTask(activeDay.key, task)}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
                <div className="task-progress-bar">
                  <span
                    style={{
                      width: `${(task.progress / task.target) * 100}%`,
                    }}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="planner-panel planner-side">
          <div className="panel-heading">
            <div>
              <h3>Add Daily or Task</h3>
              <p>Create checkbox tasks or count-based goals for this day.</p>
            </div>
          </div>

          <div className="task-form">
            <label>
              Task Title
              <input
                type="text"
                value={newTaskTitle}
                onChange={(event) => onNewTaskTitleChange(event.target.value)}
                placeholder="e.g. Finish lab report"
              />
            </label>

            <label>
              Tracking Type
              <select
                value={newTaskMode}
                onChange={(event) => onNewTaskModeChange(event.target.value)}
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
                  onChange={(event) =>
                    onNewTaskTargetChange(Number(event.target.value))
                  }
                />
              </label>
            )}

            <button type="button" className="primary-btn full-width" onClick={onAddTask}>
              Add To {activeDay.fullLabel}
            </button>
          </div>
        </aside>
      </div>
    </section>
  )
}

function FriendsPage({
  currentTab,
  onTabChange,
  friendFilter,
  onFilterChange,
  friends,
  requests,
}) {
  return (
    <section>
      <div className="section-header split">
        <div>
          <p className="section-kicker">Social</p>
          <h2>My Friends</h2>
        </div>
        <div className="search-pill">Search Friends</div>
      </div>

      <div className="tab-strip">
        {['Friends', 'Requests'].map((tab) => (
          <button
            key={tab}
            className={currentTab === tab ? 'tab-btn is-active' : 'tab-btn'}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {currentTab === 'Friends' ? (
        <>
          <div className="section-header compact">
            <h3>Friends ({friends.length})</h3>
            <div className="chip-row">
              {['All', 'Favorites'].map((filter) => (
                <button
                  key={filter}
                  className={friendFilter === filter ? 'chip is-active' : 'chip'}
                  onClick={() => onFilterChange(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="friend-grid">
            {friends.map((friend) => (
              <article key={friend.name} className="friend-card">
                <Avatar />
                <div>
                  <h4>{friend.name}</h4>
                  <p>Level {friend.level}</p>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="request-stack">
          {requests.map((request) => (
            <article key={request.name} className="request-card">
              <div className="request-left">
                <Avatar />
                <div>
                  <h4>{request.name}</h4>
                  <p>Level {request.level}</p>
                </div>
              </div>
              <div className="request-actions">
                <button className="accept-btn">Accept</button>
                <button className="decline-btn">Decline</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function NotificationsPage({ filter, onFilterChange, items }) {
  return (
    <section>
      <div className="section-header split">
        <div>
          <p className="section-kicker">Updates</p>
          <h2>Notifications</h2>
        </div>
        <div className="search-pill">Search Notifications</div>
      </div>

      <div className="chip-row with-gap">
        {['All', 'Unread'].map((chip) => (
          <button
            key={chip}
            className={filter === chip ? 'chip is-active' : 'chip'}
            onClick={() => onFilterChange(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="notification-stack">
        {items.map((item) => (
          <article key={item.id} className="notification-card">
            <div className="notification-main">
              {item.type === 'challenge' ? (
                <div className="challenge-badge">🔥</div>
              ) : (
                <Avatar />
              )}
              <div>
                <h4>{item.title}</h4>
                <p>{item.body}</p>
              </div>
            </div>
            {item.type === 'friend' && (
              <div className="request-actions">
                <button className="accept-btn">Accept</button>
                <button className="decline-btn">Decline</button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

function StorePage({
  filter,
  onFilterChange,
  items,
  onAddToCart,
  cart,
  total,
  onRemoveFromCart,
}) {
  return (
    <section>
      <div className="section-header split">
        <div>
          <p className="section-kicker">Rewards</p>
          <h2>Store</h2>
        </div>
        <div className="search-pill">Search Store</div>
      </div>

      <div className="chip-row with-gap">
        {['All', 'Themes', 'Powerups'].map((chip) => (
          <button
            key={chip}
            className={filter === chip ? 'chip is-active' : 'chip'}
            onClick={() => onFilterChange(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="cart-layout">
        <div className="store-grid">
          {items.map((item) => (
            <article key={item.id} className="store-card">
              <ThemeArt art={item.art} />
              <div className="store-body">
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
                <div className="store-footer">
                  <div className="price-tag">🪙 {item.price.toLocaleString()}</div>
                  <button className="primary-btn" onClick={() => onAddToCart(item)}>
                    Add
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <StoreCheckout
          cart={cart}
          total={total}
          onRemove={onRemoveFromCart}
        />
      </div>
    </section>
  )
}

function StoreCheckout({ cart, total, onRemove }) {
  return (
    <aside className="summary-card">
      <h3>Order Summary</h3>
      <div className="summary-lines">
        {cart.map((item) => (
          <div key={item.id} className="summary-line summary-line-card">
            <span>{item.title}</span>
            <div className="summary-actions">
              <strong>🪙 {item.price}</strong>
              <button className="summary-remove" onClick={() => onRemove(item.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
        {cart.length === 0 && <p className="empty-cart-copy">Add items here, then check out.</p>}
      </div>
      <div className="summary-total">
        <span>Total</span>
        <strong>🪙 {total}</strong>
      </div>
      <button className="primary-btn full-width">Checkout</button>
    </aside>
  )
}

function SettingsPage({ settings, onUpdateSettings, onLogout }) {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field, value) => {
    onUpdateSettings({ ...settings, [field]: value })
  }

  return (
    <section className="dashboard-layout">
      <div className="section-header">
        <p className="section-kicker">Preferences</p>
        <h2>Account Settings</h2>
      </div>

      <div className="planner-grid">
        <div className="planner-panel">
          <div className="panel-heading">
            <div>
              <h3>Personal Info</h3>
              <p>Update your display details and account credentials.</p>
            </div>
          </div>
          
          <div className="task-form">
            <div className="form-row-split">
              <label>
                First Name
                <input 
                  type="text" 
                  value={settings.firstName} 
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                />
              </label>
              <label>
                Last Name
                <input 
                  type="text" 
                  value={settings.lastName} 
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                />
              </label>
            </div>

            <label>
              Email Address
              <input 
                type="email" 
                value={settings.email} 
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </label>
            
            <label>
              Username
              <input 
                type="text" 
                value={settings.username} 
                onChange={(e) => handleChange('username', e.target.value)}
              />
            </label>
            
            <label>
              Password
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={settings.password} 
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="password-input-field"
                />
                <button 
                  type="button" 
                  className="password-toggle-btn-inline"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <div className="button-group-row">
              <button className="primary-btn">Save Changes</button>
              <button className="secondary-btn">Cancel</button>
            </div>
          </div>
        </div>

        <aside className="planner-panel planner-side">
          <div className="panel-heading">
            <h3>Profile & Safety</h3>
          </div>
          
          <div className="avatar-settings-zone">
            <div className="avatar-large-wrapper">
               <Avatar />
            </div>
            <button className="secondary-btn full-width">Change Avatar</button>
          </div>

          <hr className="subtle-divider" />

          <div className="danger-zone-v2">
            <h4>Danger Zone</h4>
            <p>Once you delete your account, there is no going back. Please be certain.</p>
            <button className="primary-btn full-width danger-bg" onClick={onLogout}>
              Delete Account
            </button>
          </div>
        </aside>
      </div>
    </section>
  )
}

function ComingSoon({ page }) {
  return (
    <section className="coming-soon">
      <p className="section-kicker">In Progress</p>
      <h2>{page}</h2>
      <p>This page is still being built around the new dashboard-first flow.</p>
    </section>
  )
}

function Avatar() {
  return (
    <div className="avatar">
      <div className="avatar-head" />
      <div className="avatar-body" />
    </div>
  )
}

function CharacterIcon() {
  return (
    <div className="character-icon">
      <div className="character-ears" />
      <div className="character-face">
        <span />
        <span />
      </div>
    </div>
  )
}

function ProfilePage() {
  return (
    <section className="profile-page">

      <div className="left-column">
        <div className="profile-card">
          <h3>Software Engineering Student</h3>
          <p>
            Senior student at UCI as a SWE major with minor in statistics.
            Passionate about web development, UI/UX, and building full stack applications.
          </p>

          <button className="edit-profile-btn">
            Edit Profile
          </button>
        </div>
        
        <div className="profile-card">
          <div className="inventory-header">
            <h3>Inventory</h3>
            <div className="search-pill inventory-search">Search Items</div>
          </div>
          
          <div className="inventory-grid">            
            <div className="item-card">
              <h4>Dark Theme</h4>
              <p>Unlocked</p>
            </div>

            <div className="item-card">
              <h4>Triple XP</h4>
              <p>Active</p>
            </div>

            <div className="item-card">
              <h4>Task Extender</h4>
              <p>Owned</p>
            </div>

            <div className="item-card">
              <h4>Coin Boost</h4>
              <p>Owned</p>
            </div>

            <div className="item-card">
              <h4>Custom Avatar</h4>
              <p>Unlocked</p>
            </div>

            <div className="item-card">
              <h4>Forest Theme</h4>
              <p>Active</p>
            </div>

            <div className="item-card">
              <h4>Double XP</h4>
              <p>Owned</p>
            </div>

            <div className="item-card">
              <h4>Space Theme</h4>
              <p>Owned</p>
            </div>

          </div>
      
        </div>
      </div>

      <div className="statistics-card">
        <h3>Statistics</h3>
        <p>Task Completed: <b>458</b></p>
        <p>Achievement Unlocked: <b>12</b></p>
        <p>Total Coins Earned: <b>12,400</b></p>
        <p>Total Number of friends: <b>3</b></p>
      </div>

    </section>
  )
}

function ThemeArt({ art, compact = false }) {
  return <div className={`theme-art ${art} ${compact ? 'compact' : ''}`} />
}

export default App