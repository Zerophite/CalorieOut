import { type Restaurant } from '../types'

// Mucho Burrito — 20 products, loaded on demand from ./menus.
export const muchoburrito: Restaurant = {
  id: 'mucho-burrito',
  name: 'Mucho Burrito',
  cuisine: 'Mexican · Build-your-own',
  accent: '#c2410c',
  segment: 'Build-Your-Own',
  dataSource: 'official',
  items: [],
  itemCount: 20,
  hasBuilder: true,
  loadItems: () => import('./menus/muchoburrito.items').then((m) => m.items),
}
