import { type Restaurant } from '../types'

// Mary Brown's — 46 products, loaded on demand from ./menus.
export const marybrowns: Restaurant = {
  id: 'mary-browns',
  name: "Mary Brown's",
  cuisine: 'Fried chicken · Fast food',
  accent: '#166534',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 46,
  hasBuilder: false,
  loadItems: () => import('./menus/marybrowns.items').then((m) => m.items),
}
