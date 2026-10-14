import { type Restaurant } from '../types'

// Popeyes — 76 products, loaded on demand from ./menus.
export const popeyes: Restaurant = {
  id: 'popeyes',
  name: 'Popeyes',
  cuisine: 'Fried chicken · Fast food',
  accent: '#f97316',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 76,
  hasBuilder: false,
  loadItems: () => import('./menus/popeyes.items').then((m) => m.items),
}
