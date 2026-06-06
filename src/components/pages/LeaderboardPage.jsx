import { useMemo } from 'react'

const USERS_PER_PAGE = 10

export function LeaderboardPage({
  currentShown,
  onTabChange,
  friends,
  currleadpage,
  nextleadpage,
}) {
  // Sort a copy so the original array is never mutated
  const sortedFriends = useMemo(
    () => [...friends].sort((a, b) => b.level - a.level),
    [friends],
  )

  const startIndex = (currleadpage - 1) * USERS_PER_PAGE
  const endIndex = startIndex + USERS_PER_PAGE
  const visibleUsers = sortedFriends.slice(startIndex, endIndex)

  return (
    <section className="LeaderboardPage">
      <div className="section-header split">
        <div>
          {/* <p className="section-kicker">Statistics</p> */}
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
          disabled={endIndex >= sortedFriends.length}
          className="lead-button"
        >
          Next
        </button>
      </div>
    </section>
  )
}
