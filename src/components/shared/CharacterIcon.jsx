export function CharacterIcon({ variant = 'default' }) {
  const isCustom = variant === 'custom'
  return (
    <div className={isCustom ? 'character-icon is-custom' : 'character-icon'}>
      <div className={isCustom ? 'character-ears is-custom' : 'character-ears'} />
      <div className={isCustom ? 'character-face is-custom' : 'character-face'}>
        <span />
        <span />
      </div>
    </div>
  )
}
