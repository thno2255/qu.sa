"use client"

import { useEffect, useRef, useState } from "react"

// Counts up from 0 to `value` once the element scrolls into view. Skips the
// animation entirely under prefers-reduced-motion (jumps straight to value).
export function AnimatedCounter({
  value,
  locale,
  durationMs = 1200,
}: {
  value: number
  locale: "ar-SA" | "en-US"
  durationMs?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduceMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const [display, setDisplay] = useState(() => (reduceMotion ? value : 0))

  useEffect(() => {
    const el = ref.current
    if (!el || reduceMotion) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const progress = Math.min((now - start) / durationMs, 1)
          const eased = 1 - (1 - progress) ** 3
          setDisplay(Math.round(eased * value))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0, rootMargin: "200px 0px 200px 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value, durationMs, reduceMotion])

  return <span ref={ref}>{display.toLocaleString(locale)}</span>
}
