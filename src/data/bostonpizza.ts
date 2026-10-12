import { type Restaurant } from '../types'

// Boston Pizza — 98 products, loaded on demand from ./menus.
export const bostonpizza: Restaurant = {
  id: 'boston-pizza',
  name: 'Boston Pizza',
  cuisine: 'Pizza & Pasta · Sit-down',
  accent: '#1d4ed8',
  segment: 'Sit-Down',
  dataSource: 'official',
  items: [],
  itemCount: 98,
  hasBuilder: false,
  loadItems: () => import('./menus/bostonpizza.items').then((m) => m.items),
}
