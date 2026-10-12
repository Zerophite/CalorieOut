import { type Restaurant } from '../types'

// Tim Hortons — 373 products, loaded on demand from ./menus.
export const timhortons: Restaurant = {
  id: 'tim-hortons',
  name: 'Tim Hortons',
  cuisine: 'Coffee · Bakery',
  accent: '#dc2626',
  segment: 'Coffee & Bakery',
  dataSource: 'official',
  items: [],
  itemCount: 373,
  hasBuilder: false,
  loadItems: () => import('./menus/timhortons.items').then((m) => m.items),
}
