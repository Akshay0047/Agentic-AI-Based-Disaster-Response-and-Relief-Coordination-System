/**
 * Thin wrapper around the Google Material Symbols icon font.
 * Usage: <MaterialSymbol name="campaign" fill className="text-lg text-primary" />
 */
export default function MaterialSymbol({ name, fill = false, className = "", style }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`, ...style }}
    >
      {name}
    </span>
  )
}
