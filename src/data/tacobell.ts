import { type Restaurant } from '../types'

// Taco Bell — 68 products, loaded on demand from ./menus.
export const tacobell: Restaurant = {
  id: 'taco-bell',
  name: 'Taco Bell',
  cuisine: 'Mexican · Fast food',
  accent: '#7c3aed',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 68,
  hasBuilder: false,
  loadItems: () => import('./menus/tacobell.items').then((m) => m.items),
}
