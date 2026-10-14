// Generate Five Guys' menu from its official Canadian ingredient & allergen
// guide (raw/fiveguys.tsv, parsed from the English PDF on fiveguys.ca).
//
// Five Guys publishes values per part — patty, bun, cheese slice, bacon, each
// free topping, fry sizes, shake base and mix-ins — and every item is built
// from those parts: a Hamburger is a bun and two patties, a "Little" one patty.
// So each item's total is the sum of its official parts, and every topping is
// an add-on with its own official values.
//
//   run from the repo root: gen-fiveguys.ts
import * as fs from 'fs'
import type { IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { idMaker, slug, tagsFor, writeMenu } from './lib'

const parts = new Map<string, Nutrition>()
for (const l of fs.readFileSync('scripts/menus/raw/fiveguys.tsv', 'utf8').replace(/\r/g, '').split('\n')) {
  if (!l || l.startsWith('#')) continue
  const [, name, , cal, fat, na, carbs, protein] = l.split('\t')
  parts.set(name, { calories: +cal, protein: +protein, carbs: +carbs, fat: +fat, sodium: +na })
}
const part = (name: string): Nutrition => {
  const n = parts.get(name)
  if (!n) throw new Error(`missing part ${name}`)
  return n
}
const times = (n: Nutrition, k: number): Nutrition => ({ calories: n.calories * k, protein: n.protein * k, carbs: n.carbs * k, fat: n.fat * k, sodium: n.sodium * k })
const round = (n: Nutrition): Nutrition => ({ calories: Math.round(n.calories), protein: Math.round(n.protein), carbs: Math.round(n.carbs), fat: Math.round(n.fat), sodium: Math.round(n.sodium) })
const sum = (ns: Nutrition[]): Nutrition =>
  round(ns.reduce((a, b) => ({ calories: a.calories + b.calories, protein: a.protein + b.protein, carbs: a.carbs + b.carbs, fat: a.fat + b.fat, sodium: a.sodium + b.sodium }), { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0 }))

type Part = { name: string; source: string; count?: number; locked?: boolean }
const comp = (p: Part, def = true): IngredientComponent => ({
  id: slug(p.name),
  name: p.count && p.count > 1 ? `${p.name} (×${p.count})` : p.name,
  ...(def ? {} : { default: false }),
  ...(p.locked ? { removable: false } : {}),
  nutrition: round(times(part(p.source), p.count ?? 1)),
})

// Every burger, dog and sandwich can take any of the free toppings.
const TOPPINGS: Part[] = [
  ['Lettuce', 'Lettuce'], ['Tomatoes', 'Tomatoes'], ['Pickles', 'Pickles'], ['Onions (raw or grilled)', 'Onions / Grilled Onions'],
  ['Grilled mushrooms', 'Grilled Mushrooms'], ['Green peppers', 'Green Peppers'], ['Jalapeño peppers', 'Jalapeno Peppers'],
  ['Ketchup', 'Ketchup'], ['Mustard', 'Mustard'], ['Mayonnaise', 'Mayonnaise'], ['Relish', 'Relish'], ['BBQ sauce', 'BBQ Sauce'],
  ['HP sauce', 'HP Sauce'], ['Hot sauce', 'Hot Sauce'],
].map(([name, source]) => ({ name, source }))
const EXTRAS = (has: { cheese: boolean; bacon: boolean }) => [
  ...TOPPINGS.map((t) => comp(t, false)),
  comp({ name: has.cheese ? 'Extra cheese slice' : 'Add cheese slice', source: 'Cheese (1 slice)' }, false),
  ...(has.bacon ? [] : [comp({ name: 'Add bacon', source: 'Bacon (2 pieces)' }, false)]),
]

interface Product { name: string; category: MealCategory; base: Part[]; toppings?: Part[]; extras?: IngredientComponent[]; serving?: string }
const BUN: Part = { name: 'Bun', source: 'Bun', locked: true }
const patties = (k: number): Part => ({ name: 'Hamburger patty', source: 'Hamburger Patty', count: k })
const cheese = (k: number): Part => ({ name: 'Cheese slice', source: 'Cheese (1 slice)', count: k })
const bacon: Part = { name: 'Bacon', source: 'Bacon (2 pieces)' }

const products: Product[] = []
for (const little of [false, true]) {
  const k = little ? 1 : 2
  for (const [label, hasCheese, hasBacon] of [['Hamburger', false, false], ['Cheeseburger', true, false], ['Bacon Burger', false, true], ['Bacon Cheeseburger', true, true]] as const) {
    products.push({
      name: `${little ? 'Little ' : ''}${label}`,
      category: 'Burgers',
      serving: little ? '1 patty' : '2 patties',
      base: [BUN, patties(k), ...(hasCheese ? [cheese(k)] : []), ...(hasBacon ? [bacon] : [])],
      extras: EXTRAS({ cheese: hasCheese, bacon: hasBacon }),
    })
  }
}
const DOG: Part = { name: 'Hot dog', source: 'Hot Dog' }
for (const [label, hasCheese, hasBacon] of [['Hot Dog', false, false], ['Cheese Dog', true, false], ['Bacon Dog', false, true], ['Bacon Cheese Dog', true, true]] as const) {
  products.push({ name: label, category: 'Sandwiches', base: [BUN, DOG, ...(hasCheese ? [cheese(1)] : []), ...(hasBacon ? [bacon] : [])], extras: EXTRAS({ cheese: hasCheese, bacon: hasBacon }) })
}
const VEG: Part[] = [
  { name: 'Grilled onions', source: 'Onions / Grilled Onions' }, { name: 'Grilled mushrooms', source: 'Grilled Mushrooms' },
  { name: 'Green peppers', source: 'Green Peppers' }, { name: 'Lettuce', source: 'Lettuce' }, { name: 'Tomatoes', source: 'Tomatoes' },
]
products.push(
  { name: 'Grilled Cheese', category: 'Sandwiches', base: [BUN, cheese(2)], extras: EXTRAS({ cheese: true, bacon: false }) },
  { name: 'Veggie Sandwich', category: 'Sandwiches', base: [BUN, ...VEG], extras: EXTRAS({ cheese: false, bacon: false }) },
  { name: 'Cheese Veggie Sandwich', category: 'Sandwiches', base: [BUN, cheese(2), ...VEG], extras: EXTRAS({ cheese: true, bacon: false }) },
  { name: 'BLT', category: 'Sandwiches', base: [BUN, { ...bacon, count: 3 }, { name: 'Lettuce', source: 'Lettuce' }, { name: 'Tomatoes', source: 'Tomatoes' }, { name: 'Mayonnaise', source: 'Mayonnaise' }], extras: EXTRAS({ cheese: false, bacon: true }) },
)

// Fries come Little / Regular / Large, Five Guys or Cajun style; poutine adds gravy and curds.
const sized: { name: string; category: MealCategory; sizes: { label: string; base: Part[] }[]; extras?: IngredientComponent[] }[] = []
for (const style of ['Five Guys Style', 'Cajun Style']) {
  sized.push({
    name: `${style === 'Cajun Style' ? 'Cajun ' : ''}Fries`,
    category: 'Sides',
    sizes: ['Little', 'Regular', 'Large'].map((s) => ({ label: s, base: [{ name: 'Fries', source: `${s} ${style}` }] })),
    extras: [comp({ name: 'Malt vinegar', source: 'Malt Vinegar (1tbs)' }, false), comp({ name: 'Ketchup', source: 'Ketchup' }, false)],
  })
}
sized.push({
  name: 'Poutine',
  category: 'Sides',
  sizes: ['Little', 'Regular', 'Large'].map((s) => ({ label: s, base: [{ name: 'Fries', source: `${s} Five Guys Style` }, { name: 'Poutine gravy', source: 'Poutine Gravy' }, { name: 'Cheese curds', source: 'Cheese Curd' }] })),
})

// Milkshakes: the vanilla base and whipped cream, plus a mix-in; any mix-in can be added.
const MIX = ['Banana', 'Candy Cane Crunch', 'Chocolate', 'Oreo Cookie Pieces', 'Peanut Butter', 'Strawberry']
const mixIn = (m: string): Part => ({ name: m === 'Oreo Cookie Pieces' ? 'Oreo cookie pieces' : m, source: m })
const SHAKE: Part[] = [{ name: 'Vanilla shake base', source: 'Vanilla Shake Base' }, { name: 'Whipped cream', source: 'Whipped Cream' }]
const shakeExtras = (except?: string) => [
  ...MIX.filter((m) => m !== except).map((m) => comp({ name: `Add ${mixIn(m).name.toLowerCase()}`, source: m }, false)),
  comp({ name: 'Add bacon', source: 'Bacon' }, false),
]
products.push({ name: 'Vanilla Milkshake', category: 'Desserts', base: SHAKE, extras: shakeExtras() })
for (const m of MIX) products.push({ name: `${m === 'Oreo Cookie Pieces' ? 'Oreo' : m} Milkshake`, category: 'Desserts', base: [...SHAKE, mixIn(m)], extras: shakeExtras(m) })
products.push({ name: 'Bulk Peanuts', category: 'Sides', serving: '1 oz', base: [{ name: 'Peanuts', source: 'Bulk Peanuts (1oz.)' }] })

const newId = idMaker('fg')
const items: any[] = []
for (const p of products) {
  const base = p.base.map((b) => comp(b))
  const nutrition = sum(base.map((c) => c.nutrition))
  const tags = tagsFor(p.name, nutrition)
  if (/veggie|grilled cheese|milkshake|fries|peanuts/i.test(p.name) && !tags.includes('vegetarian')) tags.push('vegetarian')
  items.push({ id: newId(p.name), name: p.name, kind: 'fixed', category: p.category, ...(tags.length ? { tags } : {}), nutrition, serving: p.serving ?? '1 serving', components: [...base, ...(p.extras ?? [])] })
}
for (const p of sized) {
  const sizes = p.sizes.map((s) => {
    const base = s.base.map((b) => comp(b))
    return { label: s.label, nutrition: sum(base.map((c) => c.nutrition)), components: [...base, ...(p.extras ?? [])] }
  })
  const def = sizes.find((s) => s.label === 'Regular')!
  const tags = tagsFor(p.name, def.nutrition)
  if (!/poutine/i.test(p.name)) tags.push('vegetarian')
  items.push({ id: newId(p.name), name: p.name, kind: 'fixed', category: p.category, ...(tags.length ? { tags } : {}), nutrition: def.nutrition, defaultSize: 'Regular', sizes })
}

writeMenu({
  file: 'fiveguys',
  exportName: 'fiveguys',
  meta: { id: 'five-guys', name: 'Five Guys', cuisine: 'Burgers & fries · Fast food', accent: '#dc2626', segment: 'Fast Food' },
  items,
  order: ['Burgers', 'Sandwiches', 'Sides', 'Desserts'],
  source: [
    "Five Guys Canada — every item built from Five Guys' official per-part values (Canadian",
    'ingredient & allergen guide, English PDF on fiveguys.ca; parsed into raw/fiveguys.tsv).',
    'Burgers are a bun and two patties ("Little": one); every free topping is an add-on.',
    "Generated by scripts/menus/gen-fiveguys.ts — regenerate, don't hand-edit.",
  ],
})
