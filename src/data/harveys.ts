import { type Restaurant } from '../types'
import { buildComponents, REF } from './components'

// Approximate values from Harvey's Canada nutrition information.
export const harveys: Restaurant = {
  id: 'harveys',
  name: "Harvey's",
  cuisine: 'Burgers · Fast food',
  accent: '#dc2626',
  segment: 'Fast Food',
  items: [
    {
      id: 'hv-original', name: 'Original Hamburger', kind: 'fixed', category: 'Burgers', serving: '1 burger',
      nutrition: { calories: 360, protein: 20, carbs: 34, fat: 16, sodium: 620 },
      components: buildComponents({ calories: 360, protein: 20, carbs: 34, fat: 16, sodium: 620 }, [
        { id: 'bun', name: 'Bun', n: REF.bunMedium, removable: false },
        { id: 'beef', name: 'Beef patty', core: true },
        { id: 'toppings', name: 'Lettuce, tomato, onion, pickle', n: REF.vegBurger },
      ]),
    },
    {
      id: 'hv-cheese', name: 'Cheeseburger', kind: 'fixed', category: 'Burgers', serving: '1 burger',
      nutrition: { calories: 440, protein: 25, carbs: 35, fat: 23, sodium: 940 },
      components: [
        { id: 'bun', name: 'Bun', removable: false, nutrition: { calories: 200, protein: 7, carbs: 34, fat: 3, sodium: 420 } },
        { id: 'beef', name: 'Beef patty', removable: false, nutrition: { calories: 160, protein: 16, carbs: 0, fat: 16, sodium: 160 } },
        { id: 'cheese', name: 'Cheese', nutrition: { calories: 50, protein: 2, carbs: 1, fat: 4, sodium: 230 } },
        { id: 'toppings', name: 'Lettuce, tomato, onion, pickle', nutrition: { calories: 30, protein: 0, carbs: 0, fat: 0, sodium: 130 } },
      ],
    },
    {
      id: 'hv-angus', name: 'Angus Burger', kind: 'fixed', category: 'Burgers', serving: '1 burger',
      nutrition: { calories: 620, protein: 34, carbs: 43, fat: 34, sodium: 1150 },
      components: buildComponents({ calories: 620, protein: 34, carbs: 43, fat: 34, sodium: 1150 }, [
        { id: 'bun', name: 'Brioche bun', n: REF.bunBrioche, removable: false },
        { id: 'beef', name: 'Angus beef patty', core: true },
        { id: 'cheese', name: 'Cheese', n: REF.cheeseSlice },
        { id: 'sauce', name: 'Burger sauce', n: REF.specialSauce },
        { id: 'toppings', name: 'Lettuce, tomato, onion, pickle', n: REF.vegBurger },
      ]),
    },
    {
      id: 'hv-beyond', name: 'Beyond Meat Burger', kind: 'fixed', category: 'Burgers', serving: '1 burger', tags: ['vegetarian', 'vegan'],
      nutrition: { calories: 500, protein: 22, carbs: 44, fat: 26, sodium: 990 },
      components: buildComponents({ calories: 500, protein: 22, carbs: 44, fat: 26, sodium: 990 }, [
        { id: 'bun', name: 'Bun', n: REF.bunMedium, removable: false },
        { id: 'patty', name: 'Beyond Meat patty', core: true },
        { id: 'toppings', name: 'Lettuce, tomato, onion, pickle', n: REF.vegBurger },
      ]),
    },
    {
      id: 'hv-chicken', name: 'Grilled Chicken Sandwich', kind: 'fixed', category: 'Chicken', serving: '1 sandwich', tags: ['high-protein'],
      nutrition: { calories: 380, protein: 33, carbs: 37, fat: 11, sodium: 1010 },
      components: [
        { id: 'bun', name: 'Bun', removable: false, nutrition: { calories: 200, protein: 7, carbs: 34, fat: 3, sodium: 420 } },
        { id: 'chicken', name: 'Grilled chicken breast', removable: false, nutrition: { calories: 150, protein: 26, carbs: 1, fat: 8, sodium: 480 } },
        { id: 'toppings', name: 'Lettuce, tomato, onion, pickle', nutrition: { calories: 30, protein: 0, carbs: 2, fat: 0, sodium: 110 } },
      ],
    },
    {
      id: 'hv-hotdog', name: 'Original Hot Dog', kind: 'fixed', category: 'Sandwiches', serving: '1 hot dog',
      nutrition: { calories: 300, protein: 11, carbs: 26, fat: 17, sodium: 800 },
      components: buildComponents({ calories: 300, protein: 11, carbs: 26, fat: 17, sodium: 800 }, [
        { id: 'bun', name: 'Hot dog bun', n: REF.hotdogBun, removable: false },
        { id: 'sausage', name: 'Sausage', core: true },
        { id: 'toppings', name: 'Toppings (ketchup, mustard, relish)', n: { calories: 30, protein: 0, carbs: 6, fat: 0, sodium: 200 } },
      ]),
    },
    { id: 'hv-fries', name: 'Fries', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian', 'vegan'], nutrition: { calories: 470, protein: 6, carbs: 63, fat: 22, sodium: 560 } },
    { id: 'hv-poutine', name: 'Poutine', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 690, protein: 16, carbs: 74, fat: 37, sodium: 1560 } },
    { id: 'hv-onionrings', name: 'Onion Rings', kind: 'fixed', category: 'Sides', serving: 'regular', tags: ['vegetarian'], nutrition: { calories: 410, protein: 5, carbs: 48, fat: 22, sodium: 640 } },
  ],
}
