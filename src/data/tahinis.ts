import { type Restaurant } from '../types'

// Tahini's — 42 products, loaded on demand from ./menus.
export const tahinis: Restaurant = {
  id: 'tahinis',
  name: "Tahini's",
  cuisine: 'Middle Eastern · Shawarma',
  accent: '#0f766e',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 42,
  hasBuilder: false,
  loadItems: () => import('./menus/tahinis.items').then((m) => m.items),
}
