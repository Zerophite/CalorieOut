import { type Restaurant } from '../types'

// Chipotle — 26 products, loaded on demand from ./menus.
export const chipotle: Restaurant = {
  id: 'chipotle',
  name: 'Chipotle',
  cuisine: 'Mexican · Build-your-own',
  accent: '#a81612',
  segment: 'Build-Your-Own',
  dataSource: 'official',
  items: [],
  itemCount: 26,
  hasBuilder: true,
  loadItems: () => import('./menus/chipotle.items').then((m) => m.items),
}
