import { type Restaurant } from '../types'

// Approximate values from Mary Brown's Chicken Canada nutrition information.
export const marybrowns: Restaurant = {
  id: 'mary-browns',
  name: "Mary Brown's",
  cuisine: 'Fried chicken · Fast food',
  accent: '#166534',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [
    { id: 'mb-big-mary', name: 'Big Mary Sandwich', kind: 'fixed', category: 'Sandwiches', serving: '1 sandwich', tags: ['high-protein'], nutrition: { calories: 620, protein: 34, carbs: 52, fat: 30, sodium: 1350 } },
    { id: 'mb-breast', name: 'Chicken Breast', kind: 'fixed', category: 'Chicken', serving: '1 piece', tags: ['high-protein'], nutrition: { calories: 360, protein: 35, carbs: 15, fat: 18, sodium: 900 } },
    { id: 'mb-tenders-3', name: 'Chicken Tenders (3 pc)', kind: 'fixed', category: 'Chicken', serving: '3 pieces', tags: ['high-protein'], nutrition: { calories: 380, protein: 32, carbs: 22, fat: 18, sodium: 1100 } },
    { id: 'mb-taters', name: 'Famous Taters', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 320, protein: 4, carbs: 40, fat: 16, sodium: 640 } },
    { id: 'mb-poutine', name: "Mary's Poutine", kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 620, protein: 15, carbs: 58, fat: 36, sodium: 1500 } },
    { id: 'mb-gravy-taters', name: 'Taters with Gravy', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 400, protein: 6, carbs: 48, fat: 20, sodium: 1000 } },
  ],
}
