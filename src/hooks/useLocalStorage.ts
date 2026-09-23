import { useCallback, useEffect, useState } from 'react'

/**
 * A useState that persists to localStorage. Guarded so it degrades gracefully
 * in private windows or when storage is blocked.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw !== null ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* ignore write failures (private mode, quota, etc.) */
    }
  }, [key, value])

  const set = useCallback(
    (next: T | ((prev: T) => T)) => setValue(next),
    [],
  )

  return [value, set]
}
