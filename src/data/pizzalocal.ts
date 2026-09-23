import { type MenuItem, type Restaurant } from '../types'

// ESTIMATED values. These regional pizza chains don't publish full nutrition
// data; slices are modelled from typical medium/large pizza recipes.
function pizzaMenu(prefix: string): MenuItem[] {
  return [
    { id: `${prefix}-pepperoni`, name: 'Pepperoni (1 slice)', kind: 'fixed', category: 'Pizza', serving: '1 slice (large)', nutrition: { calories: 310, protein: 13, carbs: 33, fat: 14, sodium: 700 } },
    { id: `${prefix}-cheese`, name: 'Cheese (1 slice)', kind: 'fixed', category: 'Pizza', serving: '1 slice (large)', tags: ['vegetarian'], nutrition: { calories: 280, protein: 12, carbs: 34, fat: 11, sodium: 600 } },
    { id: `${prefix}-deluxe`, name: 'Deluxe / Works (1 slice)', kind: 'fixed', category: 'Pizza', serving: '1 slice (large)', nutrition: { calories: 340, protein: 14, carbs: 34, fat: 16, sodium: 820 } },
    { id: `${prefix}-hawaiian`, name: 'Hawaiian (1 slice)', kind: 'fixed', category: 'Pizza', serving: '1 slice (large)', nutrition: { calories: 290, protein: 13, carbs: 35, fat: 11, sodium: 720 } },
    { id: `${prefix}-veggie`, name: 'Veggie (1 slice)', kind: 'fixed', category: 'Pizza', serving: '1 slice (large)', tags: ['vegetarian'], nutrition: { calories: 270, protein: 11, carbs: 34, fat: 10, sodium: 620 } },
    { id: `${prefix}-garlic-bread`, name: 'Garlic Bread (2 pc)', kind: 'fixed', category: 'Sides', serving: '2 pieces', tags: ['vegetarian'], nutrition: { calories: 300, protein: 8, carbs: 40, fat: 12, sodium: 560 } },
    { id: `${prefix}-wings`, name: 'Chicken Wings (5 pc)', kind: 'fixed', category: 'Chicken', serving: '5 wings', tags: ['high-protein'], nutrition: { calories: 420, protein: 36, carbs: 4, fat: 28, sodium: 1200 } },
  ]
}

export const pizzaLocalSpots: Restaurant[] = [
  { id: 'gabriel-pizza', name: 'Gabriel Pizza', cuisine: 'Pizza', accent: '#dc2626', segment: 'Fast Food', dataSource: 'estimated', items: pizzaMenu('gp') },
  { id: 'red-swan-pizza', name: 'Red Swan Pizza', cuisine: 'Pizza', accent: '#b91c1c', segment: 'Fast Food', dataSource: 'estimated', items: pizzaMenu('rs') },
  {
    id: 'toppers-pizza',
    name: "Topper's Pizza",
    cuisine: 'Pizza',
    accent: '#1d4ed8',
    segment: 'Fast Food',
    // Pepperoni & Vegetarian macros are Topper's published per-slice figures;
    // Cheese & Canadiana calories are published, macros modelled to match.
    // Sodium isn't published per slice, so those values are estimated.
    dataSource: 'estimated',
    items: [
      { id: 'tp-pepperoni', name: 'Pepperoni (1 slice)', kind: 'fixed', category: 'Pizza', serving: '1 slice', nutrition: { calories: 220, protein: 10, carbs: 30, fat: 6, sodium: 480 } },
      { id: 'tp-cheese', name: 'Cheese (1 slice)', kind: 'fixed', category: 'Pizza', serving: '1 slice', tags: ['vegetarian'], nutrition: { calories: 200, protein: 10, carbs: 30, fat: 6, sodium: 420 } },
      { id: 'tp-vegetarian', name: 'Vegetarian (1 slice)', kind: 'fixed', category: 'Pizza', serving: '1 slice', tags: ['vegetarian'], nutrition: { calories: 190, protein: 10, carbs: 30, fat: 6, sodium: 400 } },
      { id: 'tp-canadiana', name: 'Canadiana (1 slice)', kind: 'fixed', category: 'Pizza', serving: '1 slice', nutrition: { calories: 230, protein: 11, carbs: 30, fat: 8, sodium: 560 } },
      { id: 'tp-garlic-bread', name: 'Garlic Bread (2 pc)', kind: 'fixed', category: 'Sides', serving: '2 pieces', tags: ['vegetarian'], nutrition: { calories: 300, protein: 8, carbs: 40, fat: 12, sodium: 560 } },
      { id: 'tp-wings', name: 'Chicken Wings (5 pc)', kind: 'fixed', category: 'Chicken', serving: '5 wings', tags: ['high-protein'], nutrition: { calories: 420, protein: 36, carbs: 4, fat: 28, sodium: 1200 } },
    ],
  },
]
