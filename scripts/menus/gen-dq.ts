// Generate Dairy Queen Canada's menu from its official nutrition page
// (raw/dq.tsv, captured from dairyqueen.com/en-ca/nutrition/food-treats — the
// site blocks scripted requests; see README.md).
// Columns: section, name, calories, fat, sodium, carbs, protein.
//
// Totals are official. DQ also lists its add-ons (mix-ins and toppings sized
// for Mini/Small vs Medium/Large Blizzards, burger toppings, sauces), which
// become add-ons with DQ's own values.
//
//   run from the repo root: gen-dq.ts
import * as fs from 'fs'
import { componentsFor } from '../../src/data/templates'
import type { FixedItem, IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { clean, idMaker, slug, tagsFor, writeMenu } from './lib'

type Row = { section: string; name: string; n: Nutrition }
const rows: Row[] = []
for (const line of fs.readFileSync('scripts/menus/raw/dq.tsv', 'utf8').replace(/\r/g, '').split('\n')) {
  if (!line) continue
  const [section, name, cal, fat, sodium, carbs, protein] = line.split('\t')
  const v = [cal, fat, sodium, carbs, protein].map(Number)
  const [c, f, na, cb, p] = v
  // Skip rows with broken source data (non-numbers, or macros far beyond the calories).
  if (v.some((x) => Number.isNaN(x)) || 4 * cb + 4 * p + 9 * f > c * 1.5 + 20) {
    console.warn(`skipping inconsistent row: ${name}`)
    continue
  }
  rows.push({
    section: clean(section),
    name: clean(name),
    n: { calories: Math.round(c), protein: Math.round(p), carbs: Math.round(cb), fat: Math.round(f), sodium: Math.round(na) },
  })
}
const addOnRow = (name: string) => {
  const r = rows.find((x) => x.section === 'MOBILE ADD ONS' && x.name === name)
  if (!r) throw new Error(`missing add-on ${name}`)
  return r.n
}
const addOn = (label: string, source: string): IngredientComponent => ({
  id: `x-${slug(label)}`,
  name: label,
  default: false,
  nutrition: addOnRow(source),
})

// --- Add-on sets ------------------------------------------------------------------------
const MIXINS = ['Brownie Pieces', 'Cheesecake Pieces', 'Choco Chunks', 'Cookie Dough Pieces', 'Fudge', 'OREO Cookie Pieces', 'Reese Peanut Butter Cup Pieces', 'SMARTIES Candies']
function blizzardExtras(size: string): IngredientComponent[] {
  const big = /medium|large/i.test(size)
  const suffix = big ? 'Medium/Large Blizzard' : 'Mini/Small Blizzard'
  return [
    ...MIXINS.map((m) => addOn(`Add ${m.toLowerCase().replace('oreo', 'OREO').replace('reese', 'Reese').replace('smarties', 'Smarties')}`, `${m} - ${suffix}`)),
    addOn('Add caramel topping', big ? 'Caramel Topping - Sundae, Shake, Moolatte, Medium/Large Blizzard' : 'Caramel Topping - Mini/Small Blizzard'),
    addOn('Add chocolate topping', big ? 'ChocolateTopping - Sundae, Shake, Medium/Large Blizzard' : 'ChocolateTopping - Mini/Small Blizzard'),
    addOn('Add peanut butter topping', big ? 'Peanut Butter Topping - Sundae, Shake, Medium/Large Blizzard' : 'Peanut Butter Topping - Mini/Small Blizzard'),
    addOn('Add strawberry topping', big ? 'Strawberry Topping - Sundae, Shake, Medium/Large Blizzard' : 'Strawberry Topping - Mini/Small Blizzard'),
  ]
}
const TOPPINGS = [
  addOn('Add caramel topping', 'Caramel Topping - Sundae, Shake, Moolatte, Medium/Large Blizzard'),
  addOn('Add chocolate topping', 'ChocolateTopping - Sundae, Shake, Medium/Large Blizzard'),
  addOn('Add hot fudge', 'Hot Fudge Topping - Sundae, Shake, MooLatte'),
  addOn('Add peanut butter topping', 'Peanut Butter Topping - Sundae, Shake, Medium/Large Blizzard'),
  addOn('Add strawberry topping', 'Strawberry Topping - Sundae, Shake, Medium/Large Blizzard'),
]
const SHAKE_EXTRAS = [...TOPPINGS, addOn('Add banana', 'Banana - Shake, Malt'), addOn('Add vanilla syrup', 'Vanilla Syrup - Shake/MooLatte')]
const MOOLATTE_EXTRAS = [TOPPINGS[0], TOPPINGS[2], addOn('Add vanilla syrup', 'Vanilla Syrup - Shake/MooLatte')]
const SUNDAE_EXTRAS = [...TOPPINGS, addOn('Add pineapple topping', 'Pineapple Topping - Sundae')]
const BURGER_EXTRAS = [
  addOn('Add bacon', 'Applewood Smoked Bacon'),
  addOn('Add jalapeño bacon', 'Jalapeno Bacon'),
  addOn('Extra burger patty', 'Burger Patty'),
  addOn('Add pepper jack slice', 'Sliced Cheese - Pepper Jack'),
  addOn('Add Swiss cheese', 'Swiss Cheese'),
  addOn('Add shredded cheese', 'Shredded Cheese'),
  addOn('Add FlameThrower sauce', 'FlameThrower Sauce'),
  addOn('Add mayo', 'Mayo'),
  addOn('Add ranch', 'Ranch'),
  addOn('Add BBQ sauce', 'BBQ Sauce'),
  addOn('Add ketchup', 'Ketchup - Better Burger'),
  addOn('Add mustard', 'Yellow Mustard'),
  addOn('Add lettuce', 'Lettuce'),
  addOn('Add diced tomato', 'Diced Tomato'),
]
const DOG_EXTRAS = [
  addOn('Add chili sauce', 'Chili Dog Sauce'),
  addOn('Add shredded cheese', 'Shredded Cheese'),
  addOn('Add bacon', 'Applewood Smoked Bacon'),
  addOn('Add ketchup', 'Ketchup - Better Burger'),
  addOn('Add mustard', 'Yellow Mustard'),
]
const DIP_EXTRAS = [addOn('Add ranch', 'Ranch'), addOn('Add BBQ sauce', 'BBQ Sauce')]
const gravy = rows.find((r) => r.name === 'Brown Gravy')!
const GRAVY: IngredientComponent = { id: 'x-gravy', name: 'Add brown gravy', default: false, nutrition: gravy.n }

// --- Products ------------------------------------------------------------------------------
interface Product {
  name: string
  category: MealCategory
  title?: string
  hint?: string
  extras?: (label: string) => IngredientComponent[]
  versions: { label: string; r: Row }[]
}
const products = new Map<string, Product>()
function add(name: string, label: string, r: Row, opts: Omit<Product, 'name' | 'versions'>) {
  const key = name.toLowerCase()
  if (!products.has(key)) products.set(key, { name, ...opts, versions: [] })
  const p = products.get(key)!
  if (!p.versions.some((v) => v.label === label)) p.versions.push({ label, r })
}

const SIZE_WORDS = /^(Kids'|Child's|Mini|Small|Regular|Medium|Large|XLarge)$/i
const sizeLabel = (s: string) => (/child/i.test(s) ? "Kids'" : s.replace(/^xlarge$/i, 'X-Large').replace(/^\w/, (c) => c.toUpperCase()))
/** "Name - Size", "Name, Size" or "Name -Size" → [name, size]. */
function splitSize(name: string): [string, string | null] {
  const m = name.match(/^(.*?)\s*(?:-|,)\s*(Kids'|Child's|Mini|Small|Regular|Medium|Large|XLarge)$/i)
  return m ? [m[1].trim(), sizeLabel(m[2])] : [name, null]
}

for (const r of rows) {
  const s = r.section
  const nm = r.name
  if (s === 'MOBILE ADD ONS') {
    if (nm === 'Chocolate Dilly Bar Store Made') add('Chocolate Dilly Bar', '1 bar', r, { category: 'Desserts' })
    continue
  }
  let [base, size] = splitSize(nm)
  let m: RegExpMatchArray | null

  if (/blizzard/i.test(base) && s !== 'DQ CAKES') { add(base, size ?? 'Regular', r, { category: 'Desserts', hint: base, extras: blizzardExtras }); continue }
  if ((m = base.match(/^(?:(Hibiscus Lemonade) DQ (Cooler|Sparkler)|DQ (Coolers?|Sparkler) (.*))$/))) {
    const flavour = m[1] ?? m[4]
    const kind = (m[2] ?? m[3]).replace(/s$/, '')
    add(`${flavour} DQ ${kind}`, size ?? 'Regular', r, { category: 'Drinks', hint: kind === 'Cooler' ? `${flavour} shake` : flavour })
    continue
  }
  if (s.startsWith('SIGNATURE STACKBURGERS')) {
    m = nm.match(/^(.*) - (Double|Triple)$/)!
    add(m[1], m[2], r, { category: 'Burgers', title: 'Patties', extras: () => BURGER_EXTRAS })
    continue
  }
  if (s === 'HOT DOGS') {
    m = nm.match(/^(.*) \((5|8):1\)$/)!
    add(m[1], m[2] === '5' ? 'Regular (⅕ lb)' : 'Smaller (⅛ lb)', r, { category: 'Sandwiches', title: 'Size', hint: `${m[1]} hot dog sandwich`, extras: () => DOG_EXTRAS })
    continue
  }
  if ((m = nm.match(/^(Sauced & Tossed Honey BBQ )?Chicken Strip Basket - (\d) (?:piece|pc)$/))) {
    add(m[1] ? 'Honey BBQ Chicken Strip Basket' : 'Chicken Strip Basket', `${m[2]} pc`, r, { category: 'Chicken', hint: 'chicken strips', extras: () => [GRAVY, ...DIP_EXTRAS] })
    continue
  }
  if ((m = nm.match(/^Chicken Strips - (\d) piece$/))) {
    add('Chicken Strips', `${m[1]} pc`, r, { category: 'Chicken', hint: 'chicken strips', extras: () => [GRAVY, ...DIP_EXTRAS] })
    continue
  }
  if (/salad/i.test(nm)) { add(nm, 'Regular', r, { category: 'Salads', extras: () => DIP_EXTRAS.slice(0, 1) }); continue }
  if (/wrap$/i.test(nm)) { add(nm, 'Regular', r, { category: 'Wraps', hint: `${nm} chicken`, extras: () => [...DIP_EXTRAS, addOn('Add shredded cheese', 'Shredded Cheese'), addOn('Add bacon', 'Applewood Smoked Bacon')] }); continue }
  if (s === 'SNACKS AND SIDES' || nm === "Fries, Child's") {
    add(base, size ?? 'Regular', r, { category: 'Sides', extras: /fries|rings|poutine/i.test(base) ? () => [GRAVY, ...DIP_EXTRAS] : undefined })
    continue
  }
  if (s === 'DRESSING, SAUCES, AND DIPS') {
    m = nm.match(/^(.*), (\d) pc$/)
    if (m) add(m[1], `With ${m[2]} pc basket`, r, { category: 'Sides', title: 'Portion' })
    else add(nm, 'Regular', r, { category: 'Sides' })
    continue
  }
  if (s === "KIDS' MEALS") {
    if (/cone/i.test(nm)) [base, size] = ['Vanilla Cone', "Kids'"]
    else if (/^milk/i.test(nm)) [base, size] = ['2% Milk', 'Small']
    if (/cone/i.test(base)) add(base, size!, r, { category: 'Desserts', extras: () => SUNDAE_EXTRAS.slice(0, 2) })
    else if (/milk/i.test(base)) add(base, size!, r, { category: 'Drinks' })
    else add(base, 'Regular', r, { category: 'Sides' })
    continue
  }
  if (s === 'SHAKES') { add(base, size!, r, { category: 'Drinks', hint: base, extras: () => SHAKE_EXTRAS }); continue }
  if (s.startsWith('MOOLATT')) { add(base, size!, r, { category: 'Drinks', hint: `${base} frappuccino`, extras: () => MOOLATTE_EXTRAS }); continue }
  if (s === 'MISTY SLUSH & SODA FLOATS') {
    if (base === 'Float') continue // the generic float is listed again by soda
    if ((m = base.match(/^Float, (.*)$/))) base = `${m[1].replace('MUG Rootbeer', 'MUG Root Beer')} Float`
    add(base, size!, r, { category: 'Drinks', hint: /float|freeze/i.test(base) ? `${base} shake` : base })
    continue
  }
  if (s === 'CURL ON TOP TREATS') { add(nm, 'Regular', r, { category: 'Desserts', hint: `${nm} sundae`, extras: () => SUNDAE_EXTRAS }); continue }
  if (s === 'SUNDAES') { add(base, size!, r, { category: 'Desserts', extras: () => SUNDAE_EXTRAS }); continue }
  if (s === 'CONES') {
    if ((m = base.match(/^Dipped Cone, Chocolate$/))) base = 'Chocolate Dipped Cone'
    add(base, size!, r, { category: 'Desserts', extras: () => SUNDAE_EXTRAS.slice(0, 2) })
    continue
  }
  if (s === 'DQ CAKES') {
    m = nm.match(/^(.*), (\d+)"$/)!
    add(m[1].replace(/^Oreo/, 'OREO'), `${m[2]}" whole cake`, r, { category: 'Desserts', title: 'Size' })
    continue
  }
  if (s === 'DQ TREATZZA PIZZA') {
    m = nm.match(/^DQ Treatzza Pizza - (.*?)\s*-\s*(Slice|Whole Pizza)$/)!
    add(`${m[1].replace(/®/g, '')} Treatzza Pizza`, m[2] === 'Slice' ? '1 slice' : 'Whole pizza', r, { category: 'Desserts', title: 'Size' })
    continue
  }
  if (s === 'NOVELTIES') {
    if ((m = nm.match(/^Dilly Bar - 6 Pack - (Manufactured|Store Made)$/))) add('Dilly Bar 6-Pack', m[1] === 'Store Made' ? 'Store-made' : 'Packaged', r, { category: 'Desserts', title: 'Options' })
    else add(nm.replace(' - 12 Pack', ' 12-Pack'), 'Regular', r, { category: 'Desserts' })
    continue
  }
  if (s === 'PREMIUM FRUIT SMOOTHIES') { add(base, size!, r, { category: 'Drinks' }); continue }
  if (s.startsWith('JULIUS')) {
    m = nm.match(/^(.*?) - (?:(Simple Syrup) - )?(Small|Medium|Large)$/)!
    add(m[1], m[2] ? `${m[3]} · Simple syrup` : m[3], r, { category: 'Drinks', title: m[2] ? 'Options' : undefined })
    continue
  }
  console.warn(`unhandled row: ${s} / ${nm}`)
}

// --- Build items -----------------------------------------------------------------------------
const ORDER = ["Kids'", 'Mini', 'Small', 'Regular', 'Medium', 'Large', 'X-Large']
const rank = (l: string) => {
  const i = ORDER.indexOf(l.split(' · ')[0])
  return i >= 0 ? i + (l.includes('·') ? 0.5 : 0) : 99
}
function breakdown(p: Product, label: string, n: Nutrition): IngredientComponent[] | undefined {
  if (!p.extras) return undefined
  const probe: FixedItem = { id: 'probe', name: p.hint ?? p.name, kind: 'fixed', category: p.category, nutrition: n }
  return [...componentsFor(probe).filter((c) => c.default !== false), ...p.extras(label)]
}

const newId = idMaker('dq')
const items: any[] = []
for (const p of products.values()) {
  const versions = [...p.versions].sort((a, b) => rank(a.label) - rank(b.label) || a.r.n.calories - b.r.n.calories)
  const def =
    versions.find((v) => v.label === 'Medium') ?? versions.find((v) => v.label.startsWith('Regular')) ?? versions.find((v) => v.label === 'Small') ?? versions[0]
  const n = def.r.n
  const tags = tagsFor(p.name, n)
  const it: any = {
    id: newId(p.name),
    name: p.name,
    kind: 'fixed',
    category: p.category,
    ...(versions.length > 1 ? {} : { serving: def.label === 'Regular' ? '1 serving' : def.label }),
    ...(tags.length ? { tags } : {}),
    nutrition: n,
  }
  if (versions.length > 1) {
    it.defaultSize = def.label
    const allSizes = versions.every((v) => SIZE_WORDS.test(v.label) || ORDER.includes(v.label))
    if (p.title && !(p.title === 'Size' && allSizes)) it.sizeTitle = p.title
    it.sizes = versions.map((v) => {
      const comps = breakdown(p, v.label, v.r.n)
      return { label: v.label, nutrition: v.r.n, ...(comps ? { components: comps } : {}) }
    })
  } else {
    const comps = breakdown(p, def.label, n)
    if (comps) it.components = comps
  }
  items.push(it)
}

writeMenu({
  file: 'dairyqueen',
  exportName: 'dairyqueen',
  meta: { id: 'dairy-queen', name: 'Dairy Queen', cuisine: 'Treats & Burgers · Fast food', accent: '#2563eb', segment: 'Fast Food' },
  items,
  order: ['Burgers', 'Chicken', 'Sandwiches', 'Wraps', 'Salads', 'Sides', 'Desserts', 'Drinks'],
  source: [
    "Dairy Queen Canada — complete menu from DQ's official nutrition page",
    '(dairyqueen.com/en-ca/nutrition/food-treats, captured in raw/dq.tsv). Totals',
    "and add-ons (Blizzard mix-ins and toppings by size, burger toppings, sauces) use",
    "DQ's own values; the default-ingredient split is apportioned by ingredient type.",
    "Generated by scripts/menus/gen-dq.ts — regenerate, don't hand-edit.",
  ],
})
