import { type Restaurant } from '../types'

// Approximate values based on Pita Pit Canada nutrition info. Builder covers
// the pita flow: pita → protein → cheese → veggies → sauce.
export const pitapit: Restaurant = {
  id: 'pita-pit',
  name: 'Pita Pit',
  cuisine: 'Pitas · Build-your-own',
  accent: '#65a30d',
  segment: 'Build-Your-Own',
  dataSource: 'official',
  items: [
    {
      id: 'pp-build',
      name: 'Build Your Pita',
      kind: 'builder',
      category: 'Wraps',
      description:
        'Pick a pita, a protein, cheese, unlimited veggies and a sauce. Order it as a bowl (no pita) to cut carbs.',
      groups: [
        {
          id: 'pita',
          name: 'Pita',
          min: 0,
          max: 1,
          options: [
            { id: 'white', name: 'Regular White Pita', nutrition: { calories: 240, protein: 8, carbs: 48, fat: 1, sodium: 470 } },
            { id: 'wholewheat', name: 'Whole Wheat Pita', recommended: true, nutrition: { calories: 230, protein: 9, carbs: 45, fat: 2, sodium: 450, fiber: 6 } },
            { id: 'bowl', name: 'No pita (bowl)', tags: ['low-carb'], nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0 } },
          ],
        },
        {
          id: 'protein',
          name: 'Protein',
          min: 1,
          max: 1,
          options: [
            { id: 'chicken', name: 'Grilled Chicken', recommended: true, tags: ['high-protein'], nutrition: { calories: 120, protein: 24, carbs: 1, fat: 2, sodium: 380 } },
            { id: 'steak', name: 'Philly Steak', tags: ['high-protein'], nutrition: { calories: 160, protein: 20, carbs: 3, fat: 8, sodium: 520 } },
            { id: 'turkey', name: 'Smoked Turkey', tags: ['high-protein'], nutrition: { calories: 90, protein: 16, carbs: 3, fat: 2, sodium: 620 } },
            { id: 'falafel', name: 'Falafel', tags: ['vegan'], nutrition: { calories: 230, protein: 8, carbs: 24, fat: 12, sodium: 480, fiber: 6 } },
            { id: 'gyro', name: 'Gyro', nutrition: { calories: 210, protein: 16, carbs: 4, fat: 15, sodium: 640 } },
          ],
        },
        {
          id: 'cheese',
          name: 'Cheese',
          min: 0,
          max: 1,
          options: [
            { id: 'none', name: 'No cheese', recommended: true, nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0 } },
            { id: 'cheddar', name: 'Cheddar', nutrition: { calories: 80, protein: 5, carbs: 1, fat: 7, sodium: 130 } },
            { id: 'feta', name: 'Feta', nutrition: { calories: 60, protein: 3, carbs: 1, fat: 5, sodium: 240 } },
          ],
        },
        {
          id: 'veggies',
          name: 'Veggies (free)',
          min: 0,
          options: [
            { id: 'lettuce', name: 'Lettuce', tags: ['vegan', 'low-carb'], nutrition: { calories: 5, protein: 0, carbs: 1, fat: 0, sodium: 0 } },
            { id: 'tomato', name: 'Tomato', tags: ['vegan'], nutrition: { calories: 10, protein: 0, carbs: 2, fat: 0, sodium: 0 } },
            { id: 'cucumber', name: 'Cucumber', tags: ['vegan'], nutrition: { calories: 5, protein: 0, carbs: 1, fat: 0, sodium: 0 } },
            { id: 'onion', name: 'Onions', tags: ['vegan'], nutrition: { calories: 5, protein: 0, carbs: 1, fat: 0, sodium: 0 } },
            { id: 'hummus', name: 'Hummus', tags: ['vegan'], nutrition: { calories: 70, protein: 2, carbs: 6, fat: 5, sodium: 130, fiber: 2 } },
            { id: 'avocado', name: 'Avocado', tags: ['vegan'], nutrition: { calories: 60, protein: 1, carbs: 3, fat: 6, sodium: 0, fiber: 3 } },
          ],
        },
        {
          id: 'sauce',
          name: 'Sauce',
          min: 0,
          options: [
            { id: 'tzatziki', name: 'Tzatziki', recommended: true, nutrition: { calories: 45, protein: 1, carbs: 2, fat: 4, sodium: 120 } },
            { id: 'hot-sauce', name: 'Hot Sauce', tags: ['vegan', 'spicy', 'low-carb'], nutrition: { calories: 5, protein: 0, carbs: 1, fat: 0, sodium: 200 } },
            { id: 'caesar', name: 'Caesar', nutrition: { calories: 120, protein: 1, carbs: 1, fat: 13, sodium: 200 } },
            { id: 'ranch', name: 'Ranch', nutrition: { calories: 110, protein: 0, carbs: 2, fat: 12, sodium: 180 } },
            { id: 'honey-mustard', name: 'Honey Mustard', nutrition: { calories: 90, protein: 0, carbs: 6, fat: 7, sodium: 160 } },
          ],
        },
      ],
    },
    { id: 'pp-smoothie', name: 'Berry Smoothie', kind: 'fixed', category: 'Drinks', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 250, protein: 4, carbs: 54, fat: 2, sodium: 90, sugar: 46 } },
  ],
}
