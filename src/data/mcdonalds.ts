import { type Restaurant } from '../types'
import { buildComponents, REF } from './components'

// Approximate values from McDonald's Canada nutrition information.
export const mcdonalds: Restaurant = {
  id: 'mcdonalds',
  name: "McDonald's",
  cuisine: 'Burgers · Fast food',
  accent: '#f59e0b',
  segment: 'Fast Food',
  items: [
    {
      id: 'mcd-bigmac', name: 'Big Mac', kind: 'fixed', category: 'Burgers', serving: '1 burger',
      nutrition: { calories: 580, protein: 25, carbs: 46, fat: 33, sodium: 1080, sugar: 9 },
      components: [
        { id: 'bun', name: 'Sesame bun', removable: false, nutrition: { calories: 250, protein: 7, carbs: 39, fat: 4, sodium: 510 } },
        { id: 'beef', name: 'Two beef patties', removable: false, nutrition: { calories: 190, protein: 16, carbs: 0, fat: 16, sodium: 230 } },
        { id: 'sauce', name: 'Big Mac sauce', nutrition: { calories: 90, protein: 0, carbs: 4, fat: 9, sodium: 150 } },
        { id: 'cheese', name: 'Cheese slice', nutrition: { calories: 40, protein: 2, carbs: 1, fat: 4, sodium: 180 } },
        { id: 'veg', name: 'Lettuce, onion & pickle', nutrition: { calories: 10, protein: 0, carbs: 2, fat: 0, sodium: 10 } },
      ],
    },
    {
      id: 'mcd-qtr', name: 'Quarter Pounder with Cheese', kind: 'fixed', category: 'Burgers', serving: '1 burger',
      nutrition: { calories: 520, protein: 30, carbs: 42, fat: 26, sodium: 1140 },
      components: buildComponents({ calories: 520, protein: 30, carbs: 42, fat: 26, sodium: 1140 }, [
        { id: 'bun', name: 'Sesame bun', n: REF.bunSesame, removable: false },
        { id: 'beef', name: 'Quarter-pound beef patty', core: true },
        { id: 'cheese', name: 'Two cheese slices', n: { calories: 100, protein: 6, carbs: 2, fat: 8, sodium: 460 } },
        { id: 'condiments', name: 'Ketchup, mustard, onion, pickle', n: { calories: 30, protein: 0, carbs: 6, fat: 0, sodium: 150 } },
      ]),
    },
    {
      id: 'mcd-mcdouble', name: 'McDouble', kind: 'fixed', category: 'Burgers', serving: '1 burger',
      nutrition: { calories: 400, protein: 22, carbs: 33, fat: 20, sodium: 850 },
      components: buildComponents({ calories: 400, protein: 22, carbs: 33, fat: 20, sodium: 850 }, [
        { id: 'bun', name: 'Bun', n: REF.bunPlain, removable: false },
        { id: 'beef', name: 'Two beef patties', core: true },
        { id: 'cheese', name: 'Cheese slice', n: REF.cheeseSlice },
        { id: 'condiments', name: 'Ketchup, mustard, onion, pickle', n: { calories: 25, protein: 0, carbs: 5, fat: 0, sodium: 150 } },
      ]),
    },
    {
      id: 'mcd-mcchicken', name: 'McChicken', kind: 'fixed', category: 'Chicken', serving: '1 sandwich',
      nutrition: { calories: 380, protein: 14, carbs: 39, fat: 18, sodium: 610 },
      components: [
        { id: 'bun', name: 'Bun', removable: false, nutrition: { calories: 180, protein: 6, carbs: 33, fat: 3, sodium: 330 } },
        { id: 'chicken', name: 'Crispy chicken patty', removable: false, nutrition: { calories: 150, protein: 8, carbs: 5, fat: 10, sodium: 200 } },
        { id: 'mayo', name: 'Mayo', nutrition: { calories: 45, protein: 0, carbs: 1, fat: 5, sodium: 80 } },
        { id: 'lettuce', name: 'Lettuce', nutrition: { calories: 5, protein: 0, carbs: 0, fat: 0, sodium: 0 } },
      ],
    },
    { id: 'mcd-mcnuggets10', name: 'Chicken McNuggets (10 pc)', kind: 'fixed', category: 'Chicken', serving: '10 pieces', nutrition: { calories: 420, protein: 24, carbs: 25, fat: 25, sodium: 810 } },
    { id: 'mcd-fries-m', name: 'Medium Fries', kind: 'fixed', category: 'Sides', serving: 'medium', tags: ['vegetarian'], nutrition: { calories: 320, protein: 4, carbs: 43, fat: 15, sodium: 260 } },
    {
      id: 'mcd-mcmuffin', name: 'Egg McMuffin', kind: 'fixed', category: 'Breakfast', serving: '1 muffin', tags: ['high-protein'],
      nutrition: { calories: 290, protein: 17, carbs: 30, fat: 12, sodium: 730 },
      components: buildComponents({ calories: 290, protein: 17, carbs: 30, fat: 12, sodium: 730 }, [
        { id: 'muffin', name: 'English muffin', n: REF.englishMuffin, removable: false },
        { id: 'egg', name: 'Egg', core: true },
        { id: 'cheese', name: 'Cheese slice', n: REF.cheeseSlice },
        { id: 'bacon', name: 'Canadian bacon', n: { calories: 60, protein: 8, carbs: 1, fat: 3, sodium: 300 } },
      ]),
    },
    { id: 'mcd-hotcakes', name: 'Hotcakes (with syrup & butter)', kind: 'fixed', category: 'Breakfast', serving: '1 order', tags: ['vegetarian'], nutrition: { calories: 580, protein: 9, carbs: 102, fat: 15, sodium: 700, sugar: 45 } },
    { id: 'mcd-mcflurry', name: 'Oreo McFlurry', kind: 'fixed', category: 'Desserts', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 510, protein: 12, carbs: 80, fat: 16, sodium: 320, sugar: 64 } },
    { id: 'mcd-salad', name: 'Grilled Chicken Caesar Salad', kind: 'fixed', category: 'Salads', serving: '1 bowl (no dressing)', tags: ['high-protein', 'low-carb'], nutrition: { calories: 230, protein: 30, carbs: 10, fat: 8, sodium: 660 } },
  ],
}
