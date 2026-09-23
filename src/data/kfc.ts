import { type Restaurant } from '../types'

// Approximate values from KFC Canada nutrition information.
export const kfc: Restaurant = {
  id: 'kfc',
  name: 'KFC',
  cuisine: 'Fried chicken · Fast food',
  accent: '#dc2626',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [
    { id: 'kfc-og-breast', name: 'Original Recipe Breast', kind: 'fixed', category: 'Chicken', serving: '1 piece', tags: ['high-protein'], nutrition: { calories: 390, protein: 40, carbs: 11, fat: 21, sodium: 1190 } },
    { id: 'kfc-og-drum', name: 'Original Recipe Drumstick', kind: 'fixed', category: 'Chicken', serving: '1 piece', nutrition: { calories: 130, protein: 12, carbs: 4, fat: 8, sodium: 380 } },
    { id: 'kfc-tenders-3', name: 'Chicken Tenders (3 pc)', kind: 'fixed', category: 'Chicken', serving: '3 pieces', tags: ['high-protein'], nutrition: { calories: 340, protein: 30, carbs: 18, fat: 17, sodium: 1050 } },
    { id: 'kfc-popcorn', name: 'Popcorn Chicken', kind: 'fixed', category: 'Chicken', serving: 'regular', nutrition: { calories: 400, protein: 21, carbs: 27, fat: 24, sodium: 1200 } },
    { id: 'kfc-zinger', name: 'Zinger Sandwich', kind: 'fixed', category: 'Sandwiches', serving: '1 sandwich', tags: ['spicy'], nutrition: { calories: 480, protein: 26, carbs: 44, fat: 23, sodium: 1150 } },
    { id: 'kfc-famous-bowl', name: 'Famous Chicken Bowl', kind: 'fixed', category: 'Bowls & Burritos', serving: '1 bowl', nutrition: { calories: 710, protein: 26, carbs: 78, fat: 33, sodium: 2200 } },
    { id: 'kfc-fries', name: 'Seasoned Fries', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 320, protein: 4, carbs: 44, fat: 15, sodium: 690 } },
    { id: 'kfc-gravy', name: 'Popcorn Chicken Poutine', kind: 'fixed', category: 'Sides', serving: 'regular', nutrition: { calories: 780, protein: 26, carbs: 62, fat: 47, sodium: 2400 } },
    { id: 'kfc-coleslaw', name: 'Coleslaw', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 170, protein: 1, carbs: 18, fat: 10, sodium: 200 } },
  ],
}
