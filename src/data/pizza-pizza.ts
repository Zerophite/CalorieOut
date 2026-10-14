import { type Restaurant } from '../types'

// Pizza Pizza — 87 products, loaded on demand from ./menus.
export const pizzaPizza: Restaurant = {
  id: 'pizza-pizza',
  name: 'Pizza Pizza',
  cuisine: 'Pizza · Wings · Fast food',
  accent: '#ea580c',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: 87,
  hasBuilder: false,
  loadItems: () => import('./menus/pizza-pizza.items').then((m) => m.items),
}
