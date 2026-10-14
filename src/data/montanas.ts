import { type Restaurant } from '../types'

// Montana's — 79 products, loaded on demand from ./menus.
export const montanas: Restaurant = {
  id: 'montanas',
  name: "Montana's",
  cuisine: 'BBQ · Ribs · Sit-down',
  accent: '#7c2d12',
  segment: 'Sit-Down',
  dataSource: 'official',
  items: [],
  itemCount: 79,
  hasBuilder: false,
  loadItems: () => import('./menus/montanas.items').then((m) => m.items),
}
