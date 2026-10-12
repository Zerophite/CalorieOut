import { type Restaurant } from '../types'

// Firehouse Subs — 89 products, loaded on demand from ./menus.
export const firehousesubs: Restaurant = {
  id: 'firehouse-subs',
  name: 'Firehouse Subs',
  cuisine: 'Subs · Fast food',
  accent: '#b91c1c',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 89,
  hasBuilder: false,
  loadItems: () => import('./menus/firehousesubs.items').then((m) => m.items),
}
