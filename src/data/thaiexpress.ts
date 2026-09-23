import { type Restaurant } from '../types'

// Approximate values based on Thai Express Canada nutrition info.
export const thaiexpress: Restaurant = {
  id: 'thai-express',
  name: 'Thai Express',
  cuisine: 'Thai · Fast food',
  accent: '#dc2626',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [
    { id: 'te-pad-thai-chicken', name: 'Pad Thai (Chicken)', kind: 'fixed', category: 'Mains', serving: '1 plate', nutrition: { calories: 760, protein: 34, carbs: 96, fat: 26, sodium: 1600 } },
    { id: 'te-pad-thai-shrimp', name: 'Pad Thai (Shrimp)', kind: 'fixed', category: 'Mains', serving: '1 plate', nutrition: { calories: 700, protein: 28, carbs: 96, fat: 22, sodium: 1650 } },
    { id: 'te-green-curry', name: 'Green Curry (Chicken)', kind: 'fixed', category: 'Mains', serving: 'with rice', tags: ['spicy'], nutrition: { calories: 680, protein: 30, carbs: 78, fat: 26, sodium: 1500 } },
    { id: 'te-basil-chicken', name: 'Spicy Basil Chicken', kind: 'fixed', category: 'Mains', serving: 'with rice', tags: ['spicy', 'high-protein'], nutrition: { calories: 720, protein: 35, carbs: 82, fat: 26, sodium: 1700 } },
    { id: 'te-drunken-noodles', name: 'Drunken Noodles (Chicken)', kind: 'fixed', category: 'Mains', serving: '1 plate', tags: ['spicy'], nutrition: { calories: 740, protein: 33, carbs: 92, fat: 26, sodium: 1750 } },
    { id: 'te-spring-rolls', name: 'Vegetable Spring Rolls (2)', kind: 'fixed', category: 'Sides', serving: '2 rolls', tags: ['vegan'], nutrition: { calories: 230, protein: 4, carbs: 30, fat: 11, sodium: 420 } },
    { id: 'te-mango-salad', name: 'Green Mango Salad', kind: 'fixed', category: 'Salads', serving: '1 order', tags: ['vegan', 'spicy'], nutrition: { calories: 260, protein: 5, carbs: 42, fat: 8, sodium: 900 } },
  ],
}
