// Generate Pita Pit Canada's menu from its official nutrition & allergen guide
// (raw/pitapit.tsv, see fetch-pitapit.cjs).
//
// Pita Pit publishes every build-your-own component by portion size (Small /
// Large / XL — Large is the regular-size portion), so the builders use only
// official values. Every "Created For You" pita, salad bowl and rice bowl is
// listed with its published sizes and official add-ons.
//
//   run from the repo root: gen-pitapit.ts
import * as fs from 'fs'
import { componentsFor } from '../../src/data/templates'
import type { BuilderGroup, BuilderOption, FixedItem, IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { idMaker, slug, tagsFor, writeMenu } from './lib'

type Row = { section: string; name: string; size: string; n: Nutrition }
const raw: Row[] = []
for (const l of fs.readFileSync('scripts/menus/raw/pitapit.tsv', 'utf8').split(/\r?\n/)) {
  if (!l) continue
  const [section, name, size, cal, fat, sodium, carbs, protein] = l.split('\t')
  const n = { calories: +cal, protein: Math.round(+protein), carbs: Math.round(+carbs), fat: Math.round(+fat), sodium: +sodium }
  // The guide gives Chipotle Crunch Sauce 980 kcal / 100 g fat for every
  // portion size — a misprint (a per-100 g figure), so it is left out.
  if (/chipotle crunch/i.test(name)) continue
  if (4 * n.carbs + 4 * n.protein + 9 * n.fat > n.calories * 1.5 + 20) {
    console.warn(`skipping inconsistent row: ${name} ${size} (${cal} kcal)`)
    continue
  }
  raw.push({ section: section.replace(/\s+/g, ' '), name: fixName(name), size, n })
}
// Page breaks can leave stray rows under a name: keep the last row per size.
const rows: Row[] = []
for (const r of raw) {
  const i = rows.findIndex((x) => x.section === r.section && x.name === r.name && x.size === r.size)
  if (i >= 0) rows.splice(i, 1)
  rows.push(r)
}

function fixName(s: string): string {
  return s
    .replace(/^[CB]4U\s*-?\s*/, '')
    .replace(/^Pita Whole$/, 'Whole Wheat Pita')
    .replace(/^Pita - Free$/, 'Gluten-Free Pita')
    .replace(/^Pita White$/, 'White Pita')
    .replace(/^Bread Pita blend$/, 'Pita Blend Bread')
    .replace(/^Balsamic Free$/, 'Balsamic (gluten-free)')
    .replace(/Ceasar|Cesar/g, 'Caesar')
    .replace(/Lemon Pep /, 'Lemon Pepper ')
    .replace(/Zesty Chicken ?\/ ?bacon/i, 'Zesty Chicken & Bacon')
    .replace(/Rasberry/, 'Raspberry')
    .replace(/Pinapple/, 'Pineapple')
    .replace(/Macademia/, 'Macadamia')
    .replace(/Raison/, 'Raisin')
    .replace(/^Cookie (.*?) 2 EA.*$/, '$1 Cookies (2)')
    .replace(/\s*\(\s*\)\s*/g, ' ')
    .replace(/ 1\/2 EA$/, '')
    .replace(/\s+/g, ' ')
    .replace(/(^|\s)(\w)/g, (m) => m.toUpperCase())
    .replace(/\bAnd\b/g, '&')
    .trim()
}

const sec = (re: RegExp) => rows.filter((r) => re.test(r.section))
const byName = (rs: Row[]) => {
  const m = new Map<string, Row[]>()
  for (const r of rs) {
    if (!m.has(r.name)) m.set(r.name, [])
    m.get(r.name)!.push(r)
  }
  return m
}

// --- Builders ---------------------------------------------------------------------------------
type Portion = 'Small' | 'Large' | 'XL'
const PROTEINS = byName(sec(/PROTEINS/))
const TOPPINGS = byName(sec(/TOPPINGS/))
const SPREADS = byName(sec(/SPREADS/))
const SAUCES = byName(sec(/SAUCES/))
const BREADS = sec(/PITA BREAD/)
const RICE = byName(sec(/BUILD YOUR OWN - RICE/))

function options(group: Map<string, Row[]>, portion: Portion, recommended?: string): BuilderOption[] {
  const out: BuilderOption[] = []
  for (const [name, rs] of group) {
    // Use this portion if published, else the nearest smaller one.
    const order: Portion[] = ['Small', 'Large', 'XL']
    const want = order.slice(0, order.indexOf(portion) + 1).reverse()
    const r = want.map((p) => rs.find((x) => x.size === p)).find(Boolean)
    if (!r) continue
    out.push({ id: slug(name), name, nutrition: r.n, ...(name === recommended ? { recommended: true } : {}), ...(r.size !== portion ? { note: `${r.size.toLowerCase()} portion` } : {}) })
  }
  return out
}
function pitaBuilder(portion: Portion): BuilderGroup[] {
  const cheese = new Map([...TOPPINGS].filter(([n]) => /cheese/i.test(n)))
  const veg = new Map([...TOPPINGS].filter(([n]) => !/cheese/i.test(n)))
  const rice = RICE.get('Rice For Pitas')
  return [
    { id: 'pita', name: 'Pita', min: 1, max: 1, options: BREADS.map((b) => ({ id: slug(b.name), name: b.name, nutrition: b.n, ...(b.name === 'Whole Wheat Pita' ? { recommended: true } : {}) })) },
    { id: 'protein', name: 'Protein', min: 0, max: 2, options: options(PROTEINS, portion, 'Chicken Breast') },
    { id: 'cheese', name: 'Cheese', min: 0, max: 2, options: options(cheese, portion) },
    { id: 'toppings', name: 'Toppings', min: 0, options: [...options(veg, portion), ...options(SPREADS, portion), ...(rice ? options(new Map([['Rice', rice]]), portion) : [])] },
    { id: 'sauces', name: 'Sauces', min: 0, max: 3, options: options(SAUCES, portion, 'Tzatziki') },
  ]
}
function riceBowlBuilder(size: 'Small' | 'Large'): BuilderGroup[] {
  const cheese = new Map([...TOPPINGS].filter(([n]) => /cheese/i.test(n)))
  const veg = new Map([...TOPPINGS].filter(([n]) => !/cheese/i.test(n)))
  const rice = RICE.get('Rice For Bowls')!.find((r) => r.size === size)!
  const portion: Portion = size === 'Small' ? 'Small' : 'Large'
  return [
    { id: 'rice', name: 'Rice', min: 1, max: 1, options: [{ id: 'rice', name: `Rice (${size.toLowerCase()} bowl)`, nutrition: rice.n, recommended: true }] },
    { id: 'protein', name: 'Protein', min: 0, max: 2, options: options(PROTEINS, portion, 'Chicken Breast') },
    { id: 'cheese', name: 'Cheese', min: 0, max: 2, options: options(cheese, portion) },
    { id: 'toppings', name: 'Toppings', min: 0, options: [...options(veg, portion), ...options(SPREADS, portion)] },
    { id: 'sauces', name: 'Sauces', min: 0, max: 3, options: options(SAUCES, portion, 'Tzatziki') },
  ]
}

const items: any[] = [
  { id: 'pp-build-small', name: 'Build Your Pita (Small)', kind: 'builder', category: 'Wraps', description: 'One pita with small portions of protein, cheese, toppings and sauce — every option uses Pita Pit Canada\'s official values.', groups: pitaBuilder('Small') },
  { id: 'pp-build', name: 'Build Your Pita (Regular)', kind: 'builder', category: 'Wraps', description: 'One pita with regular portions of protein, cheese, toppings and sauce (Pita Pit\'s "Large" component portions).', groups: pitaBuilder('Large') },
  { id: 'pp-build-xl', name: 'Build Your Pita (XL)', kind: 'builder', category: 'Wraps', description: 'XL portions of every filling, from Pita Pit\'s official component values.', groups: pitaBuilder('XL') },
  { id: 'pp-build-rice', name: 'Build Your Rice Bowl', kind: 'builder', category: 'Bowls & Burritos', description: 'A large rice bowl with your choice of protein, cheese, toppings and sauce.', groups: riceBowlBuilder('Large') },
]

// --- Created For You items, snacks, sweets -----------------------------------------------------
const newId = idMaker('pp')
function addOns(portion: Portion): IngredientComponent[] {
  const pick = (g: Map<string, Row[]>, re: RegExp) =>
    options(new Map([...g].filter(([n]) => re.test(n))), portion).map((o) => ({ id: `x-${o.id}`, name: `Add ${o.name.toLowerCase()}`, default: false, nutrition: o.nutrition }))
  return [
    ...pick(TOPPINGS, /^(Cheddar|Mozzarella|Feta|Swiss) Cheese$/),
    ...pick(PROTEINS, /^(Bacon|Falafel|Chicken Breast)$/),
    ...pick(SPREADS, /hummus|avocado/i),
    ...pick(SAUCES, /^(Tzatziki|Garlic Sauce|Spicy Mayo|Ranch|Caesar|BBQ|Hot Sauce)$/),
  ]
}
function withDefaults(name: string, category: MealCategory, n: Nutrition, extras: IngredientComponent[]) {
  const probe: FixedItem = { id: 'probe', name, kind: 'fixed', category, nutrition: n }
  return [...componentsFor(probe).filter((c) => c.default !== false), ...extras]
}
const SIZE_LABEL: Record<string, string> = { Small: 'Small', Regular: 'Regular', Large: 'Large', XL: 'XL', '1 EA': '1 each' }
const PORTION_FOR: Record<string, Portion> = { Small: 'Small', Regular: 'Large', Large: 'Large', XL: 'XL' }

function pushProduct(name: string, category: MealCategory, rs: Row[], hint: string, withExtras = true) {
  const order = ['Small', 'Regular', 'Large', 'XL']
  rs = [...rs].sort((a, b) => order.indexOf(a.size) - order.indexOf(b.size))
  const versions = rs.map((r) => ({
    label: SIZE_LABEL[r.size] ?? r.size,
    n: r.n,
    comps: withExtras ? withDefaults(hint, category, r.n, addOns(PORTION_FOR[r.size] ?? 'Large')) : undefined,
  }))
  const def = versions.find((v) => v.label === 'Regular') ?? versions.find((v) => v.label === 'Large') ?? versions[0]
  const tags = tagsFor(name, def.n)
  if (/veg|falafel|halloumi(?!.*bacon)/i.test(name) && !/bacon|chicken|beef|steak/i.test(name) && !tags.includes('vegetarian')) tags.push('vegetarian')
  const it: any = { id: newId(name), name, kind: 'fixed', category, ...(tags.length ? { tags } : {}), nutrition: def.n }
  if (versions.length > 1) {
    it.defaultSize = def.label
    it.sizes = versions.map((v) => ({ label: v.label, nutrition: v.n, ...(v.comps ? { components: v.comps } : {}) }))
  } else {
    it.serving = def.label === 'Regular' ? '1 serving' : def.label
    if (def.comps) it.components = def.comps
  }
  items.push(it)
}

for (const [name, rs] of byName(sec(/CREATED FOR YOU — PITA/))) {
  const nm = / pita$/i.test(name) ? name : `${name} Pita`
  pushProduct(nm, 'Wraps', rs, `${nm} wrap`)
}
for (const [name, rs] of byName(sec(/SALAD BOWL/))) {
  const nm = /salad( bowl)?$/i.test(name) ? name.replace(/ Salad Bowl$/i, ' Salad') : `${name} Salad`
  pushProduct(nm, 'Salads', rs, `${nm}`)
}
for (const [name, rs] of byName(sec(/RICE BOWL/))) pushProduct(name, 'Bowls & Burritos', rs, `${name}`)
for (const [name, rs] of byName(sec(/SNACKS/))) pushProduct(name, 'Sides', rs, name, false)
for (const [name, rs] of byName(sec(/COOKIES/))) pushProduct(name, 'Desserts', rs, name, false)
for (const [name, rs] of byName(sec(/SMOOTHIES/))) {
  if (/whey/i.test(name)) continue // offered as an add-on below
  const whey = rows.find((r) => /Whey/i.test(r.name) && r.size === 'Small')
  const nm = `${name} Smoothie`
  const sorted = [...rs].sort((a, b) => (a.size === 'Small' ? -1 : 1) - (b.size === 'Small' ? -1 : 1))
  items.push({
    id: newId(nm),
    name: nm,
    kind: 'fixed',
    category: 'Drinks',
    nutrition: sorted[0].n,
    defaultSize: 'Small',
    sizes: sorted.map((r) => ({
      label: r.size,
      nutrition: r.n,
      components: withDefaults(`${name} smoothie`, 'Drinks', r.n, whey ? [{ id: 'x-whey', name: 'Add whey protein (scoop)', default: false, nutrition: whey.n }] : []),
    })),
  })
}
// Frozen yogurt (base + toppings) and Just Fruit frozen desserts.
{
  const base = rows.filter((r) => /Low Fat Vanilla Yogurt/i.test(r.name))
  const toppings = sec(/FROZEN YOGURT/).filter((r) => !/Yogurt/i.test(r.name))
  if (base.length) {
    items.push({
      id: newId('Frozen Yogurt'),
      name: 'Low Fat Vanilla Frozen Yogurt',
      kind: 'fixed',
      category: 'Desserts',
      nutrition: base[0].n,
      defaultSize: base[0].size,
      sizes: base.map((r) => ({
        label: r.size,
        nutrition: r.n,
        components: withDefaults('frozen yogurt', 'Desserts', r.n, toppings.map((t) => ({ id: `x-${slug(t.name)}`, name: `Add ${t.name.toLowerCase().replace('kitkat', 'KitKat')}`, default: false, nutrition: t.n }))),
      })),
    })
  }
  for (const [name, rs] of byName(sec(/JUST FRUIT/))) pushProduct(name, 'Desserts', rs, name, false)
}

writeMenu({
  file: 'pitapit',
  exportName: 'pitapit',
  meta: { id: 'pita-pit', name: 'Pita Pit', cuisine: 'Pitas · Build-your-own', accent: '#65a30d', segment: 'Build-Your-Own' },
  items,
  hasBuilder: true,
  order: ['Wraps', 'Bowls & Burritos', 'Salads', 'Sides', 'Desserts', 'Drinks'],
  source: [
    "Pita Pit Canada — complete menu from Pita Pit's official nutrition & allergen",
    'guide (August 2026, linked from pitapit.ca/nutrition; extracted by',
    'fetch-pitapit.cjs). Builders use the official per-portion component values;',
    'Created For You items use the published totals, with official add-ons.',
    "Generated by scripts/menus/gen-pitapit.ts — regenerate, don't hand-edit.",
  ],
})
