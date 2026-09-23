import { type MenuItem, type Restaurant } from '../types'

// ESTIMATED values. Bubble tea calories swing a lot with sugar level and
// toppings; these assume a medium (~500 mL) at standard sweetness with tapioca.
function bubbleTeaMenu(prefix: string): MenuItem[] {
  return [
    { id: `${prefix}-classic-milk`, name: 'Classic Milk Tea + Tapioca', kind: 'fixed', category: 'Drinks', serving: 'medium', tags: ['vegetarian'], nutrition: { calories: 400, protein: 4, carbs: 72, fat: 9, sodium: 90, sugar: 46 } },
    { id: `${prefix}-brown-sugar`, name: 'Brown Sugar Milk + Pearls', kind: 'fixed', category: 'Drinks', serving: 'medium', tags: ['vegetarian'], nutrition: { calories: 500, protein: 5, carbs: 92, fat: 11, sodium: 100, sugar: 62 } },
    { id: `${prefix}-taro`, name: 'Taro Milk Tea', kind: 'fixed', category: 'Drinks', serving: 'medium', tags: ['vegetarian'], nutrition: { calories: 450, protein: 4, carbs: 80, fat: 11, sodium: 120, sugar: 54 } },
    { id: `${prefix}-matcha`, name: 'Matcha Milk Tea', kind: 'fixed', category: 'Drinks', serving: 'medium', tags: ['vegetarian'], nutrition: { calories: 420, protein: 5, carbs: 70, fat: 12, sodium: 110, sugar: 48 } },
    { id: `${prefix}-fruit-tea`, name: 'Fruit Tea (no milk)', kind: 'fixed', category: 'Drinks', serving: 'medium', tags: ['vegan'], nutrition: { calories: 250, protein: 0, carbs: 62, fat: 0, sodium: 30, sugar: 52 } },
    { id: `${prefix}-fresh-milk`, name: 'Fresh Milk Tea (50% sugar)', kind: 'fixed', category: 'Drinks', serving: 'medium', tags: ['vegetarian'], nutrition: { calories: 280, protein: 5, carbs: 46, fat: 8, sodium: 90, sugar: 28 } },
  ]
}

export const bubbleTeaSpots: Restaurant[] = [
  { id: 'coco', name: 'CoCo Bubble Tea', cuisine: 'Bubble tea', accent: '#dc2626', segment: 'Coffee & Bakery', dataSource: 'estimated', items: bubbleTeaMenu('coco') },
  { id: 'tea-live', name: 'Tea Live', cuisine: 'Bubble tea', accent: '#16a34a', segment: 'Coffee & Bakery', dataSource: 'estimated', items: bubbleTeaMenu('tl') },
  { id: 'chicha-san-chen', name: 'Chicha San Chen', cuisine: 'Bubble tea', accent: '#0d9488', segment: 'Coffee & Bakery', dataSource: 'estimated', items: bubbleTeaMenu('csc') },
]
