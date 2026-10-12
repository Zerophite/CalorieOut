import { type Restaurant } from '../types'

// Swiss Chalet — 101 products, loaded on demand from ./menus.
export const swisschalet: Restaurant = {
  id: 'swiss-chalet',
  name: 'Swiss Chalet',
  cuisine: 'Rotisserie · Sit-down',
  accent: '#b45309',
  segment: 'Sit-Down',
  dataSource: 'official',
  items: [],
  itemCount: 101,
  hasBuilder: false,
  loadItems: () => import('./menus/swisschalet.items').then((m) => m.items),
}
