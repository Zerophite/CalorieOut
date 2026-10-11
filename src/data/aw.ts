import { type Restaurant } from '../types'

// Approximate values from A&W Canada nutrition information.
export const aw: Restaurant = {
  id: 'aw',
  name: 'A&W',
  cuisine: 'Burgers · Fast food',
  accent: '#f97316',
  segment: 'Fast Food',
  items: [
    { id: 'aw-mama', name: 'Mama Burger', kind: 'fixed', category: 'Burgers', serving: '1 burger', nutrition: { calories: 470, protein: 24, carbs: 38, fat: 25, sodium: 780 } },
    {
      id: 'aw-teen', name: 'Teen Burger', kind: 'fixed', category: 'Burgers', serving: '1 burger',
      nutrition: { calories: 640, protein: 30, carbs: 41, fat: 39, sodium: 1140 },
      components: [
        { id: 'bun', name: 'Bun', removable: false, nutrition: { calories: 230, protein: 8, carbs: 40, fat: 4, sodium: 450 } },
        { id: 'beef', name: 'Beef patty', removable: false, nutrition: { calories: 230, protein: 15, carbs: 0, fat: 16, sodium: 250 } },
        { id: 'bacon', name: 'Bacon', nutrition: { calories: 70, protein: 5, carbs: 0, fat: 6, sodium: 200 } },
        { id: 'cheese', name: 'Cheese', nutrition: { calories: 50, protein: 2, carbs: 1, fat: 4, sodium: 230 } },
        { id: 'sauce', name: 'Teen sauce', nutrition: { calories: 60, protein: 0, carbs: 0, fat: 9, sodium: 10 } },
      ],
    },
    { id: 'aw-papa', name: 'Papa Burger', kind: 'fixed', category: 'Burgers', serving: '1 burger', nutrition: { calories: 790, protein: 45, carbs: 42, fat: 48, sodium: 1420 } },
    { id: 'aw-beyond', name: 'Beyond Meat Burger', kind: 'fixed', category: 'Burgers', serving: '1 burger', tags: ['vegetarian', 'vegan'], nutrition: { calories: 460, protein: 23, carbs: 43, fat: 22, sodium: 940 } },
    { id: 'aw-chub', name: 'Chubby Chicken Burger', kind: 'fixed', category: 'Chicken', serving: '1 sandwich', nutrition: { calories: 570, protein: 26, carbs: 49, fat: 30, sodium: 1080 } },
    { id: 'aw-onion', name: 'Onion Rings', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 470, protein: 6, carbs: 56, fat: 25, sodium: 720 } },
    { id: 'aw-fries', name: 'Fries', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian', 'vegan'], nutrition: { calories: 340, protein: 4, carbs: 46, fat: 16, sodium: 380 } },
    { id: 'aw-rootbeer', name: 'Root Beer', kind: 'fixed', category: 'Drinks', serving: 'medium', tags: ['vegetarian'], nutrition: { calories: 280, protein: 0, carbs: 74, fat: 0, sodium: 45, sugar: 73 } },
    { id: 'aw-breakfast', name: 'Bacon & Egger', kind: 'fixed', category: 'Breakfast', serving: '1 sandwich', nutrition: { calories: 480, protein: 20, carbs: 34, fat: 29, sodium: 980 } },
  ],
}
