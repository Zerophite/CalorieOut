import { type Restaurant } from '../types'

// Approximate values from Burger King Canada nutrition information.
export const burgerking: Restaurant = {
  id: 'burger-king',
  name: 'Burger King',
  cuisine: 'Burgers · Fast food',
  accent: '#d97706',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [
    { id: 'bk-whopper', name: 'Whopper', kind: 'fixed', category: 'Burgers', serving: '1 burger', nutrition: { calories: 670, protein: 28, carbs: 51, fat: 40, sodium: 980 } },
    { id: 'bk-whopper-jr', name: 'Whopper Jr.', kind: 'fixed', category: 'Burgers', serving: '1 burger', nutrition: { calories: 310, protein: 13, carbs: 27, fat: 18, sodium: 500 } },
    { id: 'bk-bacon-king', name: 'Bacon King', kind: 'fixed', category: 'Burgers', serving: '1 burger', nutrition: { calories: 1150, protein: 61, carbs: 49, fat: 79, sodium: 2150 } },
    { id: 'bk-impossible', name: 'Impossible Whopper', kind: 'fixed', category: 'Burgers', serving: '1 burger', tags: ['vegetarian'], nutrition: { calories: 630, protein: 25, carbs: 58, fat: 34, sodium: 1080 } },
    { id: 'bk-chicken-royale', name: 'Chicken Royale', kind: 'fixed', category: 'Chicken', serving: '1 sandwich', nutrition: { calories: 640, protein: 24, carbs: 51, fat: 38, sodium: 1180 } },
    { id: 'bk-nuggets-8', name: 'Chicken Nuggets (8 pc)', kind: 'fixed', category: 'Chicken', serving: '8 pieces', nutrition: { calories: 340, protein: 17, carbs: 19, fat: 22, sodium: 640 } },
    { id: 'bk-fries-m', name: 'Medium Fries', kind: 'fixed', category: 'Sides', serving: 'medium', tags: ['vegetarian', 'vegan'], nutrition: { calories: 380, protein: 4, carbs: 53, fat: 17, sodium: 560 } },
    { id: 'bk-onion-rings', name: 'Onion Rings', kind: 'fixed', category: 'Sides', serving: 'medium', tags: ['vegetarian'], nutrition: { calories: 410, protein: 6, carbs: 50, fat: 21, sodium: 640 } },
  ],
}
