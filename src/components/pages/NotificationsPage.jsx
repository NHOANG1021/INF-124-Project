import { Avatar } from '../shared/Avatar'

export function NotificationsPage({ filter, onFilterChange, items }) {
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
