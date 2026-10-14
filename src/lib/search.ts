import { type MenuItem, type Nutrition, type Restaurant } from '../types'
import { baseNutrition, minimalNutrition } from './nutrition'
import { cuisinesOf } from './cuisine'

/** A menu item flattened together with its parent restaurant for global search. */
export interface SearchEntry {
  restaurant: Restaurant
  item: MenuItem
  /** For fixed items this is the exact nutrition; for builders it's the
   *  lowest-calorie build, so "under X calories" search stays meaningful. */
  nutrition: Nutrition
  isBuilder: boolean
  /** Lower-case text searched by the query (name, restaurant, category…). */
  text: string
  /** Cuisine ids this dish belongs to (see lib/cuisine). */
  cuisines: string[]
}

/** Lower-case, accent-free text for matching ("Thaï" finds "thai"). */
export const fold = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')

export function buildIndex(restaurants: Restaurant[]): SearchEntry[] {
  const entries: SearchEntry[] = []
  for (const restaurant of restaurants) {
    for (const item of restaurant.items) {
      entries.push({
        restaurant,
        item,
        nutrition:
          item.kind === 'builder' ? minimalNutrition(item) : baseNutrition(item),
        isBuilder: item.kind === 'builder',
        text: fold(`${item.name} ${restaurant.name} ${restaurant.cuisine} ${item.description ?? ''} ${item.category}`),
        cuisines: cuisinesOf(restaurant, item),
      })
    }
  }
  return entries
}

export interface SearchFilters {
  query: string
  maxCalories?: number
  minProtein?: number
  category?: string
  restaurantId?: string
  vegetarianOnly?: boolean
  cuisine?: string
}

export function filterEntries(
  entries: SearchEntry[],
  filters: SearchFilters,
): SearchEntry[] {
  // Every word must appear somewhere ("chicken wrap" finds "Crispy Chicken Wrap").
  const words = fold(filters.query).split(/\s+/).filter(Boolean)

  return entries.filter(({ restaurant, item, nutrition, text, cuisines }) => {
    if (words.length && !words.every((w) => text.includes(w))) return false
    if (filters.cuisine && !cuisines.includes(filters.cuisine)) return false
    if (filters.restaurantId && restaurant.id !== filters.restaurantId)
      return false
    if (filters.category && item.category !== filters.category) return false
    if (
      filters.maxCalories !== undefined &&
      nutrition.calories > filters.maxCalories
    )
      return false
    if (
      filters.minProtein !== undefined &&
      nutrition.protein < filters.minProtein
    )
      return false
    if (filters.vegetarianOnly) {
      const tags = item.tags ?? []
      if (!tags.includes('vegetarian') && !tags.includes('vegan')) return false
    }
    return true
  })
}
