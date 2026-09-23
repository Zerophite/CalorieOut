import { type Restaurant } from '../types'

// Approximate values based on Subway Canada nutrition info. Builder covers the
// classic flow: bread → size → protein → cheese → veggies → sauces.
export const subway: Restaurant = {
  id: 'subway',
  name: 'Subway',
  cuisine: 'Sandwiches · Build-your-own',
  accent: '#16a34a',
  segment: 'Build-Your-Own',
  items: [
    {
      id: 'sub-build',
      name: 'Build Your Sub',
      kind: 'builder',
      category: 'Sandwiches',
      description:
        'Choose bread and size, add a protein, cheese, unlimited veggies and finish with sauce.',
      groups: [
        {
          id: 'bread',
          name: 'Bread (6")',
          min: 1,
          max: 1,
          options: [
            {
              id: 'italian',
              name: 'Italian (White)',
              nutrition: { calories: 190, protein: 8, carbs: 37, fat: 2, sodium: 320 },
            },
            {
              id: 'wheat',
              name: '9-Grain Wheat',
              recommended: true,
              nutrition: { calories: 180, protein: 8, carbs: 35, fat: 2, sodium: 310, fiber: 4 },
            },
            {
              id: 'italian-herb',
              name: 'Italian Herbs & Cheese',
              nutrition: { calories: 230, protein: 10, carbs: 37, fat: 5, sodium: 500 },
            },
            {
              id: 'wrap',
              name: 'Tomato Basil Wrap',
              nutrition: { calories: 290, protein: 8, carbs: 49, fat: 7, sodium: 720 },
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
              id: 'turkey',
              name: 'Oven Roasted Turkey',
              recommended: true,
              tags: ['high-protein'],
              nutrition: { calories: 70, protein: 13, carbs: 3, fat: 1, sodium: 460 },
            },
            {
              id: 'chicken',
              name: 'Grilled Chicken',
              tags: ['high-protein'],
              nutrition: { calories: 110, protein: 19, carbs: 1, fat: 3, sodium: 350 },
            },
            {
              id: 'steak',
              name: 'Steak',
              tags: ['high-protein'],
              nutrition: { calories: 130, protein: 18, carbs: 4, fat: 5, sodium: 520 },
            },
            {
              id: 'meatball',
              name: 'Meatball Marinara',
              nutrition: { calories: 260, protein: 12, carbs: 22, fat: 14, sodium: 680 },
            },
            {
              id: 'tuna',
              name: 'Tuna',
              nutrition: { calories: 250, protein: 13, carbs: 2, fat: 21, sodium: 380 },
            },
            {
              id: 'veggie-patty',
              name: 'Veggie Patty',
              tags: ['vegetarian'],
              nutrition: { calories: 90, protein: 8, carbs: 9, fat: 3, sodium: 380, fiber: 4 },
            },
          ],
        },
        {
          id: 'cheese',
          name: 'Cheese',
          min: 0,
          max: 1,
          options: [
            {
              id: 'no-cheese',
              name: 'No cheese',
              recommended: true,
              nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0 },
            },
            {
              id: 'processed',
              name: 'Processed Cheddar',
              nutrition: { calories: 40, protein: 2, carbs: 1, fat: 4, sodium: 200 },
            },
            {
              id: 'monterey',
              name: 'Monterey Cheddar (shredded)',
              nutrition: { calories: 50, protein: 3, carbs: 1, fat: 4, sodium: 90 },
            },
          ],
        },
        {
          id: 'veggies',
          name: 'Veggies (free, load up)',
          min: 0,
          options: [
            { id: 'lettuce', name: 'Lettuce', tags: ['vegan', 'low-carb'], nutrition: { calories: 5, protein: 0, carbs: 1, fat: 0, sodium: 0 } },
            { id: 'tomato', name: 'Tomatoes', tags: ['vegan'], nutrition: { calories: 10, protein: 0, carbs: 2, fat: 0, sodium: 0 } },
            { id: 'cucumber', name: 'Cucumbers', tags: ['vegan'], nutrition: { calories: 5, protein: 0, carbs: 1, fat: 0, sodium: 0 } },
            { id: 'onion', name: 'Red Onions', tags: ['vegan'], nutrition: { calories: 5, protein: 0, carbs: 1, fat: 0, sodium: 0 } },
            { id: 'peppers', name: 'Green Peppers', tags: ['vegan'], nutrition: { calories: 5, protein: 0, carbs: 1, fat: 0, sodium: 0 } },
            { id: 'jalapeno', name: 'Jalapeños', tags: ['vegan', 'spicy'], nutrition: { calories: 5, protein: 0, carbs: 1, fat: 0, sodium: 210 } },
            { id: 'olives', name: 'Black Olives', tags: ['vegan'], nutrition: { calories: 10, protein: 0, carbs: 1, fat: 1, sodium: 75 } },
            { id: 'avocado', name: 'Avocado', tags: ['vegan'], nutrition: { calories: 60, protein: 1, carbs: 3, fat: 6, sodium: 0, fiber: 3 } },
          ],
        },
        {
          id: 'sauce',
          name: 'Sauces',
          min: 0,
          options: [
            { id: 'mustard', name: 'Yellow Mustard', tags: ['vegan', 'low-carb'], recommended: true, nutrition: { calories: 5, protein: 0, carbs: 0, fat: 0, sodium: 55 } },
            { id: 'sweet-onion', name: 'Sweet Onion', tags: ['vegan'], nutrition: { calories: 40, protein: 0, carbs: 9, fat: 0, sodium: 85 } },
            { id: 'mayo', name: 'Mayonnaise', nutrition: { calories: 100, protein: 0, carbs: 0, fat: 11, sodium: 75 } },
            { id: 'chipotle', name: 'Chipotle Southwest', tags: ['spicy'], nutrition: { calories: 90, protein: 0, carbs: 1, fat: 10, sodium: 130 } },
            { id: 'ranch', name: 'Ranch', nutrition: { calories: 110, protein: 0, carbs: 1, fat: 12, sodium: 180 } },
            { id: 'vinaigrette', name: 'Red Wine Vinaigrette', tags: ['vegan', 'low-carb'], nutrition: { calories: 30, protein: 0, carbs: 1, fat: 3, sodium: 200 } },
          ],
        },
      ],
    },
    {
      id: 'sub-cookie',
      name: 'Chocolate Chip Cookie',
      kind: 'fixed',
      category: 'Desserts',
      serving: '1 cookie',
      tags: ['vegetarian'],
      nutrition: { calories: 200, protein: 2, carbs: 30, fat: 9, sodium: 135, sugar: 17 },
    },
  ],
}
