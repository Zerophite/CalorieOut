import { type Restaurant } from '../types'

// Starbucks — 220 products, loaded on demand from ./menus.
export const starbucks: Restaurant = {
  id: 'starbucks',
  name: 'Starbucks',
  cuisine: 'Coffee · Bakery',
  accent: '#15803d',
  segment: 'Coffee & Bakery',
  dataSource: 'official',
  items: [],
  itemCount: 220,
  hasBuilder: false,
  loadItems: () => import('./menus/starbucks.items').then((m) => m.items),
}
