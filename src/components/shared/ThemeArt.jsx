export function ThemeArt({ art, compact = false }) {
  return (
    <div className={`theme-art ${art}${compact ? ' compact' : ''}`} />
  )
}
