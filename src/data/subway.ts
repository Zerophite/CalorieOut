import { type Restaurant } from '../types'

// Subway — 101 products, loaded on demand from ./menus.
export const subway: Restaurant = {
  id: 'subway',
  name: 'Subway',
  cuisine: 'Sandwiches · Build-your-own',
  accent: '#16a34a',
  segment: 'Build-Your-Own',
  dataSource: 'official',
  items: [],
  itemCount: 101,
  hasBuilder: true,
  loadItems: () => import('./menus/subway.items').then((m) => m.items),
}
