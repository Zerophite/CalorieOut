import { type Restaurant } from '../types'

// Approximate values from Tim Hortons Canada nutrition information.
export const timhortons: Restaurant = {
  id: 'tim-hortons',
  name: 'Tim Hortons',
  cuisine: 'Coffee · Bakery',
  accent: '#dc2626',
  segment: 'Coffee & Bakery',
  items: [
    { id: 'th-coffee', name: 'Original Blend Coffee (black)', kind: 'fixed', category: 'Coffee', serving: 'medium', tags: ['vegan', 'low-carb'], nutrition: { calories: 5, protein: 1, carbs: 0, fat: 0, sodium: 10 } },
    { id: 'th-doubledouble', name: 'Coffee, Double-Double', kind: 'fixed', category: 'Coffee', serving: 'medium', tags: ['vegetarian'], nutrition: { calories: 140, protein: 2, carbs: 20, fat: 5, sodium: 60, sugar: 20 } },
    { id: 'th-latte', name: 'Latte', kind: 'fixed', category: 'Coffee', serving: 'medium', tags: ['vegetarian'], nutrition: { calories: 180, protein: 9, carbs: 16, fat: 9, sodium: 130, sugar: 15 } },
    { id: 'th-icecap', name: 'Iced Capp (cream)', kind: 'fixed', category: 'Coffee', serving: 'medium', tags: ['vegetarian'], nutrition: { calories: 350, protein: 4, carbs: 51, fat: 15, sodium: 65, sugar: 48 } },
    { id: 'th-frenchvanilla', name: 'French Vanilla', kind: 'fixed', category: 'Coffee', serving: 'medium', tags: ['vegetarian'], nutrition: { calories: 240, protein: 3, carbs: 40, fat: 8, sodium: 250, sugar: 33 } },
    { id: 'th-boston', name: 'Boston Cream Donut', kind: 'fixed', category: 'Bakery', serving: '1 donut', tags: ['vegetarian'], nutrition: { calories: 250, protein: 4, carbs: 36, fat: 10, sodium: 250, sugar: 16 } },
    { id: 'th-timbit', name: 'Chocolate Glazed Timbit', kind: 'fixed', category: 'Bakery', serving: '1 Timbit', tags: ['vegetarian'], nutrition: { calories: 70, protein: 1, carbs: 10, fat: 3, sodium: 90, sugar: 5 } },
    { id: 'th-bagel', name: 'Plain Bagel with Cream Cheese', kind: 'fixed', category: 'Bakery', serving: '1 bagel', tags: ['vegetarian'], nutrition: { calories: 400, protein: 12, carbs: 62, fat: 11, sodium: 640 } },
    { id: 'th-farmers', name: "Farmer's Wrap (Sausage)", kind: 'fixed', category: 'Breakfast', serving: '1 wrap', nutrition: { calories: 480, protein: 19, carbs: 39, fat: 27, sodium: 990 } },
    { id: 'th-belt', name: 'Bacon, Egg & Cheese Biscuit', kind: 'fixed', category: 'Breakfast', serving: '1 biscuit', nutrition: { calories: 450, protein: 16, carbs: 34, fat: 28, sodium: 1080 } },
    { id: 'th-chili', name: 'Chili', kind: 'fixed', category: 'Mains', serving: 'regular', tags: ['high-protein'], nutrition: { calories: 300, protein: 22, carbs: 28, fat: 11, sodium: 1050, fiber: 6 } },
    { id: 'th-turkeybacon-club', name: 'Turkey Bacon Club (Craveables)', kind: 'fixed', category: 'Sandwiches', serving: '1 sandwich', nutrition: { calories: 470, protein: 27, carbs: 47, fat: 19, sodium: 1240 } },
  ],
}
