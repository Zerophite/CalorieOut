import { type Restaurant } from '../types'

// Noodlebox — 42 products, loaded on demand from ./menus.
export const noodlebox: Restaurant = {
  id: 'noodle-box',
  name: 'Noodlebox',
  cuisine: 'Asian noodles · Stir-fry',
  accent: '#dc2626',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 42,
  hasBuilder: false,
  loadItems: () => import('./menus/noodlebox.items').then((m) => m.items),
}
