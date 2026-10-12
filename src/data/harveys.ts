import { type Restaurant } from '../types'

// Harvey's — 79 products, loaded on demand from ./menus.
export const harveys: Restaurant = {
  id: 'harveys',
  name: "Harvey's",
  cuisine: 'Burgers · Fast food',
  accent: '#dc2626',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 79,
  hasBuilder: false,
  loadItems: () => import('./menus/harveys.items').then((m) => m.items),
}
