import { type Restaurant } from '../types'

// Mr. Sub — 59 products, loaded on demand from ./menus.
export const mrSub: Restaurant = {
  id: 'mr-sub',
  name: 'Mr. Sub',
  cuisine: 'Subs · Sandwiches',
  accent: '#16a34a',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 59,
  hasBuilder: false,
  loadItems: () => import('./menus/mr-sub.items').then((m) => m.items),
}
