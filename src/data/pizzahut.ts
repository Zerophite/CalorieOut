import { type Restaurant } from '../types'

// Pizza Hut — 136 products, loaded on demand from ./menus.
export const pizzahut: Restaurant = {
  id: 'pizza-hut',
  name: 'Pizza Hut',
  cuisine: 'Pizza · Fast food',
  accent: '#dc2626',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 136,
  hasBuilder: false,
  loadItems: () => import('./menus/pizzahut.items').then((m) => m.items),
}
