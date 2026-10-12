import { type Restaurant } from '../types'

// Little Caesars — 34 products, loaded on demand from ./menus.
export const littlecaesars: Restaurant = {
  id: 'little-caesars',
  name: 'Little Caesars',
  cuisine: 'Pizza · Fast food',
  accent: '#ea580c',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 34,
  hasBuilder: false,
  loadItems: () => import('./menus/littlecaesars.items').then((m) => m.items),
}
