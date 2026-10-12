import { type Restaurant } from '../types'

// The Works — 97 products, loaded on demand from ./menus.
export const theworks: Restaurant = {
  id: 'the-works',
  name: 'The Works',
  cuisine: 'Gourmet burgers',
  accent: '#78350f',
  segment: 'Sit-Down',
  dataSource: 'official',
  items: [],
  itemCount: 97,
  hasBuilder: true,
  loadItems: () => import('./menus/theworks.items').then((m) => m.items),
}
