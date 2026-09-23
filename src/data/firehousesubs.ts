import { type Restaurant } from '../types'

// Approximate values based on Firehouse Subs Canada nutrition info
// (medium sub, ~8", on white unless noted).
export const firehousesubs: Restaurant = {
  id: 'firehouse-subs',
  name: 'Firehouse Subs',
  cuisine: 'Subs · Fast food',
  accent: '#dc2626',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [
    { id: 'fh-hero', name: 'Hook & Ladder (medium)', kind: 'fixed', category: 'Sandwiches', serving: 'medium sub', tags: ['high-protein'], nutrition: { calories: 520, protein: 30, carbs: 52, fat: 20, sodium: 1560 } },
    { id: 'fh-italian', name: 'Firehouse Italian (medium)', kind: 'fixed', category: 'Sandwiches', serving: 'medium sub', nutrition: { calories: 660, protein: 30, carbs: 54, fat: 34, sodium: 2200 } },
    { id: 'fh-meatball', name: 'Meatball (medium)', kind: 'fixed', category: 'Sandwiches', serving: 'medium sub', nutrition: { calories: 680, protein: 32, carbs: 60, fat: 34, sodium: 1900 } },
    { id: 'fh-turkey', name: 'Smokehouse Turkey (medium)', kind: 'fixed', category: 'Sandwiches', serving: 'medium sub', tags: ['high-protein'], nutrition: { calories: 560, protein: 34, carbs: 54, fat: 22, sodium: 1800 } },
    { id: 'fh-steak-cheese', name: 'Steak & Cheese (medium)', kind: 'fixed', category: 'Sandwiches', serving: 'medium sub', nutrition: { calories: 620, protein: 36, carbs: 52, fat: 28, sodium: 1500 } },
    { id: 'fh-chili', name: 'Firehouse Chili', kind: 'fixed', category: 'Mains', serving: '1 cup', tags: ['high-protein'], nutrition: { calories: 280, protein: 18, carbs: 26, fat: 12, sodium: 1050, fiber: 7 } },
  ],
}
