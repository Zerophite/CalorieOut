import { type Nutrition } from './types'

/** Which screen the app is showing. */
export type View =
  | { name: 'home' }
  | { name: 'restaurant'; restaurantId: string }
  | { name: 'item'; restaurantId: string; itemId: string }
  | { name: 'search' }
  | { name: 'compare' }

/** A snapshot pinned to the compare tray. Builders store the built total. */
export interface CompareEntry {
  key: string
  restaurantName: string
  restaurantAccent: string
  itemName: string
  detail?: string
  nutrition: Nutrition
}
