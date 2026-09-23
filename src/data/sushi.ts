import { type MenuItem, type Restaurant } from '../types'

// ESTIMATED values. Sushi restaurants seldom publish nutrition data; items are
// modelled from standard roll/nigiri recipes.
function sushiMenu(prefix: string): MenuItem[] {
  return [
    { id: `${prefix}-california`, name: 'California Roll (8 pc)', kind: 'fixed', category: 'Mains', serving: '8 pieces', nutrition: { calories: 320, protein: 9, carbs: 48, fat: 9, sodium: 640 } },
    { id: `${prefix}-salmon-avo`, name: 'Salmon Avocado Roll (6 pc)', kind: 'fixed', category: 'Mains', serving: '6 pieces', nutrition: { calories: 300, protein: 12, carbs: 40, fat: 9, sodium: 480 } },
    { id: `${prefix}-dynamite`, name: 'Dynamite Roll (8 pc)', kind: 'fixed', category: 'Mains', serving: '8 pieces', nutrition: { calories: 520, protein: 15, carbs: 56, fat: 25, sodium: 780 } },
    { id: `${prefix}-spicy-tuna`, name: 'Spicy Tuna Roll (6 pc)', kind: 'fixed', category: 'Mains', serving: '6 pieces', tags: ['spicy'], nutrition: { calories: 290, protein: 13, carbs: 40, fat: 8, sodium: 560 } },
    { id: `${prefix}-salmon-nigiri`, name: 'Salmon Nigiri (2 pc)', kind: 'fixed', category: 'Mains', serving: '2 pieces', tags: ['high-protein'], nutrition: { calories: 90, protein: 6, carbs: 12, fat: 2, sodium: 120 } },
    { id: `${prefix}-sashimi`, name: 'Assorted Sashimi (9 pc)', kind: 'fixed', category: 'Mains', serving: '9 pieces', tags: ['high-protein', 'low-carb'], nutrition: { calories: 210, protein: 34, carbs: 1, fat: 8, sodium: 150 } },
    { id: `${prefix}-teriyaki`, name: 'Chicken Teriyaki Bowl', kind: 'fixed', category: 'Bowls & Burritos', serving: '1 bowl', tags: ['high-protein'], nutrition: { calories: 700, protein: 38, carbs: 90, fat: 18, sodium: 1500 } },
    { id: `${prefix}-edamame`, name: 'Edamame', kind: 'fixed', category: 'Sides', serving: '1 order', tags: ['vegan', 'high-protein'], nutrition: { calories: 150, protein: 13, carbs: 12, fat: 6, sodium: 250, fiber: 8 } },
    { id: `${prefix}-miso`, name: 'Miso Soup', kind: 'fixed', category: 'Sides', serving: '1 bowl', tags: ['vegetarian', 'low-carb'], nutrition: { calories: 45, protein: 3, carbs: 5, fat: 2, sodium: 700 } },
  ]
}

export const sushiSpots: Restaurant[] = [
  { id: 'sushi-sama', name: 'Sushi Sama', cuisine: 'Japanese · Sushi', accent: '#0f172a', segment: 'Sit-Down', dataSource: 'estimated', items: sushiMenu('sm') },
  { id: 'windbell-sushi', name: 'Windbell Sushi', cuisine: 'Japanese · Sushi', accent: '#0891b2', segment: 'Sit-Down', dataSource: 'estimated', items: sushiMenu('wb') },
  { id: 'sushi-eki', name: 'Sushi Eki', cuisine: 'Japanese · Sushi', accent: '#b91c1c', segment: 'Sit-Down', dataSource: 'estimated', items: sushiMenu('ek') },
]
