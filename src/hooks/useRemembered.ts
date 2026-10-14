import { useEffect, useState } from 'react'

// Screen state that should survive leaving and coming back (open a restaurant,
// press back): kept in memory for the session, not persisted.
const memory = new Map<string, unknown>()

/** useState that remembers its value for the session under `key`. */
export function useRemembered<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => (memory.has(key) ? (memory.get(key) as T) : initial))
  useEffect(() => {
    memory.set(key, value)
  }, [key, value])
  return [value, setValue] as const
}
