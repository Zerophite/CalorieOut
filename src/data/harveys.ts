import { type Restaurant } from '../types'

// Approximate values from Harvey's Canada nutrition information.
export const harveys: Restaurant = {
  id: 'harveys',
  name: "Harvey's",
  cuisine: 'Burgers · Fast food',
  accent: '#dc2626',
  segment: 'Fast Food',
  items: [
    { id: 'hv-original', name: 'Original Hamburger', kind: 'fixed', category: 'Burgers', serving: '1 burger (plain)', nutrition: { calories: 360, protein: 20, carbs: 34, fat: 16, sodium: 620 } },
    { id: 'hv-cheese', name: 'Cheeseburger', kind: 'fixed', category: 'Burgers', serving: '1 burger', nutrition: { calories: 440, protein: 25, carbs: 35, fat: 23, sodium: 940 } },
    { id: 'hv-angus', name: 'Angus Burger', kind: 'fixed', category: 'Burgers', serving: '1 burger', nutrition: { calories: 620, protein: 34, carbs: 43, fat: 34, sodium: 1150 } },
    { id: 'hv-beyond', name: 'Beyond Meat Burger', kind: 'fixed', category: 'Burgers', serving: '1 burger', tags: ['vegetarian', 'vegan'], nutrition: { calories: 500, protein: 22, carbs: 44, fat: 26, sodium: 990 } },
    { id: 'hv-chicken', name: 'Grilled Chicken Sandwich', kind: 'fixed', category: 'Chicken', serving: '1 sandwich', tags: ['high-protein'], nutrition: { calories: 380, protein: 33, carbs: 37, fat: 11, sodium: 1010 } },
    { id: 'hv-hotdog', name: 'Original Hot Dog', kind: 'fixed', category: 'Sandwiches', serving: '1 hot dog (plain)', nutrition: { calories: 300, protein: 11, carbs: 26, fat: 17, sodium: 800 } },
    { id: 'hv-fries', name: 'Fries', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian', 'vegan'], nutrition: { calories: 470, protein: 6, carbs: 63, fat: 22, sodium: 560 } },
    { id: 'hv-poutine', name: 'Poutine', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 690, protein: 16, carbs: 74, fat: 37, sodium: 1560 } },
    { id: 'hv-onionrings', name: 'Onion Rings', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 410, protein: 5, carbs: 48, fat: 22, sodium: 640 } },
  ],
}
