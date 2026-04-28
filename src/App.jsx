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

const starterCart = [storeItems[0], storeItems[2]]

function App() {
  const [authMode, setAuthMode] = useState('login')
  const [hasEntered, setHasEntered] = useState(false)
  const [sessionType, setSessionType] = useState('guest')
  const [currentPage, setCurrentPage] = useState('Dashboard')
  const [friendTab, setFriendTab] = useState('Friends')
  const [friendFilter, setFriendFilter] = useState('All')
  const [notificationFilter, setNotificationFilter] = useState('All')
  const [storeFilter, setStoreFilter] = useState('All')
  const [cart, setCart] = useState(starterCart)
  const xpBalance = 1500

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

  const addToCart = (item) => {
    if (!cart.some((entry) => entry.id === item.id)) {
      setCart([...cart, item])
    }
    setCurrentPage('Store Cart')
  }

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId))
  }

  const enterApp = (type) => {
    setSessionType(type)
    setHasEntered(true)
    setCurrentPage(type === 'guest' ? 'Dashboard' : 'Store')
  }

  return (
    <div className="app-shell">
      <div className="backdrop-glow backdrop-glow-left" />
      <div className="backdrop-glow backdrop-glow-right" />

      <main className={hasEntered ? 'page-stack app-mode' : 'page-stack'}>
        {!hasEntered ? (
          <EntryScreen
            authMode={authMode}
            onSwitchMode={setAuthMode}
            onEnterApp={enterApp}
          />
        ) : (
          <section className="dashboard-frame">
          <Sidebar currentPage={currentPage} onSelectPage={setCurrentPage} />
          <div className="content-panel">
            <HeaderBadge xpBalance={xpBalance} sessionType={sessionType} />

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
              />
            )}

            {currentPage === 'Store Cart' && (
              <CartPage
                cart={cart}
                total={cartTotal}
                onRemove={removeFromCart}
              />
            )}

            {!['Friends', 'Notifications', 'Store', 'Store Cart'].includes(
              currentPage,
            ) && <ComingSoon page={currentPage} />}
          </div>
          </section>
        )}
      </main>
    </div>
  )
}

function EntryScreen({ authMode, onSwitchMode, onEnterApp }) {
  return (
    <section className="entry-frame">
      <div className="entry-copy">
        <div className="brand-lockup align-left">
          <span className="eyebrow">Gamified Productivity</span>
          <h1>GAMETASK</h1>
        </div>
        <p className="entry-lead">
          Turn homework, habits, and deadlines into a progression system with XP,
          rewards, friends, and daily momentum.
        </p>

        <div className="entry-highlights">
          <div className="highlight-card">
            <strong>Track Progress</strong>
            <span>Tasks, streaks, levels, and challenge completion.</span>
          </div>
          <div className="highlight-card">
            <strong>Play Socially</strong>
            <span>Friends, requests, notifications, and leaderboard hooks.</span>
          </div>
          <div className="highlight-card">
            <strong>Spend Rewards</strong>
            <span>Themes, powerups, and XP-based store purchases.</span>
          </div>
        </div>
      </div>

      <div className="entry-stack">
        <div className="hero-card auth-shell single-screen-auth">
          <div className="auth-toggle">
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

        <PreviewPanel />
      </div>
    </section>
  )
}

