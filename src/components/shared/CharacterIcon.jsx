export function CharacterIcon({ variant = 'default', frameClass = '' }) {
  const isCustom = variant === 'custom'
  return (
    <div className={`character-icon${isCustom ? ' is-custom' : ''}${frameClass ? ` ${frameClass}` : ''}`}>
      <div className={isCustom ? 'character-ears is-custom' : 'character-ears'} />
      <div className={isCustom ? 'character-face is-custom' : 'character-face'}>
        <span />
        <span />
      </div>
    </div>
  )
}
