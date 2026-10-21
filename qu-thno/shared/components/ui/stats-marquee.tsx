"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

// A real infinite marquee: native horizontal scroll (so touch drag on
// mobile just works, no custom pointer-event plumbing needed) driven by a
// requestAnimationFrame loop that nudges scrollLeft every frame. The
// container is forced dir="ltr" purely for scroll mechanics — scrollLeft's
// sign/range under dir="rtl" is still inconsistent across browsers, so
// pinning it to ltr and letting the auto-scroll increase scrollLeft is
// what actually makes content exit left / enter right reliably. The cards
// themselves (passed as children) keep the page's real reading direction.
//
// `children` is one full set of cards. It's duplicated once in the DOM
// (the copy is aria-hidden) so that when the real scroll position passes
// the width of one set, we can snap scrollLeft back by exactly that width
// — invisible, because the pixels at the seam are identical. If the
// content already fits the container without overflowing, the duplicate
// is hidden and the scroll loop never starts — no pointless repetition.
export function StatsMarquee({
  children,
  pxPerSecond = 32,
  className = "",
}: {
  children: ReactNode
  pxPerSecond?: number
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const setRef = useRef<HTMLDivElement>(null)
  const [needsLoop, setNeedsLoop] = useState(true)

  useEffect(() => {
    const container = containerRef.current
    const setEl = setRef.current
    if (!container || !setEl) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let setWidth = 0
    const measure = () => {
      setWidth = setEl.getBoundingClientRect().width
      const fits = setWidth <= container.clientWidth + 1
      setNeedsLoop(!fits)
      container.scrollLeft = 0
    }
    measure()

    const ro = new ResizeObserver(measure)
    ro.observe(container)
    ro.observe(setEl)

    if (reduceMotion) return () => ro.disconnect()

    const pausedRef = { current: false }
    let resumeTimer: ReturnType<typeof setTimeout> | null = null
    const pause = () => {
      pausedRef.current = true
      if (resumeTimer) clearTimeout(resumeTimer)
    }
    const resumeSoon = () => {
      if (resumeTimer) clearTimeout(resumeTimer)
      resumeTimer = setTimeout(() => { pausedRef.current = false }, 1000)
    }

    container.addEventListener("pointerdown", pause)
    container.addEventListener("pointerup", resumeSoon)
    container.addEventListener("pointercancel", resumeSoon)
    container.addEventListener("touchstart", pause, { passive: true })
    container.addEventListener("touchend", resumeSoon, { passive: true })
    container.addEventListener("mouseenter", pause)
    container.addEventListener("mouseleave", resumeSoon)
    container.addEventListener("focusin", pause)
    container.addEventListener("focusout", resumeSoon)

    let lastTime: number | null = null
    let rafId = requestAnimationFrame(function step(time) {
      rafId = requestAnimationFrame(step)
      if (lastTime === null) { lastTime = time; return }
      const dt = (time - lastTime) / 1000
      lastTime = time
      if (pausedRef.current || !setWidth) return
      // setNeedsLoop is read via closure-stable setWidth/container state —
      // re-check live rather than trusting the (possibly stale) React state.
      const fits = setWidth <= container.clientWidth + 1
      if (fits) return
      container.scrollLeft += pxPerSecond * dt
      if (container.scrollLeft >= setWidth) {
        container.scrollLeft -= setWidth
      }
    })

    return () => {
      ro.disconnect()
      cancelAnimationFrame(rafId)
      if (resumeTimer) clearTimeout(resumeTimer)
      container.removeEventListener("pointerdown", pause)
      container.removeEventListener("pointerup", resumeSoon)
      container.removeEventListener("pointercancel", resumeSoon)
      container.removeEventListener("touchstart", pause)
      container.removeEventListener("touchend", resumeSoon)
      container.removeEventListener("mouseenter", pause)
      container.removeEventListener("mouseleave", resumeSoon)
      container.removeEventListener("focusin", pause)
      container.removeEventListener("focusout", resumeSoon)
    }
  }, [pxPerSecond])

  return (
    <div
      ref={containerRef}
      dir="ltr"
      className={`scrollbar-none overflow-x-auto overscroll-x-contain ${needsLoop ? "" : "flex justify-center"} ${className}`}
      style={{ WebkitMaskImage: needsLoop ? "linear-gradient(to right, transparent, black 6%, black 94%, transparent)" : undefined, maskImage: needsLoop ? "linear-gradient(to right, transparent, black 6%, black 94%, transparent)" : undefined }}
    >
      <div className="flex w-max gap-4">
        <div ref={setRef} className="flex gap-4">
          {children}
        </div>
        <div className="flex gap-4" aria-hidden="true" hidden={!needsLoop}>
          {children}
        </div>
      </div>
    </div>
  )
}
