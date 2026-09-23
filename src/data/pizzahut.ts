import { type Restaurant } from '../types'

// Approximate values from Pizza Hut Canada nutrition information (per slice
// unless noted; large pan pizza cut into 8).
export const pizzahut: Restaurant = {
  id: 'pizza-hut',
  name: 'Pizza Hut',
  cuisine: 'Pizza · Fast food',
  accent: '#dc2626',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [
    { id: 'ph-pep-pan', name: 'Pepperoni Pan Pizza', kind: 'fixed', category: 'Pizza', serving: '1 slice (large)', nutrition: { calories: 330, protein: 13, carbs: 34, fat: 16, sodium: 720 } },
    { id: 'ph-cheese-pan', name: 'Cheese Pan Pizza', kind: 'fixed', category: 'Pizza', serving: '1 slice (large)', tags: ['vegetarian'], nutrition: { calories: 300, protein: 12, carbs: 34, fat: 13, sodium: 620 } },
    { id: 'ph-supreme', name: 'Super Supreme Pizza', kind: 'fixed', category: 'Pizza', serving: '1 slice (large)', nutrition: { calories: 360, protein: 15, carbs: 35, fat: 18, sodium: 880 } },
    { id: 'ph-hawaiian', name: 'Hawaiian Pizza', kind: 'fixed', category: 'Pizza', serving: '1 slice (large)', nutrition: { calories: 290, protein: 13, carbs: 36, fat: 11, sodium: 700 } },
    { id: 'ph-wings-6', name: 'Traditional Wings (6 pc)', kind: 'fixed', category: 'Chicken', serving: '6 wings', tags: ['high-protein'], nutrition: { calories: 480, protein: 42, carbs: 4, fat: 33, sodium: 1400 } },
    { id: 'ph-breadsticks', name: 'Breadsticks (2)', kind: 'fixed', category: 'Sides', serving: '2 sticks', tags: ['vegetarian'], nutrition: { calories: 280, protein: 8, carbs: 38, fat: 10, sodium: 560 } },
    { id: 'ph-cinnamon', name: 'Cinnamon Sticks', kind: 'fixed', category: 'Desserts', serving: '2 sticks', tags: ['vegetarian'], nutrition: { calories: 250, protein: 4, carbs: 40, fat: 8, sodium: 300, sugar: 15 } },
  ],
}
