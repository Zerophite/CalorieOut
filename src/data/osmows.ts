import { type Restaurant } from '../types'

// Osmow's Shawarma — 64 products, loaded on demand from ./menus.
export const osmows: Restaurant = {
  id: 'osmows',
  name: "Osmow's Shawarma",
  cuisine: 'Shawarma · Mediterranean',
  accent: '#0f766e',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 64,
  hasBuilder: false,
  loadItems: () => import('./menus/osmows.items').then((m) => m.items),
}
