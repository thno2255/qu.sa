"use client"

import { useEffect, useRef, type ReactNode } from "react"

// Adds the "is-visible" class once the element enters the viewport, matched
// by the `.reveal` / `.reveal.is-visible` CSS in globals.css (which itself
// disables all motion under prefers-reduced-motion). `delay` staggers
// siblings without needing separate observers.
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // A generous rootMargin + threshold: 0 means the element is already
    // flagged "intersecting" well before and after its literal viewport
    // bounds, so a fast scroll (a flick, a dragged scrollbar, repeated
    // Page Down) can't jump past it between two observation samples and
    // leave it permanently stuck at opacity: 0.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add("is-visible")
          observer.disconnect()
        }
      },
      { threshold: 0, rootMargin: "200px 0px 200px 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ "--reveal-delay": `${delay}s` } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
