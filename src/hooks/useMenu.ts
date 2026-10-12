import { useEffect, useState } from 'react'
import { type MenuItem, type Restaurant } from '../types'

// Large menus are code-split and fetched when first needed. Loaded menus are
// cached for the rest of the session.
const cache = new Map<string, MenuItem[]>()
const inflight = new Map<string, Promise<MenuItem[]>>()

export function menuOf(restaurant: Restaurant): MenuItem[] | undefined {
  if (!restaurant.loadItems) return restaurant.items
  return cache.get(restaurant.id)
}

export function loadMenu(restaurant: Restaurant): Promise<MenuItem[]> {
  const ready = menuOf(restaurant)
  if (ready) return Promise.resolve(ready)
  let p = inflight.get(restaurant.id)
  if (!p) {
    p = restaurant.loadItems!().then((items) => {
      cache.set(restaurant.id, items)
      inflight.delete(restaurant.id)
      return items
    })
    inflight.set(restaurant.id, p)
  }
  return p
}

/** A restaurant's menu, loading it if needed. `items` is undefined while loading. */
export function useMenu(restaurant: Restaurant | undefined): MenuItem[] | undefined {
  const [items, setItems] = useState<MenuItem[] | undefined>(() =>
    restaurant ? menuOf(restaurant) : undefined,
  )
  useEffect(() => {
    if (!restaurant) return
    const ready = menuOf(restaurant)
    if (ready) {
      setItems(ready)
      return
    }
    let alive = true
    setItems(undefined)
    loadMenu(restaurant).then((it) => alive && setItems(it))
    return () => {
      alive = false
    }
  }, [restaurant])
  return items
}

/** Every restaurant with its full menu (used by search). */
export function useAllMenus(restaurants: Restaurant[]): Restaurant[] | undefined {
  const [all, setAll] = useState<Restaurant[] | undefined>(() =>
    restaurants.every((r) => menuOf(r)) ? restaurants.map((r) => ({ ...r, items: menuOf(r)! })) : undefined,
  )
  useEffect(() => {
    let alive = true
    Promise.all(restaurants.map(async (r) => ({ ...r, items: await loadMenu(r) }))).then(
      (rs) => alive && setAll(rs),
    )
    return () => {
      alive = false
    }
  }, [restaurants])
  return all
}
