import { CharacterIcon } from '../shared/CharacterIcon'

export function HeaderBadge({
  coins,
  xp,
  currentLevel,
  xpIntoLevel,
  xpGoal,
  sessionType,
  username,
  equippedTheme,
  equippedAvatar,
  equippedFrame,
}) {
  const themeClass = equippedTheme ? `profile-theme-${equippedTheme.art}` : ''
  const frameClass = equippedFrame ? `frame-${equippedFrame.art}` : ''

  return (
    <div className="top-rail">
      <div className={`top-profile${themeClass ? ` ${themeClass}` : ''}`}>
        <CharacterIcon
          variant={equippedAvatar ? 'custom' : 'default'}
          frameClass={frameClass}
        />
        <div className="top-profile-copy">
          <div>
            <strong>{username}</strong>
            <span>
              {sessionType === 'guest' ? 'Guest Mode' : 'Member Mode'} • Level{' '}
              {currentLevel}
            </span>
          </div>
          <div className="xp-meter">
            <div className="xp-meter-label">
              <span>XP Progress</span>
              <strong>
                {xpIntoLevel}/{xpGoal}
              </strong>
            </div>
            <div className="xp-meter-track">
              <span style={{ width: `${(xpIntoLevel / xpGoal) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div className="resource-chip coin-chip">🪙 {coins.toLocaleString()} Coins</div>
    </div>
  )
}
