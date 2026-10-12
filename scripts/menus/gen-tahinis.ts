// Generate Tahini's menu from its official nutritional values table
// (raw/tahinis.tsv, transcribed from the table image in Tahini's August 2026
// allergen & nutrition chart).
//
// Wraps come Regular / Extreme. Sauces, toppings and extra portions are
// listed separately by Tahini's, so they become add-ons with official values.
//
//   run from the repo root: gen-tahinis.ts
import * as fs from 'fs'
import { componentsFor } from '../../src/data/templates'
import type { FixedItem, IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { idMaker, slug, tagsFor, writeMenu } from './lib'

type Row = { kind: string; name: string; n: Nutrition }
const rows: Row[] = fs
  .readFileSync('scripts/menus/raw/tahinis.tsv', 'utf8')
  .split(/\r?\n/)
  .filter((l) => l && !l.startsWith('#'))
  .map((l) => {
    const [kind, name, , cal, fat, carbs, protein, sodium] = l.split('\t')
    return { kind, name, n: { calories: +cal, protein: +protein, carbs: +carbs, fat: +fat, sodium: +sodium } }
  })
const part = (name: string) => rows.find((r) => r.kind === 'part' && r.name === name)!.n

const addOn = (label: string, source: string): IngredientComponent => ({ id: `x-${slug(label)}`, name: label, default: false, nutrition: part(source) })
const SAUCES = [
  addOn('Extra garlic sauce', 'Garlic Sauce'),
  addOn('Add tzatziki', 'Tzatziki Sauce'),
  addOn('Add hummus', 'Hummus'),
  addOn('Add spicy garlic sauce', 'Spicy Garlic Sauce'),
  addOn('Add tahini sauce', 'Tahini Sauce'),
  addOn('Add habanero sauce (medium)', 'Habanero Sauce (Medium)'),
  addOn('Add habanero sauce (hot)', 'Habanero Sauce (Hot)'),
  addOn('Add pomegranate molasses', 'Pomegranate Molasses'),
]
const TOPPINGS = [
  addOn('Add feta cheese', 'Feta Cheese'),
  addOn('Add fried onions', 'Fried Onions'),
  addOn('Add pita chips', 'Pita Chips'),
  addOn('Add mixed cabbage', 'Mixed Cabbage'),
  addOn('Add pineapples', 'Pineapples'),
]
const MEAT = [addOn('Extra chicken shawarma', 'Chicken Shawarma (Meat Only - Regular)'), addOn('Add a falafel piece', 'Falafel Piece')]
const FRIES_EXTRAS = [addOn('Add gravy (1 scoop)', 'Gravy (158g) - 1 Scoop'), addOn('Add messy sauce', 'Messy Sauce (30g)'), addOn('Add garlic sauce (50 g)', 'Garlic Sauce (50g)')]

function category(name: string): MealCategory {
  if (/ramen/i.test(name)) return 'Mains'
  if (/wrap|arabian bites/i.test(name)) return 'Wraps'
  if (/bowl/i.test(name)) return 'Bowls & Burritos'
  if (/salad/i.test(name)) return 'Salads'
  if (/tray|family/i.test(name)) return 'Mains'
  if (/churro/i.test(name)) return 'Desserts'
  if (/tenders/i.test(name)) return 'Chicken'
  return 'Sides'
}
function extrasFor(name: string): IngredientComponent[] {
  if (/fries|poutine/i.test(name)) return FRIES_EXTRAS.concat(SAUCES.slice(0, 2))
  if (/wrap|bowl|bites|tray|special/i.test(name)) return [...MEAT, ...SAUCES, ...TOPPINGS]
  if (/salad/i.test(name)) return [...MEAT, ...SAUCES.slice(0, 4), addOn('Add Italian dressing', 'Italian Dressing (30g)')]
  if (/falafel|samosa|tenders/i.test(name)) return SAUCES.slice(0, 5)
  return []
}

const products = new Map<string, { name: string; versions: { label: string; n: Nutrition }[] }>()
for (const r of rows.filter((x) => x.kind === 'item')) {
  let name = r.name.replace(/ \(LTO\)$/, '')
  let label = '1 serving'
  let m: RegExpMatchArray | null
  if ((m = name.match(/^(.*) \((Regular|Extreme|Large)\)$/))) [name, label] = [m[1], m[2]]
  if ((m = name.match(/^Chicken Shawarma Wrap - (.*)$/))) name = `Chicken Shawarma Wrap (${m[1]})`
  if ((m = name.match(/^(Half Dozen|Dozen) Falafels \((\d+) pcs\)$/))) [name, label] = ['Falafels', `${m[2]} pcs`]
  if ((m = name.match(/^Falafel Pieces \((\d) pcs\)$/))) [name, label] = ['Falafels', `${m[1]} pcs`]
  if (!products.has(name)) products.set(name, { name, versions: [] })
  products.get(name)!.versions.push({ label, n: r.n })
}

const newId = idMaker('ta')
const items: any[] = []
for (const p of products.values()) {
  const cat = category(p.name)
  const versions = [...p.versions].sort((a, b) => a.n.calories - b.n.calories)
  const def = versions.find((v) => v.label === 'Regular') ?? versions[0]
  const comps = (n: Nutrition) => {
    const extras = extrasFor(p.name)
    if (!extras.length) return undefined
    const probe: FixedItem = { id: 'probe', name: p.name, kind: 'fixed', category: cat, nutrition: n }
    return [...componentsFor(probe).filter((c) => c.default !== false), ...extras]
  }
  const tags = tagsFor(p.name, def.n)
  if (/falafel|veggie|halloumi|classic poutine/i.test(p.name) && !tags.includes('vegetarian')) tags.push('vegetarian')
  const it: any = { id: newId(p.name), name: p.name, kind: 'fixed', category: cat, ...(tags.length ? { tags } : {}), nutrition: def.n }
  if (versions.length > 1) {
    it.defaultSize = def.label
    it.sizes = versions.map((v) => {
      const c = comps(v.n)
      return { label: v.label, nutrition: v.n, ...(c ? { components: c } : {}) }
    })
  } else {
    it.serving = def.label
    const c = comps(def.n)
    if (c) it.components = c
  }
  items.push(it)
}

writeMenu({
  file: 'tahinis',
  exportName: 'tahinis',
  meta: { id: 'tahinis', name: "Tahini's", cuisine: 'Middle Eastern · Shawarma', accent: '#0f766e', segment: 'Fast Food' },
  items,
  order: ['Wraps', 'Bowls & Burritos', 'Mains', 'Salads', 'Chicken', 'Sides', 'Desserts'],
  source: [
    "Tahini's — complete menu from Tahini's official nutritional values table (August",
    "2026 allergen & nutrition chart on tahinis.com, transcribed in raw/tahinis.tsv).",
    "Sauces, toppings and extra portions are add-ons with Tahini's own values.",
    "Generated by scripts/menus/gen-tahinis.ts — regenerate, don't hand-edit.",
  ],
})
