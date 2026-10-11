import { type Restaurant } from '../types'
import { buildComponents, REF } from './components'

// Approximate values from Burger King Canada nutrition information.
export const burgerking: Restaurant = {
  id: 'burger-king',
  name: 'Burger King',
  cuisine: 'Burgers · Fast food',
  accent: '#d97706',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [
    {
      id: 'bk-whopper', name: 'Whopper', kind: 'fixed', category: 'Burgers', serving: '1 burger',
      nutrition: { calories: 670, protein: 28, carbs: 51, fat: 40, sodium: 980 },
      components: [
        { id: 'bun', name: 'Sesame bun', removable: false, nutrition: { calories: 270, protein: 9, carbs: 45, fat: 5, sodium: 460 } },
        { id: 'beef', name: 'Flame-grilled beef patty', removable: false, nutrition: { calories: 240, protein: 17, carbs: 0, fat: 20, sodium: 220 } },
        { id: 'mayo', name: 'Mayo', nutrition: { calories: 110, protein: 0, carbs: 1, fat: 12, sodium: 90 } },
        { id: 'ketchup', name: 'Ketchup', nutrition: { calories: 20, protein: 0, carbs: 5, fat: 0, sodium: 130 } },
        { id: 'veg', name: 'Lettuce, tomato, onion, pickle', nutrition: { calories: 30, protein: 2, carbs: 0, fat: 3, sodium: 80 } },
      ],
    },
    {
      id: 'bk-whopper-jr', name: 'Whopper Jr.', kind: 'fixed', category: 'Burgers', serving: '1 burger',
      nutrition: { calories: 310, protein: 13, carbs: 27, fat: 18, sodium: 500 },
      components: buildComponents({ calories: 310, protein: 13, carbs: 27, fat: 18, sodium: 500 }, [
        { id: 'bun', name: 'Sesame bun', n: REF.bunPlain, removable: false },
        { id: 'beef', name: 'Flame-grilled beef patty', core: true },
        { id: 'mayo', name: 'Mayo', n: REF.mayo },
        { id: 'veg', name: 'Lettuce, tomato, onion, pickle, ketchup', n: { calories: 35, protein: 0, carbs: 6, fat: 0, sodium: 150 } },
      ]),
    },
    {
      id: 'bk-bacon-king', name: 'Bacon King', kind: 'fixed', category: 'Burgers', serving: '1 burger',
      nutrition: { calories: 1150, protein: 61, carbs: 49, fat: 79, sodium: 2150 },
      components: buildComponents({ calories: 1150, protein: 61, carbs: 49, fat: 79, sodium: 2150 }, [
        { id: 'bun', name: 'Sesame bun', n: REF.bunSesame, removable: false },
        { id: 'beef', name: 'Two beef patties', core: true },
        { id: 'cheese', name: 'Two cheese slices', n: { calories: 100, protein: 6, carbs: 2, fat: 8, sodium: 460 } },
        { id: 'bacon', name: 'Bacon (6 strips)', n: { calories: 200, protein: 14, carbs: 0, fat: 16, sodium: 560 } },
        { id: 'sauce', name: 'Mayo & ketchup', n: { calories: 120, protein: 0, carbs: 2, fat: 12, sodium: 200 } },
      ]),
    },
    {
      id: 'bk-impossible', name: 'Impossible Whopper', kind: 'fixed', category: 'Burgers', serving: '1 burger', tags: ['vegetarian'],
      nutrition: { calories: 630, protein: 25, carbs: 58, fat: 34, sodium: 1080 },
      components: buildComponents({ calories: 630, protein: 25, carbs: 58, fat: 34, sodium: 1080 }, [
        { id: 'bun', name: 'Sesame bun', n: REF.bunSesame, removable: false },
        { id: 'patty', name: 'Impossible patty', core: true },
        { id: 'mayo', name: 'Mayo', n: REF.mayo },
        { id: 'ketchup', name: 'Ketchup', n: REF.ketchup },
        { id: 'veg', name: 'Lettuce, tomato, onion, pickle', n: REF.vegBurger },
      ]),
    },
    {
      id: 'bk-chicken-royale', name: 'Chicken Royale', kind: 'fixed', category: 'Chicken', serving: '1 sandwich',
      nutrition: { calories: 640, protein: 24, carbs: 51, fat: 38, sodium: 1180 },
      components: buildComponents({ calories: 640, protein: 24, carbs: 51, fat: 38, sodium: 1180 }, [
        { id: 'bun', name: 'Long bun', n: REF.bunSesame, removable: false },
        { id: 'chicken', name: 'Crispy chicken fillet', core: true },
        { id: 'mayo', name: 'Mayo', n: REF.mayo },
        { id: 'lettuce', name: 'Lettuce', n: REF.lettuce },
      ]),
    },
    { id: 'bk-nuggets-8', name: 'Chicken Nuggets (8 pc)', kind: 'fixed', category: 'Chicken', serving: '8 pieces', nutrition: { calories: 340, protein: 17, carbs: 19, fat: 22, sodium: 640 } },
    { id: 'bk-fries-m', name: 'Medium Fries', kind: 'fixed', category: 'Sides', serving: 'medium', tags: ['vegetarian', 'vegan'], nutrition: { calories: 380, protein: 4, carbs: 53, fat: 17, sodium: 560 } },
    { id: 'bk-onion-rings', name: 'Onion Rings', kind: 'fixed', category: 'Sides', serving: 'medium', tags: ['vegetarian'], nutrition: { calories: 410, protein: 6, carbs: 50, fat: 21, sodium: 640 } },
  ],
}
