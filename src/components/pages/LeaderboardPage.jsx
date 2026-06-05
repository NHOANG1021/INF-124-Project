import { useMemo } from 'react'

const USERS_PER_PAGE = 10

export function LeaderboardPage({
  currentShown,
  onTabChange,
  globalUsers,
  friends,
  currleadpage,
  nextleadpage,
}) {
  const activeUsers = currentShown === 'Friends' ? friends : globalUsers

  // Sort a copy so the original array is never mutated
  const sortedUsers = useMemo(
    () => [...activeUsers].sort((a, b) => b.exp - a.exp),
    [activeUsers],
  )

  const startIndex = (currleadpage - 1) * USERS_PER_PAGE
  const endIndex = startIndex + USERS_PER_PAGE
  const visibleUsers = sortedUsers.slice(startIndex, endIndex)
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / USERS_PER_PAGE))

  return (
    <section className="LeaderboardPage">
      <div className="section-header split">
        <div>
          <p className="section-kicker">Statistics</p>
          <h2>Leaderboard</h2>
        </div>
        <div className="chip-row">
          {['Global', 'Friends'].map((filter) => (
            <button
              key={filter}
              className={currentShown === filter ? 'chip is-active' : 'chip'}
              onClick={() => onTabChange(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="global-grid-header">
        <div>Rank</div>
        <div>User</div>
        <div>Level</div>
        <div>Total XP</div>
      </div>

      {visibleUsers.map((friend, index) => (
        <article key={friend.name} className="grid-entry">
          <div>{startIndex + index + 1}</div>
          <div>{friend.name}</div>
          <div>{friend.level}</div>
          <div>{friend.exp}</div>
        </article>
      ))}

      <div className="button-row">
        <button
          onClick={() => nextleadpage(currleadpage - 1)}
          disabled={currleadpage === 1}
          className="lead-button"
        >
          Prev
        </button>
        <button
          onClick={() => nextleadpage(currleadpage + 1)}
          disabled={endIndex >= sortedUsers.length}
          className="lead-button"
        >
          Next
        </button>
      </div>

      <p className="leaderboard-page-count">
        Page {currleadpage} of {totalPages}
      </p>
    </section>
  )
}
