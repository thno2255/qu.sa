// SDG goal number → color (UN SDG color palette)
const SDG_COLORS: Record<number, string> = {
  1: "#e5243b", 2: "#dda63a", 3: "#4c9f38", 4: "#c5192d",
  5: "#ff3a21", 6: "#26bde2", 7: "#fcc30b", 8: "#a21942",
  9: "#fd6925", 10: "#dd1367", 11: "#fd9d24", 12: "#bf8b2e",
  13: "#3f7e44", 14: "#0a97d9", 15: "#56c02b", 16: "#00689d",
  17: "#19486a",
}

interface SDGChipProps {
  goal: number
  size?: "sm" | "md"
  showLabel?: boolean
  isRTL?: boolean
}

export function SDGChip({ goal, size = "sm", showLabel = false, isRTL = true }: SDGChipProps) {
  const color = SDG_COLORS[goal] ?? "#888"
  const dim = size === "sm" ? 24 : 32
  const fontSize = size === "sm" ? 10 : 13

  return (
    <span
      className="inline-flex items-center gap-1"
      title={`SDG ${goal}`}
    >
      <span
        className="inline-flex items-center justify-center rounded font-bold text-white"
        style={{ background: color, width: dim, height: dim, fontSize }}
        aria-label={`SDG ${goal}`}
      >
        {goal}
      </span>
      {showLabel && (
        <span className="text-xs text-muted-foreground">SDG {goal}</span>
      )}
    </span>
  )
}

interface SDGChipsRowProps {
  goals: number[]
  max?: number
  isRTL?: boolean
}

export function SDGChipsRow({ goals, max = 5, isRTL = true }: SDGChipsRowProps) {
  const visible = goals.slice(0, max)
  const overflow = goals.length - max

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((g) => (
        <SDGChip key={g} goal={g} isRTL={isRTL} />
      ))}
      {overflow > 0 && (
        <span className="text-xs text-muted-foreground">+{overflow}</span>
      )}
    </div>
  )
}
