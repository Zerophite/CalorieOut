import { type MenuItem, type Nutrition, type Restaurant } from '../types'
import { baseNutrition, minimalNutrition } from './nutrition'

/** A menu item flattened together with its parent restaurant for global search. */
export interface SearchEntry {
  restaurant: Restaurant
  item: MenuItem
  /** For fixed items this is the exact nutrition; for builders it's the
   *  lowest-calorie build, so "under X calories" search stays meaningful. */
  nutrition: Nutrition
  isBuilder: boolean
}

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
}

export function filterEntries(
  entries: SearchEntry[],
  filters: SearchFilters,
): SearchEntry[] {
  const q = filters.query.trim().toLowerCase()

  return entries.filter(({ restaurant, item, nutrition }) => {
    if (q) {
      const haystack = `${item.name} ${restaurant.name} ${
        item.description ?? ''
      } ${item.category}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
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
