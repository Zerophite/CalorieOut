// Generate MUCHO Burrito's menu from its official calorie-calculator data
// (raw/muchoburrito.csv, see fetch-muchoburrito.cjs).
//
// The calculator lists every ingredient for each format and size (burrito
// small / regular / MUCHO / kids, bowl, salad, taco, quesadilla), so each
// becomes a builder using only official values. Sodium is derived from the
// published salt (g) × 393 mg.
//
//   run from the repo root: gen-muchoburrito.ts
import * as fs from 'fs'
import { componentsFor } from '../../src/data/templates'
import type { BuilderGroup, BuilderOption, FixedItem, MealCategory, Nutrition } from '../../src/types'
import { idMaker, slug, tagsFor, writeMenu } from './lib'

function parseCsv(text: string): string[][] {
  return text
    .trim()
    .split(/\r?\n/)
    .map((line) => {
      const out: string[] = []
      let cur = ''
      let quoted = false
      for (const ch of line) {
        if (ch === '"') quoted = !quoted
        else if (ch === ',' && !quoted) {
          out.push(cur)
          cur = ''
        } else cur += ch
      }
      out.push(cur)
      return out
    })
}

type Row = { category: string; size: string; type: string; name: string; n: Nutrition }
const rows: Row[] = parseCsv(fs.readFileSync('scripts/menus/raw/muchoburrito.csv', 'utf8'))
  .slice(1)
  .filter((r) => r[3]?.trim())
  .map(([category, size, type, name, , cal, fat, , protein, carbs, , , salt]) => ({
    category: category.trim(),
    size: size.trim(),
    type: type.trim(),
    name: cleanName(name),
    n: {
      calories: Math.round(+cal || 0),
      protein: Math.round(+protein || 0),
      carbs: Math.round(+carbs || 0),
      fat: Math.round(+fat || 0),
      sodium: Math.round((+salt || 0) * 393),
    },
  }))

/** Drop the calculator's allergen codes: "Steak (W G)" → "Steak". */
function cleanName(s: string): string {
  return s
    .replace(/\((?:[A-Z]{1,2}\s*)+\)/g, '')
    .replace(/\bRomain\b/, 'Romaine')
    .replace(/MUCHO Burrito Sauce/, 'MUCHO Sauce')
    .replace(/\s+/g, ' ')
    .replace(/\s+(\d+\s?oz)$/i, ' ($1)')
    .trim()
}

const GROUPS: { type: string; name: string; min: number; max?: number }[] = [
  { type: 'tortilla', name: 'Tortilla', min: 1, max: 1 },
  { type: 'base', name: 'Base', min: 0, max: 1 },
  { type: 'protein', name: 'Protein', min: 0, max: 2 },
  { type: 'vegetables', name: 'Fajita veggies', min: 0 },
  { type: 'beans', name: 'Beans', min: 0, max: 2 },
  { type: 'filling', name: 'Fillings', min: 0 },
  { type: 'cheese', name: 'Cheese', min: 0, max: 1 },
  { type: 'toppings', name: 'Toppings', min: 0 },
  { type: 'salsa', name: 'Salsa', min: 0 },
  { type: 'sauce', name: 'Sauces', min: 0, max: 3 },
  { type: 'addon', name: 'Add-ons', min: 0 },
]
const RECOMMENDED = new Set(['Whole Wheat Tortilla 12 inch', 'Whole Wheat Tortilla 10 inch', 'Whole Wheat Tortilla 14 inch', 'Grilled Chicken', 'Black Beans', 'Pico De Gallo', 'Cilantro Lime Rice', 'Romaine Lettuce', 'Soft Corn Taco'])

function builder(category: string, size: string): BuilderGroup[] {
  const rs = rows.filter((r) => r.category === category && r.size === size)
  const groups: BuilderGroup[] = []
  for (const g of GROUPS) {
    const opts: BuilderOption[] = []
    const seen = new Set<string>()
    for (const r of rs.filter((x) => x.type === g.type)) {
      if (seen.has(r.name)) continue
      seen.add(r.name)
      opts.push({ id: slug(r.name), name: r.name, nutrition: r.n, ...(RECOMMENDED.has(r.name) ? { recommended: true } : {}) })
    }
    if (opts.length) groups.push({ id: g.type, name: g.name, min: g.min, ...(g.max ? { max: g.max } : {}), options: opts })
  }
  return groups
}

