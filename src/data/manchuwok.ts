import { type Restaurant } from '../types'

// Approximate values based on Manchu Wok Canada nutrition info (per entrée
// portion; combos add rice/noodles separately).
export const manchuwok: Restaurant = {
  id: 'manchu-wok',
  name: 'Manchu Wok',
  cuisine: 'Chinese · Fast food',
  accent: '#b91c1c',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [
    { id: 'mw-fried-rice', name: 'Fried Rice', kind: 'fixed', category: 'Sides', serving: '1 scoop', tags: ['vegetarian'], nutrition: { calories: 380, protein: 8, carbs: 62, fat: 11, sodium: 780 } },
    { id: 'mw-chow-mein', name: 'Chow Mein', kind: 'fixed', category: 'Sides', serving: '1 scoop', tags: ['vegan'], nutrition: { calories: 320, protein: 8, carbs: 52, fat: 9, sodium: 900 } },
    { id: 'mw-sweet-sour', name: 'Sweet & Sour Chicken', kind: 'fixed', category: 'Mains', serving: '1 entrée', nutrition: { calories: 520, protein: 20, carbs: 62, fat: 22, sodium: 700, sugar: 30 } },
    { id: 'mw-orange-chicken', name: 'Orange Chicken', kind: 'fixed', category: 'Mains', serving: '1 entrée', nutrition: { calories: 490, protein: 22, carbs: 52, fat: 22, sodium: 950, sugar: 24 } },
    { id: 'mw-beef-broccoli', name: 'Beef & Broccoli', kind: 'fixed', category: 'Mains', serving: '1 entrée', tags: ['high-protein'], nutrition: { calories: 340, protein: 24, carbs: 20, fat: 18, sodium: 1200 } },
    { id: 'mw-black-pepper-chicken', name: 'Black Pepper Chicken', kind: 'fixed', category: 'Mains', serving: '1 entrée', tags: ['high-protein'], nutrition: { calories: 360, protein: 26, carbs: 22, fat: 18, sodium: 1100 } },
    { id: 'mw-egg-roll', name: 'Egg Roll', kind: 'fixed', category: 'Sides', serving: '1 roll', tags: ['vegetarian'], nutrition: { calories: 200, protein: 5, carbs: 24, fat: 9, sodium: 400 } },
  ],
}
