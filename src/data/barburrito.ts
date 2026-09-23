import { type Restaurant } from '../types'

// Approximate values compiled from Bar Burrito's published nutrition info.
// Builder mirrors their real bowl/burrito flow: base → protein → beans →
// toppings → salsas → extras. Numbers are per listed portion.
export const barburrito: Restaurant = {
  id: 'bar-burrito',
  name: 'Bar Burrito',
  cuisine: 'Mexican · Build-your-own',
  accent: '#e11d48',
  segment: 'Build-Your-Own',
  items: [
    {
      id: 'bb-bowl',
      name: 'Build Your Bowl / Burrito',
      kind: 'builder',
      category: 'Bowls & Burritos',
      description:
        'Pick a base, protein, beans and pile on toppings. Choose a tortilla to make it a burrito, or skip it for a bowl.',
      groups: [
        {
          id: 'wrap',
          name: 'Wrap it up? (bowl = none)',
          min: 0,
          max: 1,
          options: [
            {
              id: 'none',
              name: 'No tortilla (bowl)',
              recommended: true,
              nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0 },
            },
            {
              id: 'flour12',
              name: '12" Flour Tortilla',
              nutrition: { calories: 320, protein: 8, carbs: 54, fat: 8, sodium: 700 },
            },
            {
              id: 'whole-wheat',
              name: '12" Whole Wheat Tortilla',
              nutrition: { calories: 300, protein: 9, carbs: 50, fat: 8, sodium: 660, fiber: 5 },
            },
          ],
        },
        {
          id: 'base',
          name: 'Base',
          min: 1,
          max: 2,
          options: [
            {
              id: 'cilantro-rice',
              name: 'Cilantro Lime Rice',
              recommended: true,
              nutrition: { calories: 210, protein: 4, carbs: 44, fat: 2, sodium: 350 },
            },
            {
              id: 'brown-rice',
              name: 'Brown Rice',
              nutrition: { calories: 200, protein: 5, carbs: 42, fat: 2, sodium: 300, fiber: 3 },
            },
            {
              id: 'lettuce',
              name: 'Shredded Lettuce',
              tags: ['low-carb', 'vegan'],
              nutrition: { calories: 10, protein: 1, carbs: 2, fat: 0, sodium: 5, fiber: 1 },
            },
          ],
        },
        {
          id: 'protein',
          name: 'Protein',
          min: 1,
          max: 1,
          options: [
            {
              id: 'chicken',
              name: 'Grilled Chicken',
              recommended: true,
              tags: ['high-protein'],
              nutrition: { calories: 180, protein: 33, carbs: 2, fat: 5, sodium: 520 },
            },
            {
              id: 'steak',
              name: 'Steak',
              tags: ['high-protein'],
              nutrition: { calories: 200, protein: 30, carbs: 3, fat: 8, sodium: 560 },
            },
            {
              id: 'ground-beef',
              name: 'Seasoned Ground Beef',
              nutrition: { calories: 245, protein: 22, carbs: 4, fat: 16, sodium: 620 },
            },
            {
              id: 'pork',
              name: 'Carnitas Pork',
              nutrition: { calories: 210, protein: 24, carbs: 2, fat: 12, sodium: 640 },
            },
            {
              id: 'veggie',
              name: 'Grilled Veggies',
              tags: ['vegetarian', 'vegan', 'low-carb'],
              nutrition: { calories: 60, protein: 2, carbs: 9, fat: 2, sodium: 150, fiber: 3 },
            },
          ],
        },
        {
          id: 'beans',
          name: 'Beans',
          min: 0,
          max: 2,
          options: [
            {
              id: 'black-beans',
              name: 'Black Beans',
              recommended: true,
              tags: ['vegan', 'high-protein'],
              nutrition: { calories: 130, protein: 8, carbs: 22, fat: 1, sodium: 330, fiber: 7 },
            },
            {
              id: 'pinto-beans',
              name: 'Pinto Beans',
              tags: ['vegan'],
              nutrition: { calories: 120, protein: 7, carbs: 21, fat: 1, sodium: 340, fiber: 6 },
            },
          ],
        },
        {
          id: 'toppings',
          name: 'Toppings (load up free)',
          min: 0,
          options: [
            {
              id: 'cheese',
              name: 'Shredded Cheese',
              nutrition: { calories: 110, protein: 7, carbs: 1, fat: 9, sodium: 180 },
            },
            {
              id: 'sour-cream',
              name: 'Sour Cream',
              nutrition: { calories: 60, protein: 1, carbs: 2, fat: 6, sodium: 30 },
            },
            {
              id: 'guac',
              name: 'Guacamole',
              tags: ['vegan'],
              nutrition: { calories: 150, protein: 2, carbs: 8, fat: 13, sodium: 250, fiber: 5 },
            },
            {
              id: 'corn',
              name: 'Corn Salsa',
              tags: ['vegan'],
              recommended: true,
              nutrition: { calories: 45, protein: 1, carbs: 10, fat: 1, sodium: 200 },
            },
            {
              id: 'lettuce-top',
              name: 'Lettuce',
              tags: ['vegan', 'low-carb'],
              nutrition: { calories: 5, protein: 0, carbs: 1, fat: 0, sodium: 0 },
            },
            {
              id: 'pico',
              name: 'Pico de Gallo',
              tags: ['vegan', 'low-carb'],
              recommended: true,
              nutrition: { calories: 20, protein: 1, carbs: 4, fat: 0, sodium: 160 },
            },
          ],
        },
        {
          id: 'salsa',
          name: 'Salsa / Sauce',
          min: 0,
          options: [
            {
              id: 'mild',
              name: 'Mild Salsa',
              tags: ['vegan', 'low-carb'],
              recommended: true,
              nutrition: { calories: 15, protein: 0, carbs: 3, fat: 0, sodium: 220 },
            },
            {
              id: 'hot',
              name: 'Hot Salsa',
              tags: ['vegan', 'spicy', 'low-carb'],
              nutrition: { calories: 15, protein: 0, carbs: 3, fat: 0, sodium: 240 },
            },
            {
              id: 'chipotle',
              name: 'Chipotle Sauce',
              tags: ['spicy'],
              nutrition: { calories: 90, protein: 0, carbs: 3, fat: 9, sodium: 190 },
            },
            {
              id: 'queso',
              name: 'Queso',
              nutrition: { calories: 120, protein: 5, carbs: 6, fat: 9, sodium: 420 },
            },
          ],
        },
      ],
    },
    {
      id: 'bb-chips-guac',
      name: 'Chips & Guacamole',
      kind: 'fixed',
      category: 'Sides',
      serving: '1 order',
      tags: ['vegetarian'],
      nutrition: { calories: 520, protein: 6, carbs: 55, fat: 31, sodium: 560, fiber: 8 },
    },
    {
      id: 'bb-quesadilla',
      name: 'Cheese Quesadilla',
      kind: 'fixed',
      category: 'Bowls & Burritos',
      serving: '1 quesadilla',
      tags: ['vegetarian'],
      nutrition: { calories: 640, protein: 26, carbs: 58, fat: 33, sodium: 1240 },
    },
  ],
}
