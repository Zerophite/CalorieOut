import { type Restaurant } from '../types'

// Approximate values from Dairy Queen Canada nutrition information.
export const dairyqueen: Restaurant = {
  id: 'dairy-queen',
  name: 'Dairy Queen',
  cuisine: 'Treats & Burgers · Fast food',
  accent: '#dc2626',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [
    { id: 'dq-blizzard-oreo-m', name: 'Oreo Blizzard', kind: 'fixed', category: 'Desserts', serving: 'medium', tags: ['vegetarian'], nutrition: { calories: 780, protein: 14, carbs: 108, fat: 32, sodium: 490, sugar: 84 } },
    { id: 'dq-blizzard-oreo-s', name: 'Oreo Blizzard', kind: 'fixed', category: 'Desserts', serving: 'small', tags: ['vegetarian'], nutrition: { calories: 480, protein: 9, carbs: 67, fat: 19, sodium: 300, sugar: 52 } },
    { id: 'dq-cone-m', name: 'Vanilla Cone', kind: 'fixed', category: 'Desserts', serving: 'medium', tags: ['vegetarian'], nutrition: { calories: 340, protein: 8, carbs: 54, fat: 10, sodium: 160, sugar: 40 } },
    { id: 'dq-dilly-bar', name: 'Chocolate Dilly Bar', kind: 'fixed', category: 'Desserts', serving: '1 bar', tags: ['vegetarian'], nutrition: { calories: 240, protein: 4, carbs: 24, fat: 15, sodium: 75, sugar: 20 } },
    { id: 'dq-cheeseburger', name: 'DQ Cheeseburger', kind: 'fixed', category: 'Burgers', serving: '1 burger', nutrition: { calories: 400, protein: 21, carbs: 34, fat: 20, sodium: 850 } },
    { id: 'dq-chicken-strips-4', name: 'Chicken Strip Basket (4 pc)', kind: 'fixed', category: 'Chicken', serving: 'with fries & gravy', nutrition: { calories: 1000, protein: 40, carbs: 92, fat: 52, sodium: 2400 } },
    { id: 'dq-fries', name: 'Fries', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 310, protein: 4, carbs: 43, fat: 14, sodium: 630 } },
  ],
}
