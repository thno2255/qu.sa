"use client"

import { useEffect, useRef, type ReactNode } from "react"

// Drifts children vertically at a fraction of scroll speed — a subtle,
// non-interactive depth cue (not a mouse-follow effect, kept restrained for
// an institutional site). Disabled entirely under prefers-reduced-motion.
export function ScrollParallax({
  children,
  factor = 0.12,
  maxOffset = 36,
  className = "",
}: {
  children: ReactNode
  factor?: number
  maxOffset?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    // The offset is a pure function of how far the page has scrolled since
    // mount (not of the element's own, already-transformed position — that
    // would feed back into itself — and not of distance from viewport
    // center, which saturates the clamp immediately for an element that
    // starts far from center, making the "parallax" a frozen constant).
    // At scroll = mount position, offset is exactly 0: the element sits at
    // its natural spot and only starts lagging as the user scrolls past it.
    const scrollYAtMount = window.scrollY

    let ticking = false
    const update = () => {
      ticking = false
      const delta = window.scrollY - scrollYAtMount
      const offset = Math.max(0, Math.min(maxOffset, delta * factor))
      el.style.transform = `translateY(${offset}px)`
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [factor, maxOffset])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
