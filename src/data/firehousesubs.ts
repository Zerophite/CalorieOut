import { type Restaurant } from '../types'
import { buildComponents, REF } from './components'

// Approximate values based on Firehouse Subs Canada nutrition info
// (medium sub, ~8", on white unless noted).
const subRoll = { calories: 260, protein: 9, carbs: 48, fat: 3, sodium: 700 }
export const firehousesubs: Restaurant = {
  id: 'firehouse-subs',
  name: 'Firehouse Subs',
  cuisine: 'Subs · Fast food',
  accent: '#dc2626',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [
    {
      id: 'fh-hero', name: 'Hook & Ladder (medium)', kind: 'fixed', category: 'Sandwiches', serving: 'medium sub', tags: ['high-protein'],
      nutrition: { calories: 520, protein: 30, carbs: 52, fat: 20, sodium: 1560 },
      components: buildComponents({ calories: 520, protein: 30, carbs: 52, fat: 20, sodium: 1560 }, [
        { id: 'bread', name: 'Sub roll', n: subRoll, removable: false },
        { id: 'meat', name: 'Turkey & ham', core: true },
        { id: 'cheese', name: 'Monterey Jack cheese', n: REF.cheeseSlice },
        { id: 'mayo', name: 'Mayo', n: REF.mayo },
        { id: 'veg', name: 'Lettuce, tomato, onion', n: { calories: 15, protein: 0, carbs: 3, fat: 0, sodium: 10 } },
      ]),
    },
    {
      id: 'fh-italian', name: 'Firehouse Italian (medium)', kind: 'fixed', category: 'Sandwiches', serving: 'medium sub',
      nutrition: { calories: 660, protein: 30, carbs: 54, fat: 34, sodium: 2200 },
      components: buildComponents({ calories: 660, protein: 30, carbs: 54, fat: 34, sodium: 2200 }, [
        { id: 'bread', name: 'Sub roll', n: subRoll, removable: false },
        { id: 'meat', name: 'Salami, pepperoni & ham', core: true },
        { id: 'cheese', name: 'Provolone', n: { calories: 80, protein: 5, carbs: 1, fat: 7, sodium: 250 } },
        { id: 'dressing', name: 'Italian dressing', n: { calories: 80, protein: 0, carbs: 1, fat: 9, sodium: 200 } },
        { id: 'veg', name: 'Lettuce, tomato, onion', n: { calories: 15, protein: 0, carbs: 3, fat: 0, sodium: 10 } },
      ]),
    },
    {
      id: 'fh-meatball', name: 'Meatball (medium)', kind: 'fixed', category: 'Sandwiches', serving: 'medium sub',
      nutrition: { calories: 680, protein: 32, carbs: 60, fat: 34, sodium: 1900 },
      components: buildComponents({ calories: 680, protein: 32, carbs: 60, fat: 34, sodium: 1900 }, [
        { id: 'bread', name: 'Sub roll', n: subRoll, removable: false },
        { id: 'meatballs', name: 'Meatballs', core: true },
        { id: 'marinara', name: 'Marinara sauce', n: { calories: 60, protein: 2, carbs: 10, fat: 2, sodium: 400 } },
        { id: 'cheese', name: 'Provolone', n: { calories: 80, protein: 5, carbs: 1, fat: 7, sodium: 250 } },
      ]),
    },
    {
      id: 'fh-turkey', name: 'Smokehouse Turkey (medium)', kind: 'fixed', category: 'Sandwiches', serving: 'medium sub', tags: ['high-protein'],
      nutrition: { calories: 560, protein: 34, carbs: 54, fat: 22, sodium: 1800 },
      components: buildComponents({ calories: 560, protein: 34, carbs: 54, fat: 22, sodium: 1800 }, [
        { id: 'bread', name: 'Sub roll', n: subRoll, removable: false },
        { id: 'turkey', name: 'Smoked turkey', core: true },
        { id: 'bacon', name: 'Bacon', n: REF.bacon2 },
        { id: 'cheese', name: 'Cheddar', n: REF.cheeseSlice },
        { id: 'sauce', name: 'Honey mustard & mayo', n: { calories: 90, protein: 0, carbs: 4, fat: 8, sodium: 200 } },
      ]),
    },
    {
      id: 'fh-steak-cheese', name: 'Steak & Cheese (medium)', kind: 'fixed', category: 'Sandwiches', serving: 'medium sub',
      nutrition: { calories: 620, protein: 36, carbs: 52, fat: 28, sodium: 1500 },
      components: buildComponents({ calories: 620, protein: 36, carbs: 52, fat: 28, sodium: 1500 }, [
        { id: 'bread', name: 'Sub roll', n: subRoll, removable: false },
        { id: 'steak', name: 'Steak', core: true },
        { id: 'cheese', name: 'Provolone', n: { calories: 80, protein: 5, carbs: 1, fat: 7, sodium: 250 } },
        { id: 'mayo', name: 'Mayo', n: REF.mayo },
        { id: 'veg', name: 'Peppers, onion, mushroom', n: { calories: 25, protein: 1, carbs: 5, fat: 0, sodium: 40 } },
      ]),
    },
    { id: 'fh-chili', name: 'Firehouse Chili', kind: 'fixed', category: 'Mains', serving: '1 cup', tags: ['high-protein'], nutrition: { calories: 280, protein: 18, carbs: 26, fat: 12, sodium: 1050, fiber: 7 } },
  ],
}
