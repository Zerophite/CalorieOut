import { type Restaurant } from '../types'

// Wendy's — 103 products, loaded on demand from ./menus.
export const wendys: Restaurant = {
  id: 'wendys',
  name: "Wendy's",
  cuisine: 'Burgers · Fast food',
  accent: '#b91c1c',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 103,
  hasBuilder: false,
  loadItems: () => import('./menus/wendys.items').then((m) => m.items),
}
