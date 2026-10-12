import { type Restaurant } from '../types'

// A&W — 102 products, loaded on demand from ./menus.
export const aw: Restaurant = {
  id: 'aw',
  name: 'A&W',
  cuisine: 'Burgers · Fast food',
  accent: '#f97316',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 102,
  hasBuilder: false,
  loadItems: () => import('./menus/aw.items').then((m) => m.items),
}
