import { type Restaurant } from '../types'

// Burger King — 131 products, loaded on demand from ./menus.
export const burgerking: Restaurant = {
  id: 'burger-king',
  name: 'Burger King',
  cuisine: 'Burgers · Fast food',
  accent: '#d97706',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 131,
  hasBuilder: false,
  loadItems: () => import('./menus/burgerking.items').then((m) => m.items),
}
