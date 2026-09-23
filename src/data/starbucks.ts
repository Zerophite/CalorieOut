import { type Restaurant } from '../types'

// Approximate values from Starbucks Canada nutrition information.
// Handcrafted drinks assume 2% milk, grande (473 mL) unless noted.
export const starbucks: Restaurant = {
  id: 'starbucks',
  name: 'Starbucks',
  cuisine: 'Coffee · Bakery',
  accent: '#15803d',
  segment: 'Coffee & Bakery',
  items: [
    { id: 'sb-americano', name: 'Caffè Americano', kind: 'fixed', category: 'Coffee', serving: 'grande', tags: ['vegan', 'low-carb'], nutrition: { calories: 15, protein: 1, carbs: 3, fat: 0, sodium: 15 } },
    { id: 'sb-latte', name: 'Caffè Latte (2%)', kind: 'fixed', category: 'Coffee', serving: 'grande', tags: ['vegetarian'], nutrition: { calories: 190, protein: 13, carbs: 19, fat: 7, sodium: 170, sugar: 18 } },
    { id: 'sb-caramel-macchiato', name: 'Caramel Macchiato (2%)', kind: 'fixed', category: 'Coffee', serving: 'grande', tags: ['vegetarian'], nutrition: { calories: 250, protein: 10, carbs: 35, fat: 7, sodium: 150, sugar: 33 } },
    { id: 'sb-psl', name: 'Pumpkin Spice Latte (2%)', kind: 'fixed', category: 'Coffee', serving: 'grande', tags: ['vegetarian'], nutrition: { calories: 390, protein: 14, carbs: 52, fat: 14, sodium: 240, sugar: 50 } },
    { id: 'sb-frappuccino', name: 'Caramel Frappuccino', kind: 'fixed', category: 'Coffee', serving: 'grande', tags: ['vegetarian'], nutrition: { calories: 420, protein: 5, carbs: 66, fat: 15, sodium: 250, sugar: 66 } },
    { id: 'sb-coldbrew', name: 'Cold Brew (black)', kind: 'fixed', category: 'Coffee', serving: 'grande', tags: ['vegan', 'low-carb'], nutrition: { calories: 5, protein: 0, carbs: 0, fat: 0, sodium: 15 } },
    { id: 'sb-refresher', name: 'Strawberry Açaí Refresher', kind: 'fixed', category: 'Drinks', serving: 'grande', tags: ['vegan'], nutrition: { calories: 90, protein: 0, carbs: 23, fat: 0, sodium: 10, sugar: 20 } },
    { id: 'sb-eggbites', name: 'Bacon & Gruyère Egg Bites', kind: 'fixed', category: 'Breakfast', serving: '2 bites', tags: ['high-protein', 'low-carb'], nutrition: { calories: 310, protein: 19, carbs: 9, fat: 22, sodium: 680 } },
    { id: 'sb-banana-bread', name: 'Banana Bread', kind: 'fixed', category: 'Bakery', serving: '1 slice', tags: ['vegetarian'], nutrition: { calories: 420, protein: 6, carbs: 56, fat: 20, sodium: 380, sugar: 30 } },
    { id: 'sb-croissant', name: 'Butter Croissant', kind: 'fixed', category: 'Bakery', serving: '1 croissant', tags: ['vegetarian'], nutrition: { calories: 260, protein: 5, carbs: 27, fat: 15, sodium: 250 } },
  ],
}
