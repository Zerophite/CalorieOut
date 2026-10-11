import { type Restaurant } from '../types'
import { buildComponents, REF } from './components'

// Approximate values from A&W Canada nutrition information.
export const aw: Restaurant = {
  id: 'aw',
  name: 'A&W',
  cuisine: 'Burgers · Fast food',
  accent: '#f97316',
  segment: 'Fast Food',
  items: [
    {
      id: 'aw-mama', name: 'Mama Burger', kind: 'fixed', category: 'Burgers', serving: '1 burger',
      nutrition: { calories: 470, protein: 24, carbs: 38, fat: 25, sodium: 780 },
      components: buildComponents({ calories: 470, protein: 24, carbs: 38, fat: 25, sodium: 780 }, [
        { id: 'bun', name: 'Bun', n: REF.bunMedium, removable: false },
        { id: 'beef', name: 'Beef patty', core: true },
        { id: 'sauce', name: 'Mama sauce', n: REF.specialSauce },
        { id: 'veg', name: 'Lettuce, tomato, onion, pickle', n: REF.vegBurger },
      ]),
    },
    {
      id: 'aw-teen', name: 'Teen Burger', kind: 'fixed', category: 'Burgers', serving: '1 burger',
      nutrition: { calories: 640, protein: 30, carbs: 41, fat: 39, sodium: 1140 },
      components: [
        { id: 'bun', name: 'Bun', removable: false, nutrition: { calories: 230, protein: 8, carbs: 40, fat: 4, sodium: 450 } },
        { id: 'beef', name: 'Beef patty', removable: false, nutrition: { calories: 230, protein: 15, carbs: 0, fat: 16, sodium: 250 } },
        { id: 'bacon', name: 'Bacon', nutrition: { calories: 70, protein: 5, carbs: 0, fat: 6, sodium: 200 } },
        { id: 'cheese', name: 'Cheese', nutrition: { calories: 50, protein: 2, carbs: 1, fat: 4, sodium: 230 } },
        { id: 'sauce', name: 'Teen sauce', nutrition: { calories: 60, protein: 0, carbs: 0, fat: 9, sodium: 10 } },
      ],
    },
    {
      id: 'aw-papa', name: 'Papa Burger', kind: 'fixed', category: 'Burgers', serving: '1 burger',
      nutrition: { calories: 790, protein: 45, carbs: 42, fat: 48, sodium: 1420 },
      components: buildComponents({ calories: 790, protein: 45, carbs: 42, fat: 48, sodium: 1420 }, [
        { id: 'bun', name: 'Sesame bun', n: REF.bunSesame, removable: false },
        { id: 'beef', name: 'Two beef patties', core: true },
        { id: 'cheese', name: 'Cheese', n: REF.cheeseSlice },
        { id: 'sauce', name: 'Papa sauce', n: REF.specialSauce },
        { id: 'veg', name: 'Lettuce, tomato, onion, pickle', n: REF.vegBurger },
      ]),
    },
    {
      id: 'aw-beyond', name: 'Beyond Meat Burger', kind: 'fixed', category: 'Burgers', serving: '1 burger', tags: ['vegetarian', 'vegan'],
      nutrition: { calories: 460, protein: 23, carbs: 43, fat: 22, sodium: 940 },
      components: buildComponents({ calories: 460, protein: 23, carbs: 43, fat: 22, sodium: 940 }, [
        { id: 'bun', name: 'Bun', n: REF.bunMedium, removable: false },
        { id: 'patty', name: 'Beyond Meat patty', core: true },
        { id: 'sauce', name: 'Uncle sauce', n: REF.specialSauce },
        { id: 'veg', name: 'Lettuce, tomato, onion, pickle', n: REF.vegBurger },
      ]),
    },
    {
      id: 'aw-chub', name: 'Chubby Chicken Burger', kind: 'fixed', category: 'Chicken', serving: '1 sandwich',
      nutrition: { calories: 570, protein: 26, carbs: 49, fat: 30, sodium: 1080 },
      components: buildComponents({ calories: 570, protein: 26, carbs: 49, fat: 30, sodium: 1080 }, [
        { id: 'bun', name: 'Bun', n: REF.bunMedium, removable: false },
        { id: 'chicken', name: 'Crispy chicken fillet', core: true },
        { id: 'mayo', name: 'Mayo', n: REF.mayo },
        { id: 'lettuce', name: 'Lettuce', n: REF.lettuce },
      ]),
    },
    { id: 'aw-onion', name: 'Onion Rings', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 470, protein: 6, carbs: 56, fat: 25, sodium: 720 } },
    { id: 'aw-fries', name: 'Fries', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian', 'vegan'], nutrition: { calories: 340, protein: 4, carbs: 46, fat: 16, sodium: 380 } },
    { id: 'aw-rootbeer', name: 'Root Beer', kind: 'fixed', category: 'Drinks', serving: 'medium', tags: ['vegetarian'], nutrition: { calories: 280, protein: 0, carbs: 74, fat: 0, sodium: 45, sugar: 73 } },
    {
      id: 'aw-breakfast', name: 'Bacon & Egger', kind: 'fixed', category: 'Breakfast', serving: '1 sandwich',
      nutrition: { calories: 480, protein: 20, carbs: 34, fat: 29, sodium: 980 },
      components: buildComponents({ calories: 480, protein: 20, carbs: 34, fat: 29, sodium: 980 }, [
        { id: 'bun', name: 'English muffin', n: REF.englishMuffin, removable: false },
        { id: 'egg', name: 'Egg', core: true },
        { id: 'bacon', name: 'Bacon', n: REF.bacon2 },
        { id: 'cheese', name: 'Cheese', n: REF.cheeseSlice },
      ]),
    },
  ],
}
