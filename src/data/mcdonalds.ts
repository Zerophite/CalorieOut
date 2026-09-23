import { type Restaurant } from '../types'

// Approximate values from McDonald's Canada nutrition information.
export const mcdonalds: Restaurant = {
  id: 'mcdonalds',
  name: "McDonald's",
  cuisine: 'Burgers · Fast food',
  accent: '#f59e0b',
  segment: 'Fast Food',
  items: [
    { id: 'mcd-bigmac', name: 'Big Mac', kind: 'fixed', category: 'Burgers', serving: '1 burger', nutrition: { calories: 580, protein: 25, carbs: 46, fat: 33, sodium: 1080, sugar: 9 } },
    { id: 'mcd-qtr', name: 'Quarter Pounder with Cheese', kind: 'fixed', category: 'Burgers', serving: '1 burger', nutrition: { calories: 520, protein: 30, carbs: 42, fat: 26, sodium: 1140 } },
    { id: 'mcd-mcdouble', name: 'McDouble', kind: 'fixed', category: 'Burgers', serving: '1 burger', nutrition: { calories: 400, protein: 22, carbs: 33, fat: 20, sodium: 850 } },
    { id: 'mcd-mcchicken', name: 'McChicken', kind: 'fixed', category: 'Chicken', serving: '1 sandwich', nutrition: { calories: 380, protein: 14, carbs: 39, fat: 18, sodium: 610 } },
    { id: 'mcd-mcnuggets10', name: 'Chicken McNuggets (10 pc)', kind: 'fixed', category: 'Chicken', serving: '10 pieces', nutrition: { calories: 420, protein: 24, carbs: 25, fat: 25, sodium: 810 } },
    { id: 'mcd-fries-m', name: 'Medium Fries', kind: 'fixed', category: 'Sides', serving: 'medium', tags: ['vegetarian'], nutrition: { calories: 320, protein: 4, carbs: 43, fat: 15, sodium: 260 } },
    { id: 'mcd-mcmuffin', name: 'Egg McMuffin', kind: 'fixed', category: 'Breakfast', serving: '1 muffin', tags: ['high-protein'], nutrition: { calories: 290, protein: 17, carbs: 30, fat: 12, sodium: 730 } },
    { id: 'mcd-hotcakes', name: 'Hotcakes (with syrup & butter)', kind: 'fixed', category: 'Breakfast', serving: '1 order', tags: ['vegetarian'], nutrition: { calories: 580, protein: 9, carbs: 102, fat: 15, sodium: 700, sugar: 45 } },
    { id: 'mcd-mcflurry', name: 'Oreo McFlurry', kind: 'fixed', category: 'Desserts', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 510, protein: 12, carbs: 80, fat: 16, sodium: 320, sugar: 64 } },
    { id: 'mcd-salad', name: 'Grilled Chicken Caesar Salad', kind: 'fixed', category: 'Salads', serving: '1 bowl (no dressing)', tags: ['high-protein', 'low-carb'], nutrition: { calories: 230, protein: 30, carbs: 10, fat: 8, sodium: 660 } },
  ],
}
