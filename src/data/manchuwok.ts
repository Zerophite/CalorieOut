import { type Restaurant } from '../types'

// Manchu Wok — 42 products, loaded on demand from ./menus.
export const manchuwok: Restaurant = {
  id: 'manchu-wok',
  name: 'Manchu Wok',
  cuisine: 'Chinese · Fast food',
  accent: '#b91c1c',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 42,
  hasBuilder: false,
  loadItems: () => import('./menus/manchuwok.items').then((m) => m.items),
}