function AuthCard({ mode, onSwitchMode, onEnterApp }) {
  const isLogin = mode === 'login'

  return (
    <div className="auth-card">
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

function PreviewPanel() {
  return (
    <section className="preview-panel">
      <div className="preview-header">
        <div>
          <p className="section-kicker">One-Screen Preview</p>
          <h2>What guest mode unlocks</h2>
        </div>
        <div className="xp-badge">
          <span className="xp-flame">✦</span>
          Explore Instantly
        </div>
      </div>

      <div className="preview-grid">
        <article className="preview-card wide">
          <h3>Friends + Requests</h3>
          <div className="mini-tabs">
            <span className="mini-tab active">Friends</span>
            <span className="mini-tab">Requests</span>
          </div>
          <div className="mini-friend-row">
            {friendList.slice(0, 3).map((friend) => (
              <div key={friend.name} className="mini-friend-card">
                <Avatar />
                <div>
                  <strong>{friend.name}</strong>
                  <span>Level {friend.level}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="preview-card">
          <h3>Notifications</h3>
          <div className="mini-notification">
            <div className="challenge-badge small">🔥</div>
            <div>
              <strong>Daily Challenge</strong>
              <span>Finish 2 internship applications today.</span>
            </div>
          </div>
          <div className="mini-notification">
            <Avatar />
            <div>
              <strong>Friend Request</strong>
              <span>PeterAnteater wants to add you.</span>
            </div>
          </div>
        </article>

        <article className="preview-card">
          <h3>Reward Store</h3>
          <div className="mini-store-row">
            {storeItems.slice(0, 2).map((item) => (
              <div key={item.id} className="mini-store-card">
                <ThemeArt art={item.art} compact />
                <strong>{item.title}</strong>
                <span>{item.price} XP</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

function Sidebar({ currentPage, onSelectPage }) {
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
          <button
            className={currentPage === 'Store Cart' ? 'nav-item is-current' : 'nav-item'}
            onClick={() => onSelectPage('Store Cart')}
          >
            Cart & Checkout
          </button>
        </nav>
      </div>

      <div className="sidebar-footer">
        <button className="nav-item">Settings</button>
        <button className="nav-item">Logout</button>
      </div>
    </aside>
  )
}

function HeaderBadge({ xpBalance, sessionType }) {
  return (
    <div className="top-rail">
      {sessionType === 'guest' && <div className="guest-badge">Guest Mode</div>}
      <div className="xp-badge">
        <span className="xp-flame">✦</span>
        {xpBalance.toLocaleString()} XP
      </div>
    </div>
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
            <div>
              <h3>Friends ({friends.length})</h3>
            </div>
            <div className="chip-row">
              {['All', 'Favorites'].map((filter) => (
                <button
                  key={filter}
                  className={
                    friendFilter === filter ? 'chip is-active' : 'chip'
                  }
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

function StorePage({ filter, onFilterChange, items, onAddToCart }) {
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
                <div className="price-tag">{item.price.toLocaleString()} XP</div>
                <button className="primary-btn" onClick={() => onAddToCart(item)}>
                  Buy
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function CartPage({ cart, total, onRemove }) {
  return (
    <section>
      <div className="section-header">
        <div>
          <p className="section-kicker">Store</p>
          <h2>Cart and Checkout</h2>
        </div>
      </div>

      <div className="cart-layout">
        <div className="cart-list">
          {cart.map((item) => (
            <article key={item.id} className="cart-item">
              <ThemeArt art={item.art} compact />
              <div className="cart-copy">
                <h4>{item.title}</h4>
                <p>Adds a new visual reward or boost for your workspace.</p>
              </div>
              <div className="price-tag">{item.price.toLocaleString()} XP</div>
              <button className="trash-btn" onClick={() => onRemove(item.id)}>
                🗑
              </button>
            </article>
          ))}
        </div>

        <aside className="summary-card">
          <h3>Order Summary</h3>
          <div className="summary-lines">
            {cart.map((item) => (
              <div key={item.id} className="summary-line">
                <span>{item.title}</span>
                <strong>{item.price} XP</strong>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>{total} XP</strong>
          </div>
          <button className="primary-btn full-width">Checkout</button>
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
      <p>
        This first frontend pass focuses on auth, social screens, notifications,
        and the reward store. We can build out the remaining page next.
      </p>
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

function ThemeArt({ art, compact = false }) {
  return <div className={`theme-art ${art} ${compact ? 'compact' : ''}`} />
}

export default App
