import { type Restaurant } from '../types'

// Approximate values based on Freshii Canada nutrition info. Builder mirrors
// their custom bowl flow: base → protein → toppings → dressing.
export const freshii: Restaurant = {
  id: 'freshii',
  name: 'Freshii',
  cuisine: 'Bowls & Salads · Build-your-own',
  accent: '#0d9488',
  segment: 'Build-Your-Own',
  items: [
    {
      id: 'fr-bowl',
      name: 'Build Your Bowl',
      kind: 'builder',
      category: 'Bowls & Burritos',
      description:
        'Start with a base, add a protein, pile on toppings and finish with a dressing.',
      groups: [
        {
          id: 'base',
          name: 'Base',
          min: 1,
          max: 1,
          options: [
            { id: 'greens', name: 'Spring Mix Greens', recommended: true, tags: ['vegan', 'low-carb'], nutrition: { calories: 20, protein: 2, carbs: 4, fat: 0, sodium: 15, fiber: 2 } },
            { id: 'brown-rice', name: 'Brown Rice', tags: ['vegan'], nutrition: { calories: 220, protein: 5, carbs: 46, fat: 2, sodium: 5, fiber: 3 } },
            { id: 'quinoa', name: 'Quinoa', tags: ['vegan', 'high-protein'], nutrition: { calories: 180, protein: 8, carbs: 30, fat: 3, sodium: 10, fiber: 4 } },
            { id: 'noodles', name: 'Rice Noodles', tags: ['vegan'], nutrition: { calories: 200, protein: 3, carbs: 44, fat: 0, sodium: 20 } },
          ],
        },
        {
          id: 'protein',
          name: 'Protein',
          min: 1,
          max: 1,
          options: [
            { id: 'chicken', name: 'Grilled Chicken', recommended: true, tags: ['high-protein'], nutrition: { calories: 130, protein: 25, carbs: 0, fat: 3, sodium: 320 } },
            { id: 'steak', name: 'Steak', tags: ['high-protein'], nutrition: { calories: 180, protein: 24, carbs: 1, fat: 9, sodium: 340 } },
            { id: 'falafel', name: 'Falafel', tags: ['vegan'], nutrition: { calories: 230, protein: 9, carbs: 22, fat: 12, sodium: 460, fiber: 6 } },
            { id: 'tofu', name: 'Tofu', tags: ['vegan', 'high-protein'], nutrition: { calories: 110, protein: 12, carbs: 3, fat: 6, sodium: 180 } },
          ],
        },
        {
          id: 'toppings',
          name: 'Toppings',
          min: 0,
          options: [
            { id: 'avocado', name: 'Avocado', tags: ['vegan'], nutrition: { calories: 80, protein: 1, carbs: 4, fat: 7, sodium: 0, fiber: 3 } },
            { id: 'edamame', name: 'Edamame', tags: ['vegan', 'high-protein'], nutrition: { calories: 60, protein: 5, carbs: 5, fat: 3, sodium: 55, fiber: 3 } },
            { id: 'feta', name: 'Feta', tags: ['vegetarian'], nutrition: { calories: 70, protein: 4, carbs: 1, fat: 6, sodium: 260 } },
            { id: 'corn', name: 'Corn', tags: ['vegan'], nutrition: { calories: 45, protein: 1, carbs: 10, fat: 1, sodium: 0 } },
            { id: 'cukes', name: 'Cucumbers', tags: ['vegan', 'low-carb'], nutrition: { calories: 10, protein: 0, carbs: 2, fat: 0, sodium: 0 } },
            { id: 'crispy-onions', name: 'Crispy Onions', tags: ['vegan'], nutrition: { calories: 80, protein: 1, carbs: 8, fat: 5, sodium: 90 } },
          ],
        },
        {
          id: 'dressing',
          name: 'Dressing',
          min: 0,
          max: 1,
          options: [
            { id: 'lemon', name: 'Lemon Herb (light)', recommended: true, tags: ['vegan', 'low-carb'], nutrition: { calories: 45, protein: 0, carbs: 1, fat: 5, sodium: 120 } },
            { id: 'balsamic', name: 'Balsamic Vinaigrette', tags: ['vegan'], nutrition: { calories: 90, protein: 0, carbs: 4, fat: 8, sodium: 160 } },
            { id: 'peanut', name: 'Peanut Sauce', tags: ['vegan'], nutrition: { calories: 150, protein: 4, carbs: 8, fat: 12, sodium: 340 } },
            { id: 'ranch', name: 'Ranch', tags: ['vegetarian'], nutrition: { calories: 130, protein: 1, carbs: 2, fat: 13, sodium: 250 } },
          ],
        },
      ],
    },
    { id: 'fr-smoothie', name: 'Mango Smoothie', kind: 'fixed', category: 'Drinks', serving: 'regular', tags: ['vegan'], nutrition: { calories: 230, protein: 3, carbs: 52, fat: 1, sodium: 60, sugar: 44 } },
    { id: 'fr-burrito', name: 'Fiesta Burrito', kind: 'fixed', category: 'Bowls & Burritos', serving: '1 burrito', tags: ['vegetarian'], nutrition: { calories: 640, protein: 24, carbs: 88, fat: 22, sodium: 1180, fiber: 12 } },
  ],
}
