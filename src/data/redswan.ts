import { type Restaurant } from '../types'

// Red Swan Pizza — 70 products, loaded on demand from ./menus.
export const redswan: Restaurant = {
  id: 'red-swan-pizza',
  name: 'Red Swan Pizza',
  cuisine: 'Pizza',
  accent: '#b91c1c',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 70,
  hasBuilder: false,
  loadItems: () => import('./menus/redswan.items').then((m) => m.items),
}
