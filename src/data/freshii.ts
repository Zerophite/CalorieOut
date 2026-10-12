import { type Restaurant } from '../types'

// Freshii — 66 products, loaded on demand from ./menus.
export const freshii: Restaurant = {
  id: 'freshii',
  name: 'Freshii',
  cuisine: 'Bowls & Salads · Build-your-own',
  accent: '#0d9488',
  segment: 'Build-Your-Own',
  dataSource: 'official',
  items: [],
  itemCount: 66,
  hasBuilder: true,
  loadItems: () => import('./menus/freshii.items').then((m) => m.items),
}
