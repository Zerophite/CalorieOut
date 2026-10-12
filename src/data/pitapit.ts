import { type Restaurant } from '../types'

// Pita Pit — 98 products, loaded on demand from ./menus.
export const pitapit: Restaurant = {
  id: 'pita-pit',
  name: 'Pita Pit',
  cuisine: 'Pitas · Build-your-own',
  accent: '#65a30d',
  segment: 'Build-Your-Own',
  dataSource: 'official',
  items: [],
  itemCount: 98,
  hasBuilder: true,
  loadItems: () => import('./menus/pitapit.items').then((m) => m.items),
}
