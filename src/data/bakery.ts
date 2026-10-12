import { type Restaurant } from '../types'

// ESTIMATED values. Independent bakeries/cafés don't publish nutrition data;
// items are modelled from typical recipes for each baked good.
export const bakerySpots: Restaurant[] = [
  {
    id: 'suzy-q',
    name: 'Suzy Q Doughnuts',
    cuisine: 'Doughnuts · Café',
    accent: '#db2777',
    segment: 'Coffee & Bakery',
    dataSource: 'estimated',
    items: [
      { id: 'sq-maple-bacon', name: 'Maple Bacon Doughnut', kind: 'fixed', category: 'Bakery', serving: '1 doughnut', nutrition: { calories: 420, protein: 6, carbs: 48, fat: 22, sodium: 350, sugar: 26 } },
      { id: 'sq-vanilla-sprinkle', name: 'Vanilla Sprinkle Doughnut', kind: 'fixed', category: 'Bakery', serving: '1 doughnut', tags: ['vegetarian'], nutrition: { calories: 360, protein: 5, carbs: 50, fat: 16, sodium: 300, sugar: 28 } },
      { id: 'sq-lemon', name: 'Lemon Meringue Doughnut', kind: 'fixed', category: 'Bakery', serving: '1 doughnut', tags: ['vegetarian'], nutrition: { calories: 400, protein: 5, carbs: 54, fat: 18, sodium: 310, sugar: 30 } },
      { id: 'sq-hummingbird', name: 'Hummingbird Doughnut', kind: 'fixed', category: 'Bakery', serving: '1 doughnut', tags: ['vegetarian'], nutrition: { calories: 430, protein: 6, carbs: 56, fat: 20, sodium: 330, sugar: 32 } },
    ],
  },
  {
    id: 'tartelette',
    name: 'Tartelette Bakery & Café',
    cuisine: 'Pastries · Café',
    accent: '#a16207',
    segment: 'Coffee & Bakery',
    dataSource: 'estimated',
    items: [
      { id: 'tt-croissant', name: 'Butter Croissant', kind: 'fixed', category: 'Bakery', serving: '1 croissant', tags: ['vegetarian'], nutrition: { calories: 280, protein: 6, carbs: 30, fat: 16, sodium: 320 } },
      { id: 'tt-almond-croissant', name: 'Almond Croissant', kind: 'fixed', category: 'Bakery', serving: '1 croissant', tags: ['vegetarian'], nutrition: { calories: 430, protein: 9, carbs: 42, fat: 26, sodium: 360, sugar: 20 } },
      { id: 'tt-fruit-tart', name: 'Fruit Tartelette', kind: 'fixed', category: 'Desserts', serving: '1 tart', tags: ['vegetarian'], nutrition: { calories: 320, protein: 4, carbs: 40, fat: 16, sodium: 150, sugar: 24 } },
      { id: 'tt-quiche', name: 'Quiche Lorraine', kind: 'fixed', category: 'Mains', serving: '1 slice', nutrition: { calories: 440, protein: 16, carbs: 30, fat: 28, sodium: 680 } },
      { id: 'tt-latte', name: 'Café Latte', kind: 'fixed', category: 'Coffee', serving: 'medium', tags: ['vegetarian'], nutrition: { calories: 150, protein: 8, carbs: 13, fat: 8, sodium: 115, sugar: 12 } },
    ],
  },
  {
    id: 'kettlemans',
    name: "Kettleman's Bagel",
    cuisine: 'Montreal bagels · Café',
    accent: '#0f766e',
    segment: 'Coffee & Bakery',
    // Bagel bases use Kettleman's published figures (plain 220, sesame 230);
    // topped/sandwich items add modelled toppings, so kept flagged.
    dataSource: 'estimated',
    items: [
      { id: 'kb-plain', name: 'Plain Bagel', kind: 'fixed', category: 'Bakery', serving: '1 bagel', tags: ['vegan'], nutrition: { calories: 220, protein: 8, carbs: 44, fat: 2, sodium: 420, fiber: 2 } },
      { id: 'kb-sesame', name: 'Sesame Bagel', kind: 'fixed', category: 'Bakery', serving: '1 bagel', tags: ['vegetarian'], nutrition: { calories: 230, protein: 8, carbs: 42, fat: 4, sodium: 430, fiber: 2 } },
      { id: 'kb-sesame-cc', name: 'Sesame Bagel + Cream Cheese', kind: 'fixed', category: 'Bakery', serving: '1 bagel', tags: ['vegetarian'], nutrition: { calories: 320, protein: 11, carbs: 43, fat: 13, sodium: 560 } },
      { id: 'kb-lox', name: 'Bagel with Lox & Cream Cheese', kind: 'fixed', category: 'Sandwiches', serving: '1 bagel', tags: ['high-protein'], nutrition: { calories: 470, protein: 24, carbs: 45, fat: 19, sodium: 1250 } },
      { id: 'kb-breakfast', name: 'Egg & Cheese Bagel', kind: 'fixed', category: 'Breakfast', serving: '1 bagel', nutrition: { calories: 420, protein: 19, carbs: 45, fat: 16, sodium: 780 } },
    ],
  },
  {
    id: 'lokma',
    name: 'Lokma',
    cuisine: 'Dessert bar · Lokma & mini donuts',
    accent: '#b45309',
    segment: 'Coffee & Bakery',
    dataSource: 'estimated',
    items: [
      { id: 'lk-lokma', name: 'Lokma with Nutella', kind: 'fixed', category: 'Desserts', serving: '1 order', tags: ['vegetarian'], nutrition: { calories: 560, protein: 7, carbs: 78, fat: 25, sodium: 260, sugar: 44 } },
      { id: 'lk-mini-donuts', name: 'Mini Donuts (12)', kind: 'fixed', category: 'Desserts', serving: '12 pieces', tags: ['vegetarian'], nutrition: { calories: 520, protein: 6, carbs: 70, fat: 24, sodium: 380, sugar: 34 } },
      { id: 'lk-kroffle', name: 'Kroffle', kind: 'fixed', category: 'Desserts', serving: '1 kroffle', tags: ['vegetarian'], nutrition: { calories: 450, protein: 6, carbs: 52, fat: 24, sodium: 300, sugar: 26 } },
      { id: 'lk-shake', name: 'Milkshake', kind: 'fixed', category: 'Drinks', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 620, protein: 12, carbs: 86, fat: 26, sodium: 280, sugar: 76 } },
    ],
  },
]
