import { type Restaurant } from '../types'

// Approximate values based on Mucho Burrito Canada nutrition info.
export const muchoburrito: Restaurant = {
  id: 'mucho-burrito',
  name: 'Mucho Burrito',
  cuisine: 'Mexican · Build-your-own',
  accent: '#c2410c',
  segment: 'Build-Your-Own',
  dataSource: 'official',
  items: [
    {
      id: 'mb-bowl',
      name: 'Build Your Burrito / Bowl',
      kind: 'builder',
      category: 'Bowls & Burritos',
      description:
        'Choose a tortilla or go bowl-style, then pick rice, protein, beans and toppings.',
      groups: [
        {
          id: 'wrap',
          name: 'Wrap',
          min: 0,
          max: 1,
          options: [
            { id: 'none', name: 'No tortilla (bowl)', recommended: true, nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0 } },
            { id: 'flour', name: 'Large Flour Tortilla', nutrition: { calories: 330, protein: 9, carbs: 55, fat: 8, sodium: 720 } },
            { id: 'spinach', name: 'Spinach Tortilla', nutrition: { calories: 320, protein: 9, carbs: 54, fat: 8, sodium: 700 } },
          ],
        },
        {
          id: 'rice',
          name: 'Rice',
          min: 0,
          max: 1,
          options: [
            { id: 'cilantro', name: 'Cilantro Lime Rice', recommended: true, nutrition: { calories: 200, protein: 4, carbs: 42, fat: 2, sodium: 360 } },
            { id: 'none-rice', name: 'No rice', tags: ['low-carb'], nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0 } },
          ],
        },
        {
          id: 'protein',
          name: 'Protein',
          min: 1,
          max: 1,
          options: [
            { id: 'chicken', name: 'Grilled Chicken', recommended: true, tags: ['high-protein'], nutrition: { calories: 190, protein: 34, carbs: 2, fat: 5, sodium: 540 } },
            { id: 'steak', name: 'Steak', tags: ['high-protein'], nutrition: { calories: 210, protein: 31, carbs: 3, fat: 8, sodium: 580 } },
            { id: 'beef', name: 'Ground Beef', nutrition: { calories: 250, protein: 22, carbs: 4, fat: 16, sodium: 640 } },
            { id: 'guacamole-veg', name: 'Veggie (extra guac)', tags: ['vegetarian'], nutrition: { calories: 150, protein: 2, carbs: 9, fat: 13, sodium: 250, fiber: 5 } },
          ],
        },
        {
          id: 'beans',
          name: 'Beans',
          min: 0,
          max: 2,
          options: [
            { id: 'black', name: 'Black Beans', recommended: true, tags: ['vegan'], nutrition: { calories: 130, protein: 8, carbs: 22, fat: 1, sodium: 330, fiber: 7 } },
            { id: 'refried', name: 'Refried Beans', tags: ['vegetarian'], nutrition: { calories: 150, protein: 7, carbs: 22, fat: 3, sodium: 480, fiber: 6 } },
          ],
        },
        {
          id: 'toppings',
          name: 'Toppings',
          min: 0,
          options: [
            { id: 'cheese', name: 'Cheese', nutrition: { calories: 110, protein: 7, carbs: 1, fat: 9, sodium: 180 } },
            { id: 'sourcream', name: 'Sour Cream', nutrition: { calories: 60, protein: 1, carbs: 2, fat: 6, sodium: 30 } },
            { id: 'guac', name: 'Guacamole', tags: ['vegan'], nutrition: { calories: 150, protein: 2, carbs: 8, fat: 13, sodium: 250, fiber: 5 } },
            { id: 'pico', name: 'Pico de Gallo', tags: ['vegan', 'low-carb'], recommended: true, nutrition: { calories: 20, protein: 1, carbs: 4, fat: 0, sodium: 160 } },
            { id: 'lettuce', name: 'Lettuce', tags: ['vegan', 'low-carb'], nutrition: { calories: 5, protein: 0, carbs: 1, fat: 0, sodium: 0 } },
            { id: 'salsa-hot', name: 'Hot Salsa', tags: ['vegan', 'spicy', 'low-carb'], nutrition: { calories: 15, protein: 0, carbs: 3, fat: 0, sodium: 240 } },
          ],
        },
      ],
    },
    { id: 'mb-quesadilla', name: 'Chicken Quesadilla', kind: 'fixed', category: 'Bowls & Burritos', serving: '1 quesadilla', nutrition: { calories: 720, protein: 40, carbs: 52, fat: 38, sodium: 1500 } },
    { id: 'mb-chips-guac', name: 'Chips & Guacamole', kind: 'fixed', category: 'Sides', serving: '1 order', tags: ['vegetarian'], nutrition: { calories: 540, protein: 6, carbs: 56, fat: 33, sodium: 580, fiber: 8 } },
  ],
}
