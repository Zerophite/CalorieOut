import { type Restaurant } from '../types'

// McDonald's Canada — 185 items, loaded on demand from ./menus.
export const mcdonalds: Restaurant = {
  id: 'mcdonalds',
  name: "McDonald's",
  cuisine: 'Burgers · Fast food',
  accent: '#f59e0b',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 185,
  hasBuilder: false,
  loadItems: () => import('./menus/mcdonalds.items').then((m) => m.items),
}
