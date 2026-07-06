interface BarDataPoint {
  label: string
  labelAr: string
  value: number
  color?: string
}

interface BarChartProps {
  data: BarDataPoint[]
  isRTL?: boolean
  height?: number
  showValues?: boolean
  className?: string
}

export function BarChart({ data, isRTL = false, height = 200, showValues = true, className }: BarChartProps) {
  if (!data.length) return null

  const maxVal = Math.max(...data.map(d => d.value), 1)
  const barW = Math.floor(100 / data.length)
  const gap = 2
  const labelH = 28
  const valueH = 20
  const chartH = height - labelH - (showValues ? valueH : 0)
  const defaultColor = "#3b82f6"

  return (
    <div className={className} aria-label={isRTL ? "مخطط أعمدة" : "Bar chart"}>
      <svg
        viewBox={`0 0 100 ${height}`}
        className="w-full"
        preserveAspectRatio="none"
        role="img"
        style={{ height }}
      >
        {data.map((d, i) => {
          const x = i * barW + gap / 2
          const barHeight = (d.value / maxVal) * chartH
          const y = chartH - barHeight + (showValues ? valueH : 0)
          const color = d.color ?? defaultColor
          const label = isRTL ? d.labelAr : d.label

          return (
            <g key={i}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barW - gap}
                height={barHeight}
                fill={color}
                rx={1.5}
                opacity={0.9}
              />
              {/* Value label */}
              {showValues && d.value > 0 && (
                <text
                  x={x + (barW - gap) / 2}
                  y={y - 3}
                  textAnchor="middle"
                  fontSize={6}
                  fill="currentColor"
                  className="text-foreground/70"
                >
                  {d.value}
                </text>
              )}
              {/* X-axis label */}
              <text
                x={x + (barW - gap) / 2}
                y={height - 4}
                textAnchor="middle"
                fontSize={5.5}
                fill="currentColor"
                className="text-muted-foreground"
              >
                {label.length > 8 ? label.slice(0, 7) + "…" : label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="inline-block size-2.5 rounded-sm shrink-0"
              style={{ background: d.color ?? defaultColor }}
            />
            <span>{isRTL ? d.labelAr : d.label}</span>
            <span className="font-medium text-foreground">({d.value})</span>
          </div>
        ))}
      </div>
    </div>
  )
}
