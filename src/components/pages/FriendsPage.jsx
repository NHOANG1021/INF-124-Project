import { Avatar } from '../shared/Avatar'

export function FriendsPage({
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
            {friends.length === 0 ? (
              <article className="friend-card">
                <div>
                  <h4>No friends yet</h4>
                  <p>Send or accept a friend request to build your list.</p>
                </div>
              </article>
            ) : (
              friends.map((friend) => (
                <article key={friend.name} className="friend-card">
                  <Avatar />
                  <div>
                    <h4>{friend.name}</h4>
                    <p>Level {friend.level}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="request-stack">
          {requests.length === 0 ? (
            <article className="request-card">
              <div className="request-left">
                <div>
                  <h4>No requests right now</h4>
                  <p>Incoming friend requests will show up here.</p>
                </div>
              </div>
            </article>
          ) : (
            requests.map((request) => (
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
            ))
          )}
        </div>
      )}
    </section>
  )
}
