import { type Restaurant } from '../types'

// Kettleman's Bagel — 67 products, loaded on demand from ./menus.
export const kettlemans: Restaurant = {
  id: 'kettlemans',
  name: "Kettleman's Bagel",
  cuisine: 'Montreal bagels · Café',
  accent: '#0f766e',
  segment: 'Coffee & Bakery',
  dataSource: 'official',
  items: [],
  itemCount: 67,
  hasBuilder: false,
  loadItems: () => import('./menus/kettlemans.items').then((m) => m.items),
}
