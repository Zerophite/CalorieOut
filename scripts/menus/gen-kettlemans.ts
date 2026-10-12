// Generate Kettlemans Bagel's menu from the Nutrition Facts on its menu pages
// (raw/kettlemans.json, see fetch-kettlemans.cjs).
//
// Bagels come each, by the half-dozen and the dozen, with Kettlemans' spreads
// (official values) as add-ons. Several menu pages repeat the pretzel's label
// (313 kcal) on unrelated items, and some items carry no label; those items are
// built from official parts where possible (e.g. plain bagel + cream cheese) or
// estimated from a typical recipe, and say so in their description.
//
//   run from the repo root: gen-kettlemans.ts
import * as fs from 'fs'
import { componentsFor } from '../../src/data/templates'
import type { FixedItem, IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { ARCHETYPES, scaled } from './estimate'
import { idMaker, slug, tagsFor, writeMenu } from './lib'

type Raw = { category: string; name: string; description: string; serving: string; n: (Nutrition & { fiber?: number }) | null }
const raw: Raw[] = JSON.parse(fs.readFileSync('scripts/menus/raw/kettlemans.json', 'utf8'))

const round = (n: Raw['n']): Nutrition => {
  const out: Nutrition = { calories: Math.round(n!.calories), protein: Math.round(n!.protein), carbs: Math.round(n!.carbs), fat: Math.round(n!.fat), sodium: Math.round(n!.sodium) }
  if (n!.fiber) out.fiber = Math.round(n!.fiber)
  return out
}
const add = (...ns: Nutrition[]): Nutrition => ns.reduce((a, b) => ({ calories: a.calories + b.calories, protein: a.protein + b.protein, carbs: a.carbs + b.carbs, fat: a.fat + b.fat, sodium: a.sodium + b.sodium }))
const times = (n: Nutrition, k: number): Nutrition => ({ calories: Math.round(n.calories * k), protein: Math.round(n.protein * k), carbs: Math.round(n.carbs * k), fat: Math.round(n.fat * k), sodium: Math.round(n.sodium * k) })

const pretzel = raw.find((r) => /Pretzel/.test(r.name))?.n
const isCopy = (r: Raw) => !!(r.n && pretzel && !/Pretzel/.test(r.name) && r.n.calories === pretzel.calories && r.n.protein === pretzel.protein)
const official = (name: string) => {
  const r = raw.find((x) => x.name === name && x.n && !isCopy(x))
  return r ? round(r.n) : null
}
const PLAIN = official('Plain')!
const CREAM = official('Deli Cream Cheese')!
const est = (key: string, k = 1) => scaled(ARCHETYPES[key], k)
const BUTTER: Nutrition = { calories: 70, protein: 0, carbs: 0, fat: 8, sodium: 60 }
const CHEESE: Nutrition = { calories: 110, protein: 7, carbs: 1, fat: 9, sodium: 180 }
const JAM: Nutrition = { calories: 50, protein: 0, carbs: 13, fat: 0, sodium: 5 }

// Items without a usable label: official parts where Kettlemans publishes them, else a typical recipe.
const FALLBACK: Record<string, () => { n: Nutrition; how: 'parts' | 'estimate' }> = {
  'Bagel with Butter': () => ({ n: add(PLAIN, BUTTER), how: 'parts' }),
  'Bagel with Cream Cheese': () => ({ n: add(PLAIN, times(CREAM, 2)), how: 'parts' }),
  'Bagel with Jam': () => ({ n: add(PLAIN, JAM), how: 'parts' }),
  'Bagel with Jam & Cream Cheese': () => ({ n: add(PLAIN, JAM, CREAM), how: 'parts' }),
  'Bagel and Cheddar': () => ({ n: add(PLAIN, CHEESE), how: 'parts' }),
  'Bagel and Swiss': () => ({ n: add(PLAIN, CHEESE), how: 'parts' }),
  'Egg & Cheese': () => ({ n: est('bagel.sandwich', 0.8), how: 'estimate' }),
  'The Melt': () => ({ n: est('bagel.sandwich', 0.85), how: 'estimate' }),
  Reuben: () => ({ n: est('deli.reuben', 0.8), how: 'estimate' }),
  'Country Vegetable Soup': () => ({ n: est('cafe.soup', 0.8), how: 'estimate' }),
  'Broccoli Cheddar Soup': () => ({ n: est('cafe.soup', 1.3), how: 'estimate' }),
  'Tater Puff Poutine': () => ({ n: est('pub.poutine', 0.9), how: 'estimate' }),
  'Tater Puffs': () => ({ n: est('pub.fries', 0.85), how: 'estimate' }),
  '3 Cheese Pizza Bagel': () => ({ n: est('pizza.slice', 1.5), how: 'estimate' }),
  'Pepperoni Pizza Bagel': () => ({ n: est('pizza.slice', 1.6), how: 'estimate' }),
  Latke: () => ({ n: est('side.garlic-potatoes', 0.8), how: 'estimate' }),
  'Bagel Dog': () => ({ n: est('bagel.sandwich', 0.85), how: 'estimate' }),
  'Chef Salad': () => ({ n: est('cafe.salad', 1.1), how: 'estimate' }),
  'Classic Caesar Salad': () => ({ n: est('pub.side-salad', 1.6), how: 'estimate' }),
  'Chocolate Twist': () => ({ n: est('pastry.danish', 1.1), how: 'estimate' }),
  'Apple fritter': () => ({ n: est('donut.specialty'), how: 'estimate' }),
  'Nanaimo Bars': () => ({ n: est('pastry.brownie', 1.1), how: 'estimate' }),
  'Apple Turnovers': () => ({ n: est('pastry.danish'), how: 'estimate' }),
  'Cinnamon Buns': () => ({ n: est('pastry.danish', 1.4), how: 'estimate' }),
}

const SPREADS: IngredientComponent[] = raw
  .filter((r) => r.category === 'spreads' && r.n && !isCopy(r))
  .map((r) => ({ id: `x-${slug(r.name)}`, name: `Add ${r.name.toLowerCase()} (2 tbsp)`, default: false, nutrition: round(r.n) }))
const CATEGORY: Record<string, MealCategory> = {
  'classic-bagels': 'Bakery', 'specialty-items': 'Bakery', spreads: 'Sides', sandwiches: 'Sandwiches', 'house-favourites': 'Breakfast',
  salads: 'Salads', 'baked-treats': 'Desserts', 'value-menu': 'Breakfast',
}

const newId = idMaker('km')
const items: any[] = []
const seen = new Set<string>()
for (const r of raw) {
  if (seen.has(r.name)) continue
  seen.add(r.name)
  let n: Nutrition
  let note: string | undefined
  if (r.n && !isCopy(r)) n = round(r.n)
  else if (FALLBACK[r.name]) {
    const f = FALLBACK[r.name]()
    n = f.n
    note = f.how === 'parts' ? "Built from Kettlemans' published values for its parts." : 'Kettlemans publishes no nutrition for this item; estimated from a typical recipe.'
  } else if (r.name === '2 Knishes' && r.n) n = times(round(r.n), 2)
  else continue
  let category = CATEGORY[r.category]
  if (/soup/i.test(r.name)) category = 'Mains'
  if (/poutine|tater puffs|latke/i.test(r.name)) category = 'Sides'
  if (/pizza bagel/i.test(r.name)) category = 'Pizza'
  const bagel = r.category === 'classic-bagels' || /^Bagel (with|and)|Mini Bagel/.test(r.name)
  const name = r.category === 'classic-bagels' && !/bagel/i.test(r.name) ? `${r.name} Bagel` : r.name.replace(/^Apple fritter$/, 'Apple Fritter').replace(/^Non-Dairy$/, 'Non-Dairy Spread').replace(/^Lox$/, 'Lox Spread')
  const probe: FixedItem = { id: 'probe', name: bagel ? `${name} bagel` : name, kind: 'fixed', category, nutrition: n }
  const comps = (nn: Nutrition) => {
    const c = componentsFor({ ...probe, nutrition: nn })
    return bagel ? [...c.filter((x) => x.default !== false), ...SPREADS] : c
  }
  const tags = tagsFor(name, n)
  if (/vegetarian|cheese|bagel$|cream cheese|butter|jam|tater|latke|soup|treat|fritter|nanaimo|turnover|cinnamon|twist|pretzel/i.test(name) && !/ham|bacon|turkey|beef|chicken|smoked meat|pepperoni|dog|lox|tuna/i.test(name) && !tags.includes('vegetarian')) tags.push('vegetarian')
  const it: any = { id: newId(name), name, kind: 'fixed', category, ...(r.description || note ? { description: [r.description, note].filter(Boolean).join(' ') } : {}), ...(tags.length ? { tags } : {}), nutrition: n }
  if (r.category === 'classic-bagels' && !/Gluten-Free/.test(r.name)) {
    it.defaultSize = 'Each'
    it.sizes = [
      { label: 'Each', nutrition: n, components: comps(n) },
      { label: 'Half-dozen', nutrition: times(n, 6), components: comps(times(n, 6)) },
      { label: 'Dozen', nutrition: times(n, 12), components: comps(times(n, 12)) },
    ]
  } else {
    it.serving = r.category === 'spreads' ? '2 tbsp (30 g)' : r.serving && !/^1$|^1\/2$/.test(r.serving) ? r.serving : '1 item'
    const c = comps(n)
    if (c.length) it.components = c
  }
  items.push(it)
}

writeMenu({
  file: 'kettlemans',
  exportName: 'kettlemans',
  meta: { id: 'kettlemans', name: "Kettleman's Bagel", cuisine: 'Montreal bagels · Café', accent: '#0f766e', segment: 'Coffee & Bakery' },
  items,
  order: ['Bakery', 'Breakfast', 'Sandwiches', 'Pizza', 'Salads', 'Mains', 'Sides', 'Desserts'],
  source: [
    "Kettleman's Bagel — menu from the Nutrition Facts on kettlemansbagels.ca/menu (fetched by",
    'fetch-kettlemans.cjs). Items without a usable label are built from official parts or',
    'estimated, and say so. Generated by scripts/menus/gen-kettlemans.ts.',
  ],
})
