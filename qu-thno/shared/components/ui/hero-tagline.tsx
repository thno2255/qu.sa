"use client"

import { useState, useEffect } from "react"

interface Phrase {
  ar: string
  en: string
}

// Drawn from copy already used elsewhere on the homepage — no new claims.
const PHRASES: Phrase[] = [
  { ar: "معًا نصنع أثرًا مجتمعيًا مستدامًا", en: "Together, we create sustainable community impact" },
  { ar: "نربط خبرات الجامعة باحتياجات المجتمع", en: "Connecting university expertise with community needs" },
  { ar: "شراكات استراتيجية نحو رؤية 2030", en: "Strategic partnerships toward Vision 2030" },
  { ar: "جسرٌ بين الجامعة والمجتمع", en: "A bridge between the university and community" },
]

export function HeroTagline({ isRTL }: { isRTL: boolean }) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % PHRASES.length)
        setVisible(true)
      }, 350)
    }, 3800)
    return () => clearInterval(timer)
  }, [])

  const phrase = PHRASES[index] ?? PHRASES[0]!

  return (
    <h1
      className="mb-4 text-center font-black text-white"
      style={{
        // Fluid size that shrinks with viewport width so the longest
        // phrase always fits on a single line, at any screen size.
        fontSize: "clamp(1.35rem, 4.4vw, 2.75rem)",
        lineHeight: 1.25,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          display: "inline-block",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
        }}
      >
        {isRTL ? phrase.ar : phrase.en}
      </span>
    </h1>
  )
}
