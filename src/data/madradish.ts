import { type Restaurant } from '../types'

// Mad Radish — 50 products, loaded on demand from ./menus.
export const madradish: Restaurant = {
  id: 'bad-radish',
  name: 'Mad Radish',
  cuisine: 'Healthy bowls, salads & wraps',
  accent: '#65a30d',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 50,
  hasBuilder: true,
  loadItems: () => import('./menus/madradish.items').then((m) => m.items),
}
