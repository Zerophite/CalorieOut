import { type MenuItem, type Restaurant } from '../types'
import { buildComponents, REF } from './components'

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
  { id: 'wing-up', name: 'WingsUp!', cuisine: 'Wings', accent: '#ea580c', segment: 'Fast Food', dataSource: 'estimated', items: wingsMenu('wu') },
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
      {
        id: 'hh-fishburger', name: 'Fish Burger', kind: 'fixed', category: 'Sandwiches', serving: '1 burger',
        nutrition: { calories: 560, protein: 24, carbs: 52, fat: 28, sodium: 950 },
        components: buildComponents({ calories: 560, protein: 24, carbs: 52, fat: 28, sodium: 950 }, [
          { id: 'bun', name: 'Bun', n: REF.bunMedium, removable: false },
          { id: 'fish', name: 'Battered fish fillet', core: true },
          { id: 'tartar', name: 'Tartar sauce', n: { calories: 90, protein: 0, carbs: 2, fat: 9, sodium: 150 } },
          { id: 'lettuce', name: 'Lettuce', n: REF.lettuce },
        ]),
      },
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
      {
        id: 'rd-smoked-meat', name: 'Smoked Meat Sandwich', kind: 'fixed', category: 'Sandwiches', serving: '1 sandwich', tags: ['high-protein'],
        nutrition: { calories: 560, protein: 38, carbs: 42, fat: 26, sodium: 1900 },
        components: buildComponents({ calories: 560, protein: 38, carbs: 42, fat: 26, sodium: 1900 }, [
          { id: 'bread', name: 'Rye bread', n: { calories: 200, protein: 8, carbs: 38, fat: 2, sodium: 500 }, removable: false },
          { id: 'meat', name: 'Smoked meat', core: true },
          { id: 'mustard', name: 'Mustard', n: { calories: 10, protein: 0, carbs: 1, fat: 0, sodium: 160 } },
        ]),
      },
      {
        id: 'rd-reuben', name: 'Reuben', kind: 'fixed', category: 'Sandwiches', serving: '1 sandwich',
        nutrition: { calories: 720, protein: 40, carbs: 46, fat: 40, sodium: 2100 },
        components: buildComponents({ calories: 720, protein: 40, carbs: 46, fat: 40, sodium: 2100 }, [
          { id: 'bread', name: 'Rye bread', n: { calories: 200, protein: 8, carbs: 38, fat: 2, sodium: 500 }, removable: false },
          { id: 'meat', name: 'Corned beef', core: true },
          { id: 'cheese', name: 'Swiss cheese', n: { calories: 80, protein: 5, carbs: 1, fat: 7, sodium: 250 } },
          { id: 'kraut', name: 'Sauerkraut', n: { calories: 20, protein: 1, carbs: 4, fat: 0, sodium: 300 } },
          { id: 'dressing', name: 'Russian dressing', n: { calories: 90, protein: 0, carbs: 3, fat: 9, sodium: 200 } },
        ]),
      },
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
    name: 'Noodlebox',
    cuisine: 'Asian noodles · Stir-fry',
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
    name: 'Mad Radish',
    cuisine: 'Healthy bowls, salads & wraps',
    accent: '#65a30d',
    segment: 'Fast Food',
    dataSource: 'estimated',
    items: [
      {
        id: 'br-chicken-bowl', name: 'Chicken Grain Bowl', kind: 'fixed', category: 'Bowls & Burritos', serving: '1 bowl', tags: ['high-protein'],
        nutrition: { calories: 620, protein: 38, carbs: 62, fat: 24, sodium: 980 },
        components: buildComponents({ calories: 620, protein: 38, carbs: 62, fat: 24, sodium: 980 }, [
          { id: 'grains', name: 'Grains', n: REF.riceCup, removable: false },
          { id: 'chicken', name: 'Roasted chicken', core: true },
          { id: 'dressing', name: 'Dressing', n: { calories: 120, protein: 0, carbs: 4, fat: 12, sodium: 220 } },
          { id: 'veg', name: 'Greens & roasted veg', n: { calories: 40, protein: 2, carbs: 7, fat: 1, sodium: 60 } },
        ]),
      },
      {
        id: 'br-tofu-bowl', name: 'Tofu Grain Bowl', kind: 'fixed', category: 'Bowls & Burritos', serving: '1 bowl', tags: ['vegan'],
        nutrition: { calories: 560, protein: 22, carbs: 66, fat: 22, sodium: 860, fiber: 10 },
        components: buildComponents({ calories: 560, protein: 22, carbs: 66, fat: 22, sodium: 860 }, [
          { id: 'grains', name: 'Grains', n: REF.riceCup, removable: false },
          { id: 'tofu', name: 'Tofu', core: true },
          { id: 'dressing', name: 'Dressing', n: { calories: 120, protein: 0, carbs: 4, fat: 12, sodium: 220 } },
          { id: 'veg', name: 'Greens & roasted veg', n: { calories: 40, protein: 2, carbs: 7, fat: 1, sodium: 60 } },
        ]),
      },
      { id: 'br-caesar', name: 'Kale Caesar Salad', kind: 'fixed', category: 'Salads', serving: '1 salad', tags: ['vegetarian'], nutrition: { calories: 420, protein: 14, carbs: 22, fat: 30, sodium: 780 } },
      {
        id: 'br-wrap', name: 'Chicken Wrap', kind: 'fixed', category: 'Wraps', serving: '1 wrap', tags: ['high-protein'],
        nutrition: { calories: 640, protein: 36, carbs: 58, fat: 28, sodium: 1250 },
        components: buildComponents({ calories: 640, protein: 36, carbs: 58, fat: 28, sodium: 1250 }, [
          { id: 'tortilla', name: 'Tortilla', n: REF.tortillaLarge, removable: false },
          { id: 'chicken', name: 'Roasted chicken', core: true },
          { id: 'sauce', name: 'Sauce', n: { calories: 90, protein: 0, carbs: 3, fat: 9, sodium: 180 } },
          { id: 'veg', name: 'Greens & veg', n: { calories: 20, protein: 1, carbs: 4, fat: 0, sodium: 20 } },
        ]),
      },
    ],
  },
  {
    id: 'zolas',
    name: 'Zolas',
    cuisine: 'Italian · Brunch & dinner',
    accent: '#9333ea',
    segment: 'Sit-Down',
    dataSource: 'estimated',
    items: [
      { id: 'zl-salmon', name: 'Grilled Salmon', kind: 'fixed', category: 'Mains', serving: 'with sides', tags: ['high-protein'], nutrition: { calories: 620, protein: 44, carbs: 32, fat: 34, sodium: 900 } },
      { id: 'zl-bolognese', name: 'Spaghetti Bolognese', kind: 'fixed', category: 'Mains', serving: '1 plate', nutrition: { calories: 780, protein: 34, carbs: 96, fat: 26, sodium: 1150 } },
      { id: 'zl-alfredo', name: 'Chicken Fettuccine Alfredo', kind: 'fixed', category: 'Mains', serving: '1 plate', tags: ['high-protein'], nutrition: { calories: 1050, protein: 48, carbs: 92, fat: 54, sodium: 1400 } },
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
    id: 'moes',
    name: "Moe's",
    cuisine: 'Tex-Mex · Burritos',
    accent: '#dc2626',
    segment: 'Fast Food',
    dataSource: 'estimated',
    items: [
      {
        id: 'mo-burrito', name: 'Chicken Burrito', kind: 'fixed', category: 'Bowls & Burritos', serving: '1 burrito', tags: ['high-protein'],
        nutrition: { calories: 830, protein: 44, carbs: 92, fat: 30, sodium: 1800 },
        components: buildComponents({ calories: 830, protein: 44, carbs: 92, fat: 30, sodium: 1800 }, [
          { id: 'tortilla', name: 'Flour tortilla', n: REF.tortillaLarge, removable: false },
          { id: 'chicken', name: 'Chicken', core: true },
          { id: 'rice', name: 'Rice', n: { calories: 210, protein: 4, carbs: 45, fat: 2, sodium: 5 } },
          { id: 'beans', name: 'Beans', n: { calories: 110, protein: 7, carbs: 19, fat: 1, sodium: 330 } },
          { id: 'cheese', name: 'Cheese', n: REF.cheeseShred },
          { id: 'salsa', name: 'Salsa', n: { calories: 20, protein: 1, carbs: 4, fat: 0, sodium: 160 } },
        ]),
      },
      {
        id: 'mo-bowl', name: 'Burrito Bowl', kind: 'fixed', category: 'Bowls & Burritos', serving: '1 bowl', tags: ['high-protein'],
        nutrition: { calories: 620, protein: 40, carbs: 62, fat: 22, sodium: 1500 },
        components: buildComponents({ calories: 620, protein: 40, carbs: 62, fat: 22, sodium: 1500 }, [
          { id: 'rice', name: 'Rice', n: REF.riceCup, removable: false },
          { id: 'chicken', name: 'Chicken', core: true },
          { id: 'beans', name: 'Beans', n: { calories: 110, protein: 7, carbs: 19, fat: 1, sodium: 330 } },
          { id: 'cheese', name: 'Cheese', n: REF.cheeseShred },
          { id: 'salsa', name: 'Salsa', n: { calories: 20, protein: 1, carbs: 4, fat: 0, sodium: 160 } },
        ]),
      },
      { id: 'mo-nachos', name: 'Loaded Nachos', kind: 'fixed', category: 'Sides', serving: '1 order', nutrition: { calories: 980, protein: 34, carbs: 84, fat: 54, sodium: 1900 } },
    ],
  },
]
