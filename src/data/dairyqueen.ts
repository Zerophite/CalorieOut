import { type Restaurant } from '../types'

// Dairy Queen — 107 products, loaded on demand from ./menus.
export const dairyqueen: Restaurant = {
  id: 'dairy-queen',
  name: 'Dairy Queen',
  cuisine: 'Treats & Burgers · Fast food',
  accent: '#2563eb',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 107,
  hasBuilder: false,
  loadItems: () => import('./menus/dairyqueen.items').then((m) => m.items),
}
