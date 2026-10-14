import { type Restaurant } from '../types'

// Five Guys — 27 products, loaded on demand from ./menus.
export const fiveguys: Restaurant = {
  id: 'five-guys',
  name: 'Five Guys',
  cuisine: 'Burgers & fries · Fast food',
  accent: '#dc2626',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 27,
  hasBuilder: false,
  loadItems: () => import('./menus/fiveguys.items').then((m) => m.items),
}
