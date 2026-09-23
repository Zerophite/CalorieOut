import { type Restaurant } from '../types'

// Approximate values from Taco Bell Canada nutrition information.
export const tacobell: Restaurant = {
  id: 'taco-bell',
  name: 'Taco Bell',
  cuisine: 'Mexican · Fast food',
  accent: '#7c3aed',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [
    { id: 'tb-crunchy-taco', name: 'Crunchy Taco', kind: 'fixed', category: 'Bowls & Burritos', serving: '1 taco', nutrition: { calories: 170, protein: 8, carbs: 13, fat: 10, sodium: 300 } },
    { id: 'tb-soft-taco', name: 'Soft Taco (Beef)', kind: 'fixed', category: 'Bowls & Burritos', serving: '1 taco', nutrition: { calories: 180, protein: 9, carbs: 18, fat: 9, sodium: 490 } },
    { id: 'tb-crunchwrap', name: 'Crunchwrap Supreme', kind: 'fixed', category: 'Bowls & Burritos', serving: '1 wrap', nutrition: { calories: 530, protein: 16, carbs: 71, fat: 21, sodium: 1210 } },
    { id: 'tb-bean-burrito', name: 'Bean Burrito', kind: 'fixed', category: 'Bowls & Burritos', serving: '1 burrito', tags: ['vegetarian'], nutrition: { calories: 350, protein: 13, carbs: 54, fat: 9, sodium: 1000, fiber: 9 } },
    { id: 'tb-quesadilla', name: 'Chicken Quesadilla', kind: 'fixed', category: 'Bowls & Burritos', serving: '1 quesadilla', nutrition: { calories: 510, protein: 27, carbs: 39, fat: 27, sodium: 1240 } },
    { id: 'tb-power-bowl', name: 'Power Menu Bowl (Chicken)', kind: 'fixed', category: 'Bowls & Burritos', serving: '1 bowl', tags: ['high-protein'], nutrition: { calories: 470, protein: 26, carbs: 50, fat: 19, sodium: 1200, fiber: 8 } },
    { id: 'tb-nachos-bellgrande', name: 'Nachos BellGrande', kind: 'fixed', category: 'Sides', serving: '1 order', nutrition: { calories: 740, protein: 16, carbs: 82, fat: 38, sodium: 1090 } },
    { id: 'tb-cinnamon-twists', name: 'Cinnamon Twists', kind: 'fixed', category: 'Desserts', serving: '1 order', tags: ['vegetarian'], nutrition: { calories: 170, protein: 1, carbs: 27, fat: 6, sodium: 200, sugar: 10 } },
  ],
}
