import { type Restaurant } from '../types'

// Chick-fil-A — 69 products, loaded on demand from ./menus.
export const chickFilA: Restaurant = {
  id: 'chick-fil-a',
  name: 'Chick-fil-A',
  cuisine: 'Chicken sandwiches · Fast food',
  accent: '#e51636',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 69,
  hasBuilder: false,
  loadItems: () => import('./menus/chick-fil-a.items').then((m) => m.items),
}
