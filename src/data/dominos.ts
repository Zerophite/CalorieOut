import { type Restaurant } from '../types'

// Domino's — 48 products, loaded on demand from ./menus.
export const dominos: Restaurant = {
  id: 'dominos',
  name: "Domino's",
  cuisine: 'Pizza · Wings · Fast food',
  accent: '#0b6fb8',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 48,
  hasBuilder: false,
  loadItems: () => import('./menus/dominos.items').then((m) => m.items),
}
