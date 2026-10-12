import { type Restaurant } from '../types'

// Thai Express — 64 products, loaded on demand from ./menus.
export const thaiexpress: Restaurant = {
  id: 'thai-express',
  name: 'Thai Express',
  cuisine: 'Thai · Fast food',
  accent: '#dc2626',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 64,
  hasBuilder: false,
  loadItems: () => import('./menus/thaiexpress.items').then((m) => m.items),
}
