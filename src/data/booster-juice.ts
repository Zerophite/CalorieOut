import { type Restaurant } from '../types'

// Booster Juice — 65 products, loaded on demand from ./menus.
export const boosterJuice: Restaurant = {
  id: 'booster-juice',
  name: 'Booster Juice',
  cuisine: 'Smoothies · Juice · Healthy',
  accent: '#f59e0b',
  segment: 'Coffee & Bakery',
  dataSource: 'official',
  items: [],
  itemCount: 65,
  hasBuilder: false,
  loadItems: () => import('./menus/booster-juice.items').then((m) => m.items),
}
