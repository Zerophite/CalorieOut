import { type Restaurant } from '../types'

// Approximate values from Swiss Chalet Canada nutrition information.
export const swisschalet: Restaurant = {
  id: 'swiss-chalet',
  name: 'Swiss Chalet',
  cuisine: 'Rotisserie · Sit-down',
  accent: '#b45309',
  segment: 'Sit-Down',
  items: [
    { id: 'sc-qtr-white', name: 'Quarter Chicken White (no skin)', kind: 'fixed', category: 'Mains', serving: 'with fries', tags: ['high-protein'], nutrition: { calories: 620, protein: 48, carbs: 55, fat: 22, sodium: 1050 } },
    { id: 'sc-qtr-dark', name: 'Quarter Chicken Dark', kind: 'fixed', category: 'Mains', serving: 'with fries', tags: ['high-protein'], nutrition: { calories: 700, protein: 42, carbs: 55, fat: 33, sodium: 1180 } },
    { id: 'sc-half-chicken', name: 'Half Chicken Dinner', kind: 'fixed', category: 'Mains', serving: 'with fries', tags: ['high-protein'], nutrition: { calories: 1030, protein: 78, carbs: 56, fat: 52, sodium: 1900 } },
    { id: 'sc-chicken-sandwich', name: 'Festive Chicken Sandwich', kind: 'fixed', category: 'Sandwiches', serving: '1 sandwich', nutrition: { calories: 560, protein: 34, carbs: 52, fat: 24, sodium: 1320 } },
    { id: 'sc-ribs', name: 'Full Rack Ribs', kind: 'fixed', category: 'Mains', serving: 'with fries', nutrition: { calories: 1360, protein: 82, carbs: 78, fat: 78, sodium: 2600 } },
    { id: 'sc-caesar', name: 'Caesar Salad (side)', kind: 'fixed', category: 'Salads', serving: 'side', tags: ['vegetarian'], nutrition: { calories: 340, protein: 7, carbs: 16, fat: 28, sodium: 640 } },
    { id: 'sc-soup', name: 'Chalet Soup', kind: 'fixed', category: 'Mains', serving: '1 bowl', nutrition: { calories: 130, protein: 6, carbs: 20, fat: 3, sodium: 990 } },
    { id: 'sc-fries', name: 'Seasoned Fries', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 430, protein: 6, carbs: 58, fat: 19, sodium: 620 } },
  ],
}
