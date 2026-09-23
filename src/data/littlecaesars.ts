import { type Restaurant } from '../types'

// Approximate values from Little Caesars Canada nutrition information
// (per slice; classic round pizza cut into 8).
export const littlecaesars: Restaurant = {
  id: 'little-caesars',
  name: 'Little Caesars',
  cuisine: 'Pizza · Fast food',
  accent: '#ea580c',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [
    { id: 'lc-pep', name: 'Classic Pepperoni', kind: 'fixed', category: 'Pizza', serving: '1 slice', nutrition: { calories: 280, protein: 13, carbs: 31, fat: 11, sodium: 560 } },
    { id: 'lc-cheese', name: 'Classic Cheese', kind: 'fixed', category: 'Pizza', serving: '1 slice', tags: ['vegetarian'], nutrition: { calories: 250, protein: 12, carbs: 31, fat: 8, sodium: 460 } },
    { id: 'lc-hula', name: 'Hula Hawaiian', kind: 'fixed', category: 'Pizza', serving: '1 slice', nutrition: { calories: 260, protein: 13, carbs: 33, fat: 8, sodium: 590 } },
    { id: 'lc-deep-deep', name: 'Deep!Deep! Dish Pepperoni', kind: 'fixed', category: 'Pizza', serving: '1 square', nutrition: { calories: 360, protein: 15, carbs: 37, fat: 17, sodium: 680 } },
    { id: 'lc-crazy-bread', name: 'Crazy Bread (1 stick)', kind: 'fixed', category: 'Sides', serving: '1 stick', tags: ['vegetarian'], nutrition: { calories: 100, protein: 3, carbs: 15, fat: 3, sodium: 150 } },
    { id: 'lc-wings', name: 'Caesar Wings (BBQ, per wing)', kind: 'fixed', category: 'Chicken', serving: '1 wing', nutrition: { calories: 70, protein: 5, carbs: 3, fat: 4, sodium: 210 } },
  ],
}
