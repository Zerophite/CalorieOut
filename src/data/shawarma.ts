import { type MenuItem, type Restaurant } from '../types'
import { buildComponents, REF } from './components'

// ESTIMATED values. These independent shawarma shops don't publish nutrition
// data, so items are modelled from typical Middle-Eastern recipes:
//   wrap ≈ pita + ~120 g meat + garlic sauce + pickles/veg
//   platter ≈ ~200 g meat + rice + salad + sauce
// Treat as ballpark guidance only.
function shawarmaMenu(prefix: string): MenuItem[] {
  return [
    {
      id: `${prefix}-chicken-wrap`, name: 'Chicken Shawarma Wrap', kind: 'fixed', category: 'Wraps', serving: '1 wrap', tags: ['high-protein'],
      nutrition: { calories: 660, protein: 38, carbs: 55, fat: 30, sodium: 1300 },
      components: buildComponents({ calories: 660, protein: 38, carbs: 55, fat: 30, sodium: 1300 }, [
        { id: 'pita', name: 'Pita wrap', n: REF.pita, removable: false },
        { id: 'chicken', name: 'Chicken shawarma', core: true },
        { id: 'garlic', name: 'Garlic sauce', n: REF.garlicSauce },
        { id: 'veg', name: 'Pickles & veg', n: REF.vegShawarma },
      ]),
    },
    {
      id: `${prefix}-beef-wrap`, name: 'Beef Shawarma Wrap', kind: 'fixed', category: 'Wraps', serving: '1 wrap',
      nutrition: { calories: 720, protein: 36, carbs: 55, fat: 38, sodium: 1400 },
      components: buildComponents({ calories: 720, protein: 36, carbs: 55, fat: 38, sodium: 1400 }, [
        { id: 'pita', name: 'Pita wrap', n: REF.pita, removable: false },
        { id: 'beef', name: 'Beef shawarma', core: true },
        { id: 'garlic', name: 'Garlic sauce', n: REF.garlicSauce },
        { id: 'veg', name: 'Pickles & veg', n: REF.vegShawarma },
      ]),
    },
    {
      id: `${prefix}-chicken-platter`, name: 'Chicken Shawarma Platter', kind: 'fixed', category: 'Mains', serving: 'with rice & salad', tags: ['high-protein'],
      nutrition: { calories: 950, protein: 55, carbs: 90, fat: 38, sodium: 1900 },
      components: buildComponents({ calories: 950, protein: 55, carbs: 90, fat: 38, sodium: 1900 }, [
        { id: 'rice', name: 'Rice', n: REF.riceCup, removable: false },
        { id: 'chicken', name: 'Chicken shawarma', core: true },
        { id: 'garlic', name: 'Garlic sauce', n: REF.garlicSauce },
        { id: 'salad', name: 'Salad', n: REF.vegShawarma },
      ]),
    },
    {
      id: `${prefix}-shish-taouk`, name: 'Shish Taouk Plate', kind: 'fixed', category: 'Mains', serving: 'with rice & salad', tags: ['high-protein'],
      nutrition: { calories: 880, protein: 58, carbs: 82, fat: 30, sodium: 1700 },
      components: buildComponents({ calories: 880, protein: 58, carbs: 82, fat: 30, sodium: 1700 }, [
        { id: 'rice', name: 'Rice', n: REF.riceCup, removable: false },
        { id: 'chicken', name: 'Grilled chicken', core: true },
        { id: 'garlic', name: 'Garlic sauce', n: REF.garlicSauce },
        { id: 'salad', name: 'Salad', n: REF.vegShawarma },
      ]),
    },
    {
      id: `${prefix}-falafel-wrap`, name: 'Falafel Wrap', kind: 'fixed', category: 'Wraps', serving: '1 wrap', tags: ['vegan'],
      nutrition: { calories: 560, protein: 15, carbs: 70, fat: 24, sodium: 1100, fiber: 8 },
      components: buildComponents({ calories: 560, protein: 15, carbs: 70, fat: 24, sodium: 1100 }, [
        { id: 'pita', name: 'Pita wrap', n: REF.pita, removable: false },
        { id: 'falafel', name: 'Falafel', core: true },
        { id: 'tahini', name: 'Tahini sauce', n: REF.garlicSauce },
        { id: 'veg', name: 'Pickles & veg', n: REF.vegShawarma },
      ]),
    },
    { id: `${prefix}-fries`, name: 'Garlic Fries', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 480, protein: 6, carbs: 58, fat: 25, sodium: 700 } },
    { id: `${prefix}-hummus`, name: 'Hummus with Pita', kind: 'fixed', category: 'Sides', serving: '1 order', tags: ['vegan'], nutrition: { calories: 420, protein: 12, carbs: 52, fat: 18, sodium: 720, fiber: 8 } },
  ]
}

export const shawarmaSpots: Restaurant[] = [
  { id: 'three-brothers', name: '3 Brothers Shawarma & Poutine', cuisine: 'Shawarma & Poutine', accent: '#b45309', segment: 'Fast Food', dataSource: 'estimated', items: [
    ...shawarmaMenu('tb'),
    { id: 'tb-poutine', name: 'Poutine', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 750, protein: 18, carbs: 70, fat: 42, sodium: 1550 } },
    { id: 'tb-shawarma-poutine', name: 'Chicken Shawarma Poutine', kind: 'fixed', category: 'Sides', serving: 'regular', nutrition: { calories: 980, protein: 40, carbs: 74, fat: 56, sodium: 2100 } },
  ] },
  { id: 'shawarma-prince', name: 'Shawarma Prince', cuisine: 'Shawarma · Mediterranean', accent: '#7c3aed', segment: 'Fast Food', dataSource: 'estimated', items: shawarmaMenu('sp') },
  { id: 'mr-shawarma', name: 'Mr Shawarma', cuisine: 'Shawarma · Mediterranean', accent: '#1d4ed8', segment: 'Fast Food', dataSource: 'estimated', items: shawarmaMenu('ms') },
  { id: 'shelbys-shawarma', name: "Shelby's Legendary Shawarma", cuisine: 'Shawarma · Mediterranean', accent: '#be123c', segment: 'Fast Food', dataSource: 'estimated', items: shawarmaMenu('ss') },
  { id: 'chain-smoker-bbq', name: 'Chainsmoker Urban Halal BBQ', cuisine: 'Halal BBQ · Grill', accent: '#78350f', segment: 'Fast Food', dataSource: 'estimated', items: [
    ...shawarmaMenu('cs'),
    { id: 'cs-butter-chicken', name: 'Butter Chicken with Rice', kind: 'fixed', category: 'Mains', serving: 'with rice', tags: ['high-protein'], nutrition: { calories: 890, protein: 45, carbs: 88, fat: 38, sodium: 1600 } },
  ] },
]
