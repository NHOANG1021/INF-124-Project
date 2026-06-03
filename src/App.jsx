import { useMemo, useState } from 'react'

// Data
import { friendList, notifications, requests, storeItems } from './constants/data'

// Hooks
import { useAuth } from './hooks/useAuth'
import { useStore } from './hooks/useStore'
import { useTasks } from './hooks/useTasks'

// Layout
import { HeaderBadge } from './components/layout/HeaderBadge'
import { Sidebar } from './components/layout/Sidebar'
// Auth
import { EntryScreen } from './components/auth/EntryScreen'

// Pages
import { ComingSoon } from './components/pages/ComingSoon'
import { DashboardPage } from './components/pages/DashboardPage'
import { FriendsPage } from './components/pages/FriendsPage'
import { LeaderboardPage } from './components/pages/LeaderboardPage'
import { NotificationsPage } from './components/pages/NotificationsPage'
import { ProfilePage } from './components/pages/ProfilePage'
import { SettingsPage } from './components/pages/SettingsPage'
import { StorePage } from './components/pages/StorePage'

const KNOWN_PAGES = [
  'Dashboard',
  'Friends',
  'Notifications',
  'Store',
  'Settings',
  'Profile',
  'Leaderboard',
]

function App() {
  const [currentPage, setCurrentPage] = useState('Dashboard')
  const [friendTab, setFriendTab] = useState('Friends')
  const [friendFilter, setFriendFilter] = useState('All')
  const [notificationFilter, setNotificationFilter] = useState('All')
  const [storeFilter, setStoreFilter] = useState('All')
  const [globalTab, setGlobalTab] = useState('Global')
  const [leaderPage, setLeaderPage] = useState(1)

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const auth = useAuth()
  const store = useStore()
  const tasks = useTasks(store.applyReward)

  // ── Derived / filtered lists (memoised) ────────────────────────────────────
  const filteredFriends = useMemo(
    () =>
      friendFilter === 'Favorites'
        ? friendList.filter((f) => f.favorite)
        : friendList,
    [friendFilter],
  )

  const filteredNotifications = useMemo(
    () =>
      notificationFilter === 'Unread'
        ? notifications.filter((n) => n.unread)
        : notifications,
    [notificationFilter],
  )

  const filteredStore = useMemo(
    () =>
      storeFilter === 'All'
        ? storeItems
        : storeItems.filter((item) => item.category === storeFilter),
    [storeFilter],
  )

  // ── Render ─────────────────────────────────────────────────────────────────
  const themeClass = store.equippedTheme ? `profile-theme-${store.equippedTheme.art}` : ''

  return (
    <div className={`app-shell ${auth.userSettings.darkMode ? 'theme-dark' : 'theme-light'} ${themeClass}`}>
      <div className="backdrop-glow backdrop-glow-left" />
      <div className="backdrop-glow backdrop-glow-right" />

      <main className={auth.hasEntered ? 'page-stack app-mode' : 'page-stack auth-mode'}>
        {!auth.hasEntered ? (
          <EntryScreen
            authMode={auth.authMode}
            onSwitchMode={auth.switchAuthMode}
            onEnterApp={auth.enterApp}
            authFeedback={auth.authFeedback}
            loginForm={auth.loginForm}
            onLoginFormChange={auth.setLoginForm}
            signupForm={auth.signupForm}
            onSignupFormChange={auth.setSignupForm}
            onLogin={auth.handleLogin}
            onSignup={auth.handleSignup}
          />
        ) : (
          <section className="dashboard-frame">
            <Sidebar
              currentPage={currentPage}
              onSelectPage={setCurrentPage}
              onLogout={auth.logout}
            />

            <div className="content-panel">
              <HeaderBadge
                coins={store.coins}
                xp={store.xp}
                currentLevel={store.currentLevel}
                xpIntoLevel={store.xpIntoLevel}
                xpGoal={store.xpGoal}
                sessionType={auth.sessionType}
                username={auth.userSettings.username}
                equippedTheme={store.equippedTheme}
                equippedAvatar={store.equippedAvatar}
              />

              {currentPage === 'Dashboard' && (
                <DashboardPage
                  weekPlan={tasks.weekPlan}
                  selectedDay={tasks.selectedDay}
                  todayKey={tasks.todayKey}
                  onSelectDay={tasks.setSelectedDay}
                  activeDay={tasks.activeDay}
                  completedCount={tasks.completedCount}
                  onToggleTask={tasks.toggleTask}
                  onIncrementTask={tasks.incrementTask}
                  onDecrementTask={tasks.decrementTask}
                  newTaskTitle={tasks.newTaskTitle}
                  onNewTaskTitleChange={tasks.setNewTaskTitle}
                  newTaskMode={tasks.newTaskMode}
                  onNewTaskModeChange={tasks.setNewTaskMode}
                  newTaskTarget={tasks.newTaskTarget}
                  onNewTaskTargetChange={tasks.setNewTaskTarget}
                  onAddTask={tasks.addTaskToDay}
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
                  onAddToCart={store.addToCart}
                  cart={store.cart}
                  total={store.cartTotal}
                  onRemoveFromCart={store.removeFromCart}
                  ownedItemIds={store.ownedItemIds}
                  cartItemIds={store.cartItemIds}
                  onCheckout={store.checkoutCart}
                  storeFeedback={store.storeFeedback}
                />
              )}

              {currentPage === 'Profile' && (
                <ProfilePage
                  inventory={store.inventory}
                  equippedItems={store.equippedItems}
                  onEquipItem={store.equipItem}
                />
              )}

              {currentPage === 'Settings' && (
                <SettingsPage
                  settings={auth.userSettings}
                  onUpdateSettings={auth.setUserSettings}
                  onLogout={auth.logout}
                />
              )}

              {currentPage === 'Leaderboard' && (
                <LeaderboardPage
                  currentShown={globalTab}
                  onTabChange={setGlobalTab}
                  friends={filteredFriends}
                  currleadpage={leaderPage}
                  nextleadpage={setLeaderPage}
                />
              )}

              {!KNOWN_PAGES.includes(currentPage) && <ComingSoon page={currentPage} />}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
