// Generate Little Caesars Canada's menu from its official 2026 nutritional
// guide (raw/littlecaesars.tsv, transcribed from the guide image on
// littlecaesars.ca; the downloadable PDF there is the outdated 2016 edition).
//
// Pizzas are published per whole pizza (8 slices); each pizza is offered as a
// slice or a whole pizza in every size it comes in. Toppings, stuffed crust and
// Crazy Crust are add-ons with Little Caesars' own per-size values.
//
//   run from the repo root: gen-littlecaesars.ts
import * as fs from 'fs'
import { componentsFor } from '../../src/data/templates'
import type { FixedItem, IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { idMaker, slug, tagsFor, writeMenu } from './lib'

type Row = { section: string; name: string; n: Nutrition }
const rows: Row[] = fs
  .readFileSync('scripts/menus/raw/littlecaesars.tsv', 'utf8')
  .split(/\r?\n/)
  .filter((l) => l && !l.startsWith('#'))
  .map((l) => {
    const [section, name, cal, fat, carbs, protein, sodium] = l.split('\t')
    return { section, name, n: { calories: +cal, protein: +protein, carbs: +carbs, fat: +fat, sodium: +sodium } }
  })
const bySection = (s: string) => rows.filter((r) => r.section === s)
const scale = (n: Nutrition, k: number): Nutrition => ({
  calories: Math.round(n.calories * k),
  protein: Math.round(n.protein * k),
  carbs: Math.round(n.carbs * k),
  fat: Math.round(n.fat * k),
  sodium: Math.round(n.sodium * k),
})

// --- Add-ons ------------------------------------------------------------------------------
type Size = '12' | '14' | 'detroit'
function pizzaExtras(size: Size, k: number, stuffed: boolean): IngredientComponent[] {
  const out: IngredientComponent[] = bySection(`topping ${size}`).map((t) => ({
    id: `x-${slug(t.name)}`,
    name: t.name === 'Crazy Crust' ? 'Make it Crazy Crust' : `Add ${t.name.toLowerCase().replace('italian', 'Italian')}`,
    default: false,
    nutrition: scale(t.n, k),
  }))
  if (!stuffed) {
    const sc = rows.find((r) => r.section === 'stuffed crust' && r.name === size)!
    out.push({ id: 'x-stuffed-crust', name: 'Make it stuffed crust', default: false, nutrition: scale(sc.n, k) })
  }
  return [...out, ...DIPS]
}
const sauce = rows.find((r) => r.name.startsWith('Crazy Sauce'))!
const DIPS: IngredientComponent[] = [
  { id: 'x-crazy-sauce', name: 'Crazy Sauce cup', default: false, nutrition: sauce.n },
  ...bySection('dips').map((d) => ({ id: `x-dip-${slug(d.name)}`, name: `${d.name} dip`, default: false, nutrition: d.n })),
]

function withDefaults(name: string, category: MealCategory, n: Nutrition, extras: IngredientComponent[]): IngredientComponent[] {
  const probe: FixedItem = { id: 'probe', name, kind: 'fixed', category, nutrition: n }
  return [...componentsFor(probe).filter((c) => c.default !== false), ...extras]
}

// --- Products --------------------------------------------------------------------------------
const items: any[] = []
const newId = idMaker('lc')
function push(name: string, category: MealCategory, versions: { label: string; n: Nutrition; comps?: IngredientComponent[] }[], def: string, title?: string) {
  const d = versions.find((v) => v.label === def) ?? versions[0]
  const tags = tagsFor(name, d.n)
  const it: any = { id: newId(name), name, kind: 'fixed', category, ...(tags.length ? { tags } : {}), nutrition: d.n }
  if (versions.length > 1) {
    it.defaultSize = d.label
    if (title) it.sizeTitle = title
    it.sizes = versions.map((v) => ({ label: v.label, nutrition: v.n, ...(v.comps ? { components: v.comps } : {}) }))
  } else {
    it.serving = d.label
    if (d.comps) it.components = d.comps
  }
  items.push(it)
}

// Round pizzas: classic + specialty, 12" and 14".
const SIZE_NAME: Record<string, string> = { '12': '12" medium', '14': '14" large' }
const pizzaNames = [...new Set(rows.filter((r) => /^(12|14) (classic|specialty)$/.test(r.section)).map((r) => r.name))]
for (const name of pizzaNames) {
  const versions: { label: string; n: Nutrition; comps?: IngredientComponent[] }[] = []
  for (const size of ['12', '14'] as const) {
    const r = rows.find((x) => x.section.startsWith(size) && x.name === name && /classic|specialty/.test(x.section))
    if (!r) continue
    const stuffed = /stuffed crust/i.test(name)
    for (const [k, part] of [[1 / 8, '1 slice'], [1, 'whole pizza']] as const) {
      const n = scale(r.n, k)
      versions.push({ label: `${SIZE_NAME[size]} · ${part}`, n, comps: withDefaults(`${name} pizza`, 'Pizza', n, pizzaExtras(size, k, stuffed)) })
    }
  }
  const title = /pizza$/i.test(name) ? name : `${name} Pizza`
  const def = versions.some((v) => v.label.startsWith('14')) ? '14" large · 1 slice' : '12" medium · 1 slice'
  push(title, 'Pizza', versions, def, 'Size & portion')
}

// Detroit-style deep dish.
for (const r of bySection('detroit')) {
  const versions = ([[1 / 8, '1 slice'], [1, 'whole pizza']] as const).map(([k, part]) => {
    const n = scale(r.n, k)
    return { label: part, n, comps: withDefaults(`${r.name} deep dish pizza`, 'Pizza', n, pizzaExtras('detroit', k, false)) }
  })
  push(`Detroit-Style Deep Dish ${r.name} Pizza`, 'Pizza', versions, '1 slice', 'Portion')
}

// Crazy Puffs, sides, wings, dips.
for (const r of bySection('crazy puffs'))
  push(`${r.name} Crazy Puffs`, 'Sides', [{ label: '4 puffs', n: r.n, comps: withDefaults(`${r.name} pizza puffs`, 'Pizza', r.n, DIPS) }], '4 puffs')
for (const r of bySection('sides')) {
  const m = r.name.match(/^(.*?) \((.*)\)$/)
  const [name, serving] = m ? [m[1], m[2]] : [r.name, '1 order']
  const sweet = /cinnamon|cookie/i.test(name)
  push(name, sweet ? 'Desserts' : 'Sides', [{ label: serving, n: r.n, comps: /bread|combo/i.test(name) ? withDefaults(name, 'Sides', r.n, DIPS) : undefined }], serving)
}
push(
  'Caesar Wings',
  'Chicken',
  bySection('wings').map((r) => ({ label: r.name, n: r.n, comps: withDefaults(`${r.name} chicken wings`, 'Chicken', r.n, DIPS.slice(1)) })),
  'Oven Roasted',
  'Flavour',
)
for (const r of bySection('dips')) push(`${r.name} Dip`, 'Sides', [{ label: '1 container', n: r.n }], '1 container')

writeMenu({
  file: 'littlecaesars',
  exportName: 'littlecaesars',
  meta: { id: 'little-caesars', name: 'Little Caesars', cuisine: 'Pizza · Fast food', accent: '#ea580c', segment: 'Fast Food' },
  items,
  order: ['Pizza', 'Chicken', 'Sides', 'Desserts'],
  source: [
    "Little Caesars Canada — complete menu from the official 2026 nutritional guide",
    '(littlecaesars.ca/en-ca/menu/nutrition, transcribed in raw/littlecaesars.tsv).',
    'Whole-pizza values are official; a slice is one eighth. Toppings, stuffed crust,',
    "Crazy Crust and dips are add-ons with Little Caesars' own per-size values.",
    "Generated by scripts/menus/gen-littlecaesars.ts — regenerate, don't hand-edit.",
  ],
})
