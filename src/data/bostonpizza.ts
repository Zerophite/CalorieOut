import { type Restaurant } from '../types'

// Approximate values from Boston Pizza Canada nutrition information.
// Sit-down portions run large — many mains are shareable.
export const bostonpizza: Restaurant = {
  id: 'boston-pizza',
  name: 'Boston Pizza',
  cuisine: 'Pizza & Pasta · Sit-down',
  accent: '#1d4ed8',
  segment: 'Sit-Down',
  items: [
    { id: 'bp-cactus', name: 'Cactus Cut Potatoes (share)', kind: 'fixed', category: 'Sides', serving: 'shareable', tags: ['vegetarian'], nutrition: { calories: 1360, protein: 22, carbs: 118, fat: 90, sodium: 2200 } },
    { id: 'bp-pep-pizza', name: 'Pepperoni Pizza (individual)', kind: 'fixed', category: 'Pizza', serving: 'individual', nutrition: { calories: 900, protein: 40, carbs: 96, fat: 39, sodium: 2100 } },
    { id: 'bp-hawaiian', name: 'Hawaiian Pizza (individual)', kind: 'fixed', category: 'Pizza', serving: 'individual', nutrition: { calories: 820, protein: 38, carbs: 104, fat: 27, sodium: 1980 } },
    { id: 'bp-bacon-double', name: 'Bacon Double Cheeseburger', kind: 'fixed', category: 'Burgers', serving: 'with fries', nutrition: { calories: 1350, protein: 58, carbs: 90, fat: 82, sodium: 2400 } },
    { id: 'bp-spaghetti', name: 'Spaghetti & Meat Sauce', kind: 'fixed', category: 'Mains', serving: '1 plate', nutrition: { calories: 760, protein: 33, carbs: 108, fat: 20, sodium: 1420 } },
    { id: 'bp-jambalaya', name: 'Jambalaya Fettuccine', kind: 'fixed', category: 'Mains', serving: '1 plate', tags: ['spicy'], nutrition: { calories: 1090, protein: 48, carbs: 118, fat: 45, sodium: 2500 } },
    { id: 'bp-thai-bowl', name: 'Thai Chicken Bowl', kind: 'fixed', category: 'Bowls & Burritos', serving: '1 bowl', tags: ['high-protein'], nutrition: { calories: 680, protein: 39, carbs: 78, fat: 22, sodium: 1600 } },
    { id: 'bp-wings', name: 'Oven-Roasted Wings (1 lb)', kind: 'fixed', category: 'Chicken', serving: '1 lb', tags: ['high-protein'], nutrition: { calories: 780, protein: 66, carbs: 6, fat: 55, sodium: 1900 } },
    { id: 'bp-caesar', name: 'Caesar Salad (entrée)', kind: 'fixed', category: 'Salads', serving: 'entrée', tags: ['vegetarian'], nutrition: { calories: 560, protein: 13, carbs: 26, fat: 46, sodium: 980 } },
    { id: 'bp-pizookie', name: 'White Chocolate Pizookie', kind: 'fixed', category: 'Desserts', serving: 'shareable', tags: ['vegetarian'], nutrition: { calories: 1500, protein: 18, carbs: 200, fat: 72, sodium: 900, sugar: 130 } },
  ],
}
