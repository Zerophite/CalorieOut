import { type Restaurant } from '../types'

// KFC — 59 products, loaded on demand from ./menus.
export const kfc: Restaurant = {
  id: 'kfc',
  name: 'KFC',
  cuisine: 'Fried chicken · Fast food',
  accent: '#dc2626',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 59,
  hasBuilder: false,
  loadItems: () => import('./menus/kfc.items').then((m) => m.items),
}
