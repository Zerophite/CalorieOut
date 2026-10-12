import { type RefObject, useEffect, useRef } from 'react'

/**
 * Dismiss the current screen by dragging it down (when the page is scrolled to
 * the top), like closing a sheet. The page follows the finger, then either
 * slides away and goes back, or springs back into place. Escape does the same
 * on desktop. Only active while `enabled` (there's somewhere to go back to).
 */
export function useSwipeBack(
  onBack: () => void,
  enabled: boolean,
  targetRef: RefObject<HTMLElement | null>,
) {
  const onBackRef = useRef(onBack)
  onBackRef.current = onBack

  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    const prevOverscroll = root.style.overscrollBehaviorY
    // Stop the browser's own pull-to-refresh from fighting the gesture.
    root.style.overscrollBehaviorY = 'none'

    let startY = 0
    let startX = 0
    let lastY = 0
    let lastT = 0
    let velocity = 0
    let dragging = false
    let decided = false
    let closing = false

    const el = () => targetRef.current
    const setStyle = (y: number, animate: boolean) => {
      const node = el()
      if (!node) return
      node.style.transition = animate ? 'transform 220ms cubic-bezier(.2,.8,.2,1), opacity 220ms ease' : 'none'
      node.style.transform = y ? `translate3d(0, ${y}px, 0)` : ''
      node.style.opacity = y ? String(Math.max(0.35, 1 - y / 600)) : ''
    }

    const onTouchStart = (e: TouchEvent) => {
      if (closing || e.touches.length !== 1) return
      const atTop = (window.scrollY || root.scrollTop || 0) <= 0
      if (!atTop) return
      const t = e.touches[0]
      startY = lastY = t.clientY
      startX = t.clientX
      lastT = performance.now()
      velocity = 0
      dragging = true
      decided = false
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!dragging) return
      const t = e.touches[0]
      const dy = t.clientY - startY
      const dx = t.clientX - startX
      if (!decided) {
        if (Math.abs(dy) < 8 && Math.abs(dx) < 8) return
        // Only a downward, mostly vertical drag becomes a dismiss gesture.
        if (dy <= 0 || Math.abs(dx) > Math.abs(dy)) {
          dragging = false
          return
        }
        decided = true
      }
      const now = performance.now()
      velocity = (t.clientY - lastY) / Math.max(1, now - lastT)
      lastY = t.clientY
      lastT = now
      // Resistance grows the further it's pulled.
      const y = dy < 0 ? 0 : dy * 0.85 - (dy * dy) / 4000
      if (e.cancelable) e.preventDefault()
      setStyle(Math.max(0, y), false)
    }

    const onTouchEnd = () => {
      if (!dragging) return
      dragging = false
      if (!decided) return
      const dy = lastY - startY
      if (dy > 120 || (dy > 50 && velocity > 0.6)) {
        closing = true
        setStyle(window.innerHeight * 0.6, true)
        window.setTimeout(() => {
          onBackRef.current()
          setStyle(0, false)
          closing = false
        }, 200)
      } else {
        setStyle(0, true)
      }
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBackRef.current()
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      root.style.overscrollBehaviorY = prevOverscroll
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
      window.removeEventListener('keydown', onKey)
    }
  }, [enabled, targetRef])
}
