import { type MenuItem, type Restaurant } from '../types'

// ESTIMATED values. These independent shawarma shops don't publish nutrition
// data, so items are modelled from typical Middle-Eastern recipes:
//   wrap ≈ pita + ~120 g meat + garlic sauce + pickles/veg
//   platter ≈ ~200 g meat + rice + salad + sauce
// Treat as ballpark guidance only.
function shawarmaMenu(prefix: string): MenuItem[] {
  return [
    { id: `${prefix}-chicken-wrap`, name: 'Chicken Shawarma Wrap', kind: 'fixed', category: 'Wraps', serving: '1 wrap', tags: ['high-protein'], nutrition: { calories: 660, protein: 38, carbs: 55, fat: 30, sodium: 1300 } },
    { id: `${prefix}-beef-wrap`, name: 'Beef Shawarma Wrap', kind: 'fixed', category: 'Wraps', serving: '1 wrap', nutrition: { calories: 720, protein: 36, carbs: 55, fat: 38, sodium: 1400 } },
    { id: `${prefix}-chicken-platter`, name: 'Chicken Shawarma Platter', kind: 'fixed', category: 'Mains', serving: 'with rice & salad', tags: ['high-protein'], nutrition: { calories: 950, protein: 55, carbs: 90, fat: 38, sodium: 1900 } },
    { id: `${prefix}-shish-taouk`, name: 'Shish Taouk Plate', kind: 'fixed', category: 'Mains', serving: 'with rice & salad', tags: ['high-protein'], nutrition: { calories: 880, protein: 58, carbs: 82, fat: 30, sodium: 1700 } },
    { id: `${prefix}-falafel-wrap`, name: 'Falafel Wrap', kind: 'fixed', category: 'Wraps', serving: '1 wrap', tags: ['vegan'], nutrition: { calories: 560, protein: 15, carbs: 70, fat: 24, sodium: 1100, fiber: 8 } },
    { id: `${prefix}-fries`, name: 'Garlic Fries', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 480, protein: 6, carbs: 58, fat: 25, sodium: 700 } },
    { id: `${prefix}-hummus`, name: 'Hummus with Pita', kind: 'fixed', category: 'Sides', serving: '1 order', tags: ['vegan'], nutrition: { calories: 420, protein: 12, carbs: 52, fat: 18, sodium: 720, fiber: 8 } },
  ]
}

export const shawarmaSpots: Restaurant[] = [
  {
    id: 'osmows',
    name: "Osmow's Shawarma",
    cuisine: 'Shawarma · Mediterranean',
    accent: '#0f766e',
    segment: 'Fast Food',
    // Official values from Osmow's own Nutrition Calculator dataset (regular
    // sizes, default sauce configuration). STIX protein corrected from an
    // obvious glitch in their data (fries aren't 31 g protein).
    dataSource: 'official',
    items: [
      { id: 'os-chicken-wrap', name: 'Chicken Shawarma Wrap (Regular)', kind: 'fixed', category: 'Wraps', serving: 'regular', tags: ['high-protein'], nutrition: { calories: 565, protein: 27, carbs: 41, fat: 31, sodium: 620, fiber: 1, sugar: 4 } },
      { id: 'os-beef-wrap', name: 'Beef Shawarma Wrap (Regular)', kind: 'fixed', category: 'Wraps', serving: 'regular', tags: ['high-protein'], nutrition: { calories: 590, protein: 23, carbs: 43, fat: 36, sodium: 558, fiber: 2, sugar: 4 } },
      { id: 'os-lamb-wrap', name: 'Lamb Shawarma Wrap (Regular)', kind: 'fixed', category: 'Wraps', serving: 'regular', tags: ['high-protein'], nutrition: { calories: 630, protein: 30, carbs: 43, fat: 37, sodium: 572, fiber: 2, sugar: 4 } },
      { id: 'os-falafel-wrap', name: 'Falafel Wrap (Regular)', kind: 'fixed', category: 'Wraps', serving: 'regular', tags: ['vegan'], nutrition: { calories: 899, protein: 18, carbs: 69, fat: 63, sodium: 1388, fiber: 8, sugar: 7 } },
      { id: 'os-rice-bowl', name: 'Chicken On The Rocks (rice bowl, Regular)', kind: 'fixed', category: 'Bowls & Burritos', serving: 'regular', tags: ['high-protein'], nutrition: { calories: 857, protein: 40, carbs: 81, fat: 37, sodium: 1463, fiber: 2, sugar: 5 } },
      { id: 'os-poutine', name: 'Chicken Shawarma Poutine (Regular)', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['high-protein'], nutrition: { calories: 1005, protein: 38, carbs: 52, fat: 71, sodium: 2058 } },
      { id: 'os-fattoush', name: 'Fattoush Salad (Regular)', kind: 'fixed', category: 'Salads', serving: 'regular', tags: ['vegan', 'low-carb'], nutrition: { calories: 81, protein: 3, carbs: 17, fat: 1, sodium: 73, fiber: 3, sugar: 5 } },
      { id: 'os-greek-salad', name: 'Greek Salad (Regular)', kind: 'fixed', category: 'Salads', serving: 'regular', tags: ['vegetarian', 'low-carb'], nutrition: { calories: 159, protein: 4, carbs: 15, fat: 11, sodium: 242, fiber: 5, sugar: 6 } },
      { id: 'os-stix', name: 'STIX (Fries)', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian', 'vegan'], nutrition: { calories: 320, protein: 4, carbs: 31, fat: 21, sodium: 600 } },
    ],
  },
  { id: 'three-brothers', name: '3 Brothers Shawarma & Poutine', cuisine: 'Shawarma & Poutine', accent: '#b45309', segment: 'Fast Food', dataSource: 'estimated', items: [
    ...shawarmaMenu('tb'),
    { id: 'tb-poutine', name: 'Poutine', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 750, protein: 18, carbs: 70, fat: 42, sodium: 1550 } },
    { id: 'tb-shawarma-poutine', name: 'Chicken Shawarma Poutine', kind: 'fixed', category: 'Sides', serving: 'regular', nutrition: { calories: 980, protein: 40, carbs: 74, fat: 56, sodium: 2100 } },
  ] },
  { id: 'shawarma-prince', name: 'Shawarma Prince', cuisine: 'Shawarma · Mediterranean', accent: '#7c3aed', segment: 'Fast Food', dataSource: 'estimated', items: shawarmaMenu('sp') },
  { id: 'mr-shawarma', name: 'Mr Shawarma', cuisine: 'Shawarma · Mediterranean', accent: '#1d4ed8', segment: 'Fast Food', dataSource: 'estimated', items: shawarmaMenu('ms') },
  { id: 'shelbys-shawarma', name: "Shelby's Shawarma", cuisine: 'Shawarma · Mediterranean', accent: '#be123c', segment: 'Fast Food', dataSource: 'estimated', items: shawarmaMenu('ss') },
  { id: 'chain-smoker-bbq', name: 'Chain Smoker Urban Halal BBQ', cuisine: 'Halal BBQ · Grill', accent: '#78350f', segment: 'Fast Food', dataSource: 'estimated', items: [
    ...shawarmaMenu('cs'),
    { id: 'cs-butter-chicken', name: 'Butter Chicken with Rice', kind: 'fixed', category: 'Mains', serving: 'with rice', tags: ['high-protein'], nutrition: { calories: 890, protein: 45, carbs: 88, fat: 38, sodium: 1600 } },
  ] },
]
