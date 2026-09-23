import { type Restaurant } from '../types'

// Approximate values from Wendy's Canada nutrition information.
export const wendys: Restaurant = {
  id: 'wendys',
  name: "Wendy's",
  cuisine: 'Burgers · Fast food',
  accent: '#b91c1c',
  segment: 'Fast Food',
  items: [
    { id: 'wd-dave', name: "Dave's Single", kind: 'fixed', category: 'Burgers', serving: '1 burger', nutrition: { calories: 570, protein: 30, carbs: 39, fat: 34, sodium: 1120 } },
    { id: 'wd-baconator', name: 'Baconator', kind: 'fixed', category: 'Burgers', serving: '1 burger', nutrition: { calories: 950, protein: 59, carbs: 39, fat: 62, sodium: 1810 } },
    { id: 'wd-jr-cheese', name: 'Jr. Cheeseburger', kind: 'fixed', category: 'Burgers', serving: '1 burger', nutrition: { calories: 290, protein: 15, carbs: 26, fat: 14, sodium: 690 } },
    { id: 'wd-spicy-chicken', name: 'Spicy Chicken Sandwich', kind: 'fixed', category: 'Chicken', serving: '1 sandwich', tags: ['spicy'], nutrition: { calories: 500, protein: 29, carbs: 48, fat: 21, sodium: 1140 } },
    { id: 'wd-grilled-chicken', name: 'Grilled Chicken Sandwich', kind: 'fixed', category: 'Chicken', serving: '1 sandwich', tags: ['high-protein'], nutrition: { calories: 370, protein: 34, carbs: 38, fat: 10, sodium: 800 } },
    { id: 'wd-nuggets-10', name: 'Crispy Nuggets (10 pc)', kind: 'fixed', category: 'Chicken', serving: '10 pieces', nutrition: { calories: 420, protein: 22, carbs: 24, fat: 27, sodium: 800 } },
    { id: 'wd-chili', name: 'Chili', kind: 'fixed', category: 'Sides', serving: 'small', tags: ['high-protein'], nutrition: { calories: 240, protein: 17, carbs: 23, fat: 8, sodium: 830, fiber: 6 } },
    { id: 'wd-fries-m', name: 'Medium Fries', kind: 'fixed', category: 'Sides', serving: 'medium', tags: ['vegetarian', 'vegan'], nutrition: { calories: 420, protein: 5, carbs: 56, fat: 20, sodium: 470 } },
    { id: 'wd-frosty', name: 'Chocolate Frosty', kind: 'fixed', category: 'Desserts', serving: 'small', tags: ['vegetarian'], nutrition: { calories: 340, protein: 8, carbs: 56, fat: 9, sodium: 200, sugar: 46 } },
    { id: 'wd-apple-salad', name: 'Apple Pecan Salad (full)', kind: 'fixed', category: 'Salads', serving: '1 bowl w/ dressing', nutrition: { calories: 540, protein: 30, carbs: 41, fat: 30, sodium: 1170 } },
  ],
}