const BUILDERS: { id: string; name: string; category: MealCategory; cat: string; size: string; description: string }[] = [
  { id: 'mb-burrito-small', name: 'Build Your Burrito (Small)', category: 'Bowls & Burritos', cat: 'burritos', size: 'small', description: '10" tortilla with small portions.' },
  { id: 'mb-burrito', name: 'Build Your Burrito (Regular)', category: 'Bowls & Burritos', cat: 'burritos', size: 'regular', description: '12" tortilla with regular portions.' },
  { id: 'mb-burrito-mucho', name: 'Build Your MUCHO Burrito', category: 'Bowls & Burritos', cat: 'burritos', size: 'MUCHO', description: '14" tortilla with MUCHO-size portions.' },
  { id: 'mb-burrito-kids', name: "Build a Kids' Burrito", category: 'Bowls & Burritos', cat: 'burritos', size: 'kids', description: "Kids' tortilla with kids' portions." },
  { id: 'mb-bowl', name: 'Build Your Bowl', category: 'Bowls & Burritos', cat: 'bowls', size: 'Bowl', description: 'Rice and / or lettuce base with your fillings.' },
  { id: 'mb-salad', name: 'Build Your Salad', category: 'Salads', cat: 'bowls', size: 'Salad', description: 'Romaine base with your fillings.' },
  { id: 'mb-taco', name: 'Build a Taco (1 taco)', category: 'Bowls & Burritos', cat: 'tacos', size: '', description: 'One soft corn taco — add up as many as you order.' },
  { id: 'mb-quesadilla', name: 'Build Your Quesadilla', category: 'Bowls & Burritos', cat: 'quesadillas', size: 'Meat', description: 'A 12" quesadilla with cheese and your fillings.' },
  { id: 'mb-quesadilla-kids', name: "Build a Kids' Quesadilla", category: 'Bowls & Burritos', cat: 'quesadillas', size: 'kids Quesadilla', description: "Kids' quesadilla with kids' portions." },
]

const items: any[] = BUILDERS.map((b) => ({
  id: b.id,
  name: b.name,
  kind: 'builder',
  category: b.category,
  description: `${b.description} Every option uses MUCHO Burrito's official calculator values.`,
  groups: builder(b.cat, b.size),
}))

// --- Fixed items: signature, sides, desserts --------------------------------------------------------
const newId = idMaker('mb')
function withDefaults(name: string, category: MealCategory, n: Nutrition) {
  const probe: FixedItem = { id: 'probe', name, kind: 'fixed', category, nutrition: n }
  return componentsFor(probe)
}
function push(name: string, category: MealCategory, versions: { label: string; n: Nutrition }[], def?: string, hint?: string) {
  const d = versions.find((v) => v.label === def) ?? versions[0]
  const tags = tagsFor(name, d.n)
  const it: any = { id: newId(name), name, kind: 'fixed', category, ...(tags.length ? { tags } : {}), nutrition: d.n }
  if (versions.length > 1) {
    it.defaultSize = d.label
    it.sizes = versions.map((v) => ({ label: v.label, nutrition: v.n, components: withDefaults(hint ?? name, category, v.n) }))
  } else {
    it.serving = d.label
  }
  items.push(it)
}

const signature = rows.filter((r) => r.type === 'Select Item')
if (signature.length) {
  const name = signature[0].name.replace(/Chilli/, 'Chili')
  push(name, 'Bowls & Burritos', signature.map((r) => ({ label: r.size.replace(' Burrito', ' burrito'), n: r.n })), 'Regular burrito', `${name} chicken burrito`)
}
const sideNames = [...new Set(rows.filter((r) => r.category === 'sides').map((r) => r.name))]
for (const name of sideNames) {
  const vs = rows.filter((r) => r.category === 'sides' && r.name === name)
  // Larger loaded-nacho sizes in the sheet repeat or shrink the regular values; keep regular only.
  const versions = vs.filter((r) => !/nachos/i.test(name) || r.size === 'Regular').map((r) => ({ label: r.size || 'Regular', n: r.n }))
  // The guide repeats the regular nachos under larger sizes; keep distinct values only.
  const seen = new Set<number>()
  push(name, 'Sides', versions.filter((v) => (seen.has(v.n.calories) ? false : (seen.add(v.n.calories), true))), 'Regular', /nachos/i.test(name) ? 'loaded nachos' : name)
}
for (const r of rows.filter((x) => x.category === 'dessert')) push(r.name, 'Desserts', [{ label: '1 serving', n: r.n }])

writeMenu({
  file: 'muchoburrito',
  exportName: 'muchoburrito',
  meta: { id: 'mucho-burrito', name: 'Mucho Burrito', cuisine: 'Mexican · Build-your-own', accent: '#c2410c', segment: 'Build-Your-Own' },
  items,
  hasBuilder: true,
  order: ['Bowls & Burritos', 'Salads', 'Sides', 'Desserts'],
  source: [
    "MUCHO Burrito — complete menu from the data behind MUCHO Burrito's official",
    'calorie calculator (muchoburrito.com/nutrition; fetched by fetch-muchoburrito.cjs).',
    'Builders use the official per-size ingredient values; sodium is the published',
    "salt × 393 mg. Generated by scripts/menus/gen-muchoburrito.ts — regenerate, don't hand-edit.",
  ],
})
