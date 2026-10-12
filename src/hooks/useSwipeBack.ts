import { useEffect, useRef } from 'react'

/**
 * Dismiss the current screen with a downward swipe (when the page is scrolled
 * to the top) instead of repeatedly tapping Back. Also maps the Escape key to
 * the same action on desktop. Only active while `enabled` (i.e. there's
 * somewhere to go back to).
 */
export function useSwipeBack(onBack: () => void, enabled: boolean) {
  const onBackRef = useRef(onBack)
  onBackRef.current = onBack

  useEffect(() => {
    if (!enabled) return

    let startY = 0
    let startX = 0
    let startT = 0
    let atTop = false
    let tracking = false

    const topScroll = () =>
      window.scrollY || document.documentElement.scrollTop || 0

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const t = e.touches[0]
      startY = t.clientY
      startX = t.clientX
      startT = Date.now()
      atTop = topScroll() <= 2
      tracking = true
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking) return
      tracking = false
      const t = e.changedTouches[0]
      const dy = t.clientY - startY
      const dx = t.clientX - startX
      const dt = Date.now() - startT
      // Downward, mostly-vertical, reasonably quick swipe starting at the top.
      if (atTop && dy > 90 && Math.abs(dx) < 70 && dt < 800) {
        onBackRef.current()
      }
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBackRef.current()
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKey)
    }
  }, [enabled])
}
