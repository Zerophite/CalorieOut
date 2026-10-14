import { type Restaurant } from '../types'

// Red Lobster — 138 products, loaded on demand from ./menus.
export const redLobster: Restaurant = {
  id: 'red-lobster',
  name: 'Red Lobster',
  cuisine: 'Seafood · Sit-down',
  accent: '#b91c1c',
  segment: 'Sit-Down',
  dataSource: 'official',
  items: [],
  itemCount: 138,
  hasBuilder: false,
  loadItems: () => import('./menus/red-lobster.items').then((m) => m.items),
}
