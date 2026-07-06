interface LineDataPoint {
  label: string
  value: number
}

interface LineChartProps {
  data: LineDataPoint[]
  color?: string
  height?: number
  showDots?: boolean
  showGrid?: boolean
  className?: string
}

export function LineChart({
  data,
  color = "#3b82f6",
  height = 120,
  showDots = true,
  showGrid = true,
  className,
}: LineChartProps) {
  if (!data.length) return null

  const padL = 32
  const padR = 8
  const padT = 8
  const padB = 28
  const W = 280
  const H = height

  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const maxVal = Math.max(...data.map(d => d.value), 1)
  const minVal = Math.min(...data.map(d => d.value), 0)
  const range = maxVal - minVal || 1

  const toX = (i: number) => padL + (i / (data.length - 1)) * plotW
  const toY = (v: number) => padT + plotH - ((v - minVal) / range) * plotH

  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.value), ...d }))

  const polyline = points.map(p => `${p.x},${p.y}`).join(" ")

  // Area fill path
  const area = [
    `M ${points[0]?.x ?? 0},${padT + plotH}`,
    ...points.map(p => `L ${p.x},${p.y}`),
    `L ${points[points.length - 1]?.x ?? 0},${padT + plotH}`,
    "Z",
  ].join(" ")

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    v: Math.round(minVal + f * range),
    y: padT + plotH - f * plotH,
  }))

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="xMidYMid meet"
        aria-label="Line chart"
        role="img"
      >
        {/* Grid */}
        {showGrid &&
          yTicks.map((t, i) => (
            <line
              key={i}
              x1={padL}
              x2={W - padR}
              y1={t.y}
              y2={t.y}
              stroke="currentColor"
              strokeWidth={0.3}
              strokeDasharray="3,3"
              opacity={0.25}
            />
          ))}

        {/* Y labels */}
        {yTicks.map((t, i) => (
          <text
            key={i}
            x={padL - 4}
            y={t.y + 3}
            textAnchor="end"
            fontSize={6}
            fill="currentColor"
            opacity={0.55}
          >
            {t.v}
          </text>
        ))}

        {/* Area fill */}
        <path d={area} fill={color} opacity={0.1} />

        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots */}
        {showDots &&
          points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} stroke="white" strokeWidth={1} />
          ))}

        {/* X labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={H - 6}
            textAnchor="middle"
            fontSize={5.5}
            fill="currentColor"
            opacity={0.6}
          >
            {p.label.length > 7 ? p.label.slice(0, 6) + "…" : p.label}
          </text>
        ))}
      </svg>
    </div>
  )
}
