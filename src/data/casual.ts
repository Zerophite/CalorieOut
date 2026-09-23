import { type MenuItem, type Restaurant } from '../types'

// ESTIMATED values for independent casual spots that publish no nutrition data.
// Modelled from typical recipes for each dish; ballpark guidance only.

function wingsMenu(prefix: string): MenuItem[] {
  return [
    { id: `${prefix}-wings-10`, name: 'Classic Wings (10 pc)', kind: 'fixed', category: 'Chicken', serving: '10 wings', tags: ['high-protein'], nutrition: { calories: 830, protein: 66, carbs: 6, fat: 60, sodium: 2000 } },
    { id: `${prefix}-wings-bbq`, name: 'BBQ Wings (10 pc)', kind: 'fixed', category: 'Chicken', serving: '10 wings', tags: ['high-protein'], nutrition: { calories: 900, protein: 65, carbs: 28, fat: 58, sodium: 2100, sugar: 18 } },
    { id: `${prefix}-boneless`, name: 'Boneless Wings (1 lb)', kind: 'fixed', category: 'Chicken', serving: '1 lb', nutrition: { calories: 780, protein: 44, carbs: 46, fat: 44, sodium: 2200 } },
    { id: `${prefix}-fries`, name: 'Fries', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian', 'vegan'], nutrition: { calories: 420, protein: 5, carbs: 56, fat: 20, sodium: 470 } },
  ]
}

export const casualSpots: Restaurant[] = [
  {
    id: 'the-works',
    name: 'The Works',
    cuisine: 'Gourmet burgers',
    accent: '#78350f',
    segment: 'Sit-Down',
    // Official figures from The WORKS published Nutritionals guide (Sept 2025).
    // Burgers here are summed from their published patty + bun + cheese components.
    dataSource: 'official',
    items: [
      { id: 'tw-cheeseburger', name: 'Cheeseburger (4oz beef + white bun + cheddar)', kind: 'fixed', category: 'Burgers', serving: '1 burger', tags: ['high-protein'], nutrition: { calories: 522, protein: 35, carbs: 39, fat: 24, sodium: 980 } },
      { id: 'tw-chicken', name: 'Grilled Chicken Burger (breast + white bun)', kind: 'fixed', category: 'Chicken', serving: '1 burger', tags: ['high-protein'], nutrition: { calories: 405, protein: 42, carbs: 41, fat: 7, sodium: 836 } },
      { id: 'tw-cobbfather', name: 'The Cobbfather Salad', kind: 'fixed', category: 'Salads', serving: '1 salad', tags: ['high-protein'], nutrition: { calories: 770, protein: 50, carbs: 13, fat: 54, sodium: 1484, fiber: 5 } },
      { id: 'tw-romaine', name: 'Romaine Calm & Carry On Salad', kind: 'fixed', category: 'Salads', serving: '1 salad', tags: ['vegan', 'low-carb'], nutrition: { calories: 75, protein: 4, carbs: 15, fat: 1, sodium: 38, fiber: 7 } },
      { id: 'tw-fries', name: 'Fresh Cut Fries', kind: 'fixed', category: 'Sides', serving: '1 order', tags: ['vegetarian', 'vegan'], nutrition: { calories: 620, protein: 9, carbs: 80, fat: 31, sodium: 221, fiber: 8 } },
      { id: 'tw-sweet-fries', name: 'Sweet Potato Fries', kind: 'fixed', category: 'Sides', serving: '1 order', tags: ['vegetarian'], nutrition: { calories: 440, protein: 3, carbs: 59, fat: 22, sodium: 140, fiber: 7 } },
      { id: 'tw-poutine', name: 'Traditional Poutine', kind: 'fixed', category: 'Sides', serving: 'full', tags: ['vegetarian'], nutrition: { calories: 1634, protein: 38, carbs: 178, fat: 86, sodium: 2839, fiber: 16 } },
      { id: 'tw-side-poutine', name: 'Side Traditional Poutine', kind: 'fixed', category: 'Sides', serving: 'side', tags: ['vegetarian'], nutrition: { calories: 817, protein: 19, carbs: 89, fat: 43, sodium: 1420, fiber: 8 } },
      { id: 'tw-icecream', name: 'Double Scoop Ice Cream', kind: 'fixed', category: 'Desserts', serving: '1 order', tags: ['vegetarian'], nutrition: { calories: 544, protein: 4, carbs: 96, fat: 18, sodium: 234, sugar: 66 } },
    ],
  },
  {
    id: 'lone-star',
    name: 'Lone Star Texas Grill',
    cuisine: 'Tex-Mex · Sit-down',
    accent: '#b45309',
    segment: 'Sit-Down',
    dataSource: 'estimated',
    items: [
      { id: 'ls-fajitas', name: 'Chicken Fajitas', kind: 'fixed', category: 'Mains', serving: 'with tortillas', tags: ['high-protein'], nutrition: { calories: 900, protein: 52, carbs: 78, fat: 38, sodium: 2200 } },
      { id: 'ls-quesadilla', name: 'Beef Quesadilla', kind: 'fixed', category: 'Bowls & Burritos', serving: '1 order', nutrition: { calories: 820, protein: 38, carbs: 60, fat: 46, sodium: 1800 } },
      { id: 'ls-nachos', name: 'Loaded Nachos (share)', kind: 'fixed', category: 'Sides', serving: 'shareable', nutrition: { calories: 1400, protein: 44, carbs: 120, fat: 80, sodium: 2600 } },
      { id: 'ls-taco-salad', name: 'Taco Salad', kind: 'fixed', category: 'Salads', serving: '1 bowl', nutrition: { calories: 720, protein: 30, carbs: 56, fat: 40, sodium: 1500 } },
    ],
  },
  // St. Louis poutine calories anchored to their published guide; wings modelled.
  { id: 'st-louis', name: "St. Louis Bar & Grill", cuisine: 'Wings · Sports bar', accent: '#dc2626', segment: 'Sit-Down', dataSource: 'estimated', items: [
    ...wingsMenu('sl'),
    { id: 'sl-classic-poutine', name: 'Classic Poutine', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 650, protein: 20, carbs: 66, fat: 34, sodium: 1700 } },
    { id: 'sl-wings-poutine', name: 'St. Louis Wings Poutine', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['high-protein'], nutrition: { calories: 985, protein: 42, carbs: 70, fat: 54, sodium: 2300 } },
  ] },
  { id: '6ixty-wings', name: '6ixty Wings', cuisine: 'Wings', accent: '#0f172a', segment: 'Fast Food', dataSource: 'estimated', items: wingsMenu('6w') },
  { id: 'wing-up', name: 'Wing Up', cuisine: 'Wings', accent: '#ea580c', segment: 'Fast Food', dataSource: 'estimated', items: wingsMenu('wu') },
  {
    id: 'halibut-house',
    name: 'Halibut House Fish & Chips',
    cuisine: 'Fish & chips',
    accent: '#0891b2',
    segment: 'Fast Food',
    dataSource: 'estimated',
    items: [
      { id: 'hh-1pc', name: '1 pc Halibut & Chips', kind: 'fixed', category: 'Mains', serving: '1 piece + fries', nutrition: { calories: 780, protein: 32, carbs: 70, fat: 42, sodium: 1300 } },
      { id: 'hh-2pc', name: '2 pc Halibut & Chips', kind: 'fixed', category: 'Mains', serving: '2 pieces + fries', tags: ['high-protein'], nutrition: { calories: 1080, protein: 48, carbs: 84, fat: 60, sodium: 1700 } },
      { id: 'hh-fishburger', name: 'Fish Burger', kind: 'fixed', category: 'Sandwiches', serving: '1 burger', nutrition: { calories: 560, protein: 24, carbs: 52, fat: 28, sodium: 950 } },
      { id: 'hh-coleslaw', name: 'Coleslaw', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 180, protein: 1, carbs: 16, fat: 12, sodium: 200 } },
    ],
  },
  {
    id: 'rock-n-deli',
    name: "Rock 'N Deli",
    cuisine: 'Montreal smoked meat · Deli',
    accent: '#7c2d12',
    segment: 'Fast Food',
    dataSource: 'estimated',
    items: [
      { id: 'rd-smoked-meat', name: 'Smoked Meat Sandwich', kind: 'fixed', category: 'Sandwiches', serving: '1 sandwich', tags: ['high-protein'], nutrition: { calories: 560, protein: 38, carbs: 42, fat: 26, sodium: 1900 } },
      { id: 'rd-reuben', name: 'Reuben', kind: 'fixed', category: 'Sandwiches', serving: '1 sandwich', nutrition: { calories: 720, protein: 40, carbs: 46, fat: 40, sodium: 2100 } },
      { id: 'rd-poutine', name: 'Smoked Meat Poutine', kind: 'fixed', category: 'Sides', serving: 'regular', nutrition: { calories: 980, protein: 34, carbs: 74, fat: 58, sodium: 2400 } },
    ],
  },
  {
    id: 'green-leaf',
    name: 'Green Leaf',
    cuisine: 'Vietnamese · Pho',
    accent: '#16a34a',
    segment: 'Sit-Down',
    dataSource: 'estimated',
    items: [
      { id: 'gl-pho-beef', name: 'Beef Pho', kind: 'fixed', category: 'Mains', serving: 'large bowl', tags: ['high-protein'], nutrition: { calories: 480, protein: 30, carbs: 62, fat: 10, sodium: 1900 } },
      { id: 'gl-pho-chicken', name: 'Chicken Pho', kind: 'fixed', category: 'Mains', serving: 'large bowl', tags: ['high-protein'], nutrition: { calories: 440, protein: 28, carbs: 60, fat: 8, sodium: 1800 } },
      { id: 'gl-vermicelli', name: 'Grilled Pork Vermicelli', kind: 'fixed', category: 'Bowls & Burritos', serving: '1 bowl', nutrition: { calories: 620, protein: 28, carbs: 78, fat: 20, sodium: 1200 } },
      { id: 'gl-spring-rolls', name: 'Fresh Spring Rolls (2)', kind: 'fixed', category: 'Sides', serving: '2 rolls', tags: ['vegan'], nutrition: { calories: 180, protein: 6, carbs: 30, fat: 4, sodium: 400 } },
    ],
  },
  {
    id: 'noodle-box',
    name: 'Noodle Box',
    cuisine: 'Asian street noodles',
    accent: '#dc2626',
    segment: 'Fast Food',
    dataSource: 'estimated',
    items: [
      { id: 'nb-pad-thai', name: 'Pad Thai', kind: 'fixed', category: 'Mains', serving: '1 box', nutrition: { calories: 720, protein: 24, carbs: 98, fat: 26, sodium: 1600 } },
      { id: 'nb-hokkien', name: 'Hokkien Noodles', kind: 'fixed', category: 'Mains', serving: '1 box', nutrition: { calories: 680, protein: 22, carbs: 92, fat: 24, sodium: 1700 } },
      { id: 'nb-singapore', name: 'Singapore Noodles', kind: 'fixed', category: 'Mains', serving: '1 box', tags: ['spicy'], nutrition: { calories: 640, protein: 24, carbs: 84, fat: 22, sodium: 1650 } },
    ],
  },
  {
    id: 'bad-radish',
    name: 'Bad Radish',
    cuisine: 'Plant-based comfort food',
    accent: '#65a30d',
    segment: 'Fast Food',
    dataSource: 'estimated',
    items: [
      { id: 'br-mac', name: 'Vegan Mac & Cheese', kind: 'fixed', category: 'Mains', serving: '1 bowl', tags: ['vegan'], nutrition: { calories: 620, protein: 20, carbs: 78, fat: 26, sodium: 980 } },
      { id: 'br-burger', name: 'Plant-Based Burger', kind: 'fixed', category: 'Burgers', serving: '1 burger', tags: ['vegan'], nutrition: { calories: 680, protein: 26, carbs: 60, fat: 36, sodium: 1100 } },
      { id: 'br-buddha', name: 'Buddha Bowl', kind: 'fixed', category: 'Bowls & Burritos', serving: '1 bowl', tags: ['vegan', 'high-protein'], nutrition: { calories: 540, protein: 20, carbs: 70, fat: 20, sodium: 720, fiber: 12 } },
    ],
  },
  {
    id: 'zolas',
    name: "Zola's",
    cuisine: 'Canadian · Casual fine dining',
    accent: '#9333ea',
    segment: 'Sit-Down',
    dataSource: 'estimated',
    items: [
      { id: 'zl-salmon', name: 'Grilled Salmon', kind: 'fixed', category: 'Mains', serving: 'with sides', tags: ['high-protein'], nutrition: { calories: 620, protein: 44, carbs: 32, fat: 34, sodium: 900 } },
      { id: 'zl-steak', name: 'Sirloin Steak Frites', kind: 'fixed', category: 'Mains', serving: 'with fries', tags: ['high-protein'], nutrition: { calories: 880, protein: 50, carbs: 52, fat: 50, sodium: 1200 } },
      { id: 'zl-risotto', name: 'Mushroom Risotto', kind: 'fixed', category: 'Mains', serving: '1 plate', tags: ['vegetarian'], nutrition: { calories: 720, protein: 18, carbs: 88, fat: 32, sodium: 1100 } },
    ],
  },
  {
    id: 'streats-kitchen',
    name: 'Streats Kitchen',
    cuisine: 'Global street food',
    accent: '#f59e0b',
    segment: 'Fast Food',
    dataSource: 'estimated',
    items: [
      { id: 'sk-loaded-fries', name: 'Loaded Butter Chicken Fries', kind: 'fixed', category: 'Sides', serving: 'regular', nutrition: { calories: 880, protein: 30, carbs: 74, fat: 50, sodium: 1600 } },
      { id: 'sk-rice-bowl', name: 'Chicken Rice Bowl', kind: 'fixed', category: 'Bowls & Burritos', serving: '1 bowl', tags: ['high-protein'], nutrition: { calories: 720, protein: 38, carbs: 82, fat: 24, sodium: 1400 } },
      { id: 'sk-taco', name: 'Street Tacos (3)', kind: 'fixed', category: 'Bowls & Burritos', serving: '3 tacos', nutrition: { calories: 560, protein: 26, carbs: 52, fat: 26, sodium: 1200 } },
    ],
  },
  {
    id: 'tahinis',
    name: "Tahini's",
    cuisine: 'Middle Eastern · Shawarma',
    accent: '#0f766e',
    segment: 'Fast Food',
    // Official figures from Tahini's published Nutritional Values guide (Sept 2025).
    dataSource: 'official',
    items: [
      { id: 'th-chicken-wrap', name: 'Chicken Shawarma Wrap (Original)', kind: 'fixed', category: 'Wraps', serving: '350 g', tags: ['high-protein'], nutrition: { calories: 729, protein: 31, carbs: 82, fat: 30, sodium: 891, fiber: 4, sugar: 6 } },
      { id: 'th-beef-wrap', name: 'Beef Shawarma Wrap', kind: 'fixed', category: 'Wraps', serving: '338 g', tags: ['high-protein'], nutrition: { calories: 859, protein: 43, carbs: 92, fat: 33, sodium: 1198, fiber: 10, sugar: 3 } },
      { id: 'th-chicken-bowl', name: 'Chicken & Rice Bowl', kind: 'fixed', category: 'Bowls & Burritos', serving: '443 g', tags: ['high-protein'], nutrition: { calories: 617, protein: 27, carbs: 51, fat: 32, sodium: 1502, fiber: 3 } },
      { id: 'th-beef-bowl', name: 'Beef Shawarma Bowl', kind: 'fixed', category: 'Bowls & Burritos', serving: '603 g', tags: ['high-protein'], nutrition: { calories: 990, protein: 45, carbs: 98, fat: 48, sodium: 2749, fiber: 14 } },
      { id: 'th-falafel-wrap', name: 'Falafel Wrap', kind: 'fixed', category: 'Wraps', serving: '355 g', tags: ['vegan'], nutrition: { calories: 541, protein: 18, carbs: 98, fat: 12, sodium: 1824, fiber: 11 } },
      { id: 'th-fries', name: 'Fries (Large)', kind: 'fixed', category: 'Sides', serving: '350 g', tags: ['vegetarian', 'vegan'], nutrition: { calories: 412, protein: 6, carbs: 68, fat: 12, sodium: 897 } },
    ],
  },
  {
    id: 'moes',
    name: "Moe's",
    cuisine: 'Tex-Mex · Burritos',
    accent: '#dc2626',
    segment: 'Fast Food',
    dataSource: 'estimated',
    items: [
      { id: 'mo-burrito', name: 'Chicken Burrito', kind: 'fixed', category: 'Bowls & Burritos', serving: '1 burrito', tags: ['high-protein'], nutrition: { calories: 830, protein: 44, carbs: 92, fat: 30, sodium: 1800 } },
      { id: 'mo-bowl', name: 'Burrito Bowl', kind: 'fixed', category: 'Bowls & Burritos', serving: '1 bowl', tags: ['high-protein'], nutrition: { calories: 620, protein: 40, carbs: 62, fat: 22, sodium: 1500 } },
      { id: 'mo-nachos', name: 'Loaded Nachos', kind: 'fixed', category: 'Sides', serving: '1 order', nutrition: { calories: 980, protein: 34, carbs: 84, fat: 54, sodium: 1900 } },
    ],
  },
]
