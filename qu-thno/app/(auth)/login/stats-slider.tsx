"use client"

import { useState, useEffect } from "react"

const STATS = [
  { valueAr: "+١٢٠", labelAr: "مبادرة مجتمعية منجزة", valueEn: "+120", labelEn: "Completed Community Initiatives" },
  { valueAr: "+٢٥٠٠", labelAr: "متطوع نشط", valueEn: "+2500", labelEn: "Active Volunteers" },
  { valueAr: "+١٨٠٠٠", labelAr: "ساعة تطوع مسجلة", valueEn: "+18000", labelEn: "Volunteer Hours Logged" },
  { valueAr: "+٦٠", labelAr: "شراكة مؤسسية فعالة", valueEn: "+60", labelEn: "Active Institutional Partnerships" },
]

export function StatsSlider({ isRTL }: { isRTL: boolean }) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % STATS.length)
        setVisible(true)
      }, 400)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const stat = STATS[index] ?? STATS[0]!

  return (
    <div className="text-center" style={{ minHeight: "80px" }}>
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        <p
          className="text-4xl font-bold text-white mb-1"
          style={{ fontFeatureSettings: '"tnum"' }}
        >
          {isRTL ? stat.valueAr : stat.valueEn}
        </p>
        <p className="text-base text-white/80">
          {isRTL ? stat.labelAr : stat.labelEn}
        </p>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {STATS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className="rounded-full transition-all"
            style={{
              width: i === index ? "24px" : "8px",
              height: "8px",
              background: i === index ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.4)",
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
