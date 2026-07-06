interface DonutSegment {
  label: string
  labelAr: string
  value: number
  color: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  isRTL?: boolean
  size?: number
  thickness?: number
  showLegend?: boolean
  className?: string
}

function polarToXY(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle - 90) * (Math.PI / 180)
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

export function DonutChart({
  segments,
  isRTL = false,
  size = 160,
  thickness = 36,
  showLegend = true,
  className,
}: DonutChartProps) {
  const total = segments.reduce((s, d) => s + d.value, 0)
  if (!total) return null

  const cx = size / 2
  const cy = size / 2
  const r = (size - thickness) / 2

  let cumAngle = 0
  const paths: { d: string; color: string; pct: number; label: string; labelAr: string }[] = []

  for (const seg of segments) {
    const angle = (seg.value / total) * 360
    const pct = Math.round((seg.value / total) * 100)

    if (angle < 0.5) { cumAngle += angle; continue }

    const start = polarToXY(cx, cy, r, cumAngle)
    const end = polarToXY(cx, cy, r, cumAngle + angle)
    const largeArc = angle > 180 ? 1 : 0

    const inner = thickness
    const ir = r - inner

    const is = polarToXY(cx, cy, ir, cumAngle)
    const ie = polarToXY(cx, cy, ir, cumAngle + angle)

    const d = [
      `M ${start.x} ${start.y}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`,
      `L ${ie.x} ${ie.y}`,
      `A ${ir} ${ir} 0 ${largeArc} 0 ${is.x} ${is.y}`,
      "Z",
    ].join(" ")

    paths.push({ d, color: seg.color, pct, label: seg.label, labelAr: seg.labelAr })
    cumAngle += angle
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-6 flex-wrap">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          className="shrink-0"
          aria-label={isRTL ? "مخطط دائري" : "Donut chart"}
          role="img"
        >
          {paths.map((p, i) => (
            <path
              key={i}
              d={p.d}
              fill={p.color}
              opacity={0.9}
              strokeWidth={0.5}
              stroke="white"
            />
          ))}
          {/* Center total */}
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            fontSize={14}
            fontWeight="700"
            fill="currentColor"
          >
            {total}
          </text>
          <text
            x={cx}
            y={cy + 10}
            textAnchor="middle"
            fontSize={7}
            fill="currentColor"
            opacity={0.6}
          >
            {isRTL ? "المجموع" : "Total"}
          </text>
        </svg>

        {showLegend && (
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            {paths.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span
                  className="size-2.5 rounded-sm shrink-0"
                  style={{ background: p.color }}
                />
                <span className="truncate text-muted-foreground">
                  {isRTL ? p.labelAr : p.label}
                </span>
                <span className="ms-auto font-semibold text-foreground shrink-0">{p.pct}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
