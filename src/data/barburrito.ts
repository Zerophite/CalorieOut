import { type Restaurant } from '../types'

// Bar Burrito — 11 products, loaded on demand from ./menus.
export const barburrito: Restaurant = {
  id: 'bar-burrito',
  name: 'Bar Burrito',
  cuisine: 'Mexican · Build-your-own',
  accent: '#e11d48',
  segment: 'Build-Your-Own',
  dataSource: 'official',
  items: [],
  itemCount: 11,
  hasBuilder: true,
  loadItems: () => import('./menus/barburrito.items').then((m) => m.items),
}
