// Generate Pizza Hut Canada's menu from its official nutrition guide
// (raw/pizzahut.tsv, see fetch-pizzahut.cjs).
//
// Every pizza is listed per slice for each crust and size; those become the
// item's options. Toppings are published per slice for each size, so extra
// toppings are add-ons with Pizza Hut's own values for that size. Wings are
// published per piece (and wing sauces per wing), so wing orders and sauces
// scale exactly.
//
//   run from the repo root: gen-pizzahut.ts
import * as fs from 'fs'
import { componentsFor } from '../../src/data/templates'
import type { FixedItem, IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { clean, idMaker, slug, tagsFor, writeMenu } from './lib'

type Row = { section: string; group: string; label: string; serving: string; n: Nutrition }
const rows: Row[] = fs
  .readFileSync('scripts/menus/raw/pizzahut.tsv', 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .map((l) => {
    const [section, group, label, serving, cal, fat, sodium, carbs, protein] = l.split('\t')
    return {
      section,
      group: clean(group),
      label: clean(label),
      serving,
      n: { calories: Math.round(+cal), protein: Math.round(+protein), carbs: Math.round(+carbs), fat: Math.round(+fat), sodium: Math.round(+sodium) },
    }
  })
const scale = (n: Nutrition, k: number): Nutrition => ({
  calories: Math.round(n.calories * k),
  protein: Math.round(n.protein * k),
  carbs: Math.round(n.carbs * k),
  fat: Math.round(n.fat * k),
  sodium: Math.round(n.sodium * k),
})

// --- Toppings (per slice, by size) -----------------------------------------------------------
type ToppingSize = 'PPP' | 'Small' | 'Medium' | 'Large'
const toppings = new Map<string, Partial<Record<ToppingSize, Nutrition>>>()
for (const r of rows.filter((x) => x.group === 'Toppings')) {
  const m = r.label.replace('Mediim', 'Medium').match(/^(.*) (PPP|Small|Medium|Large)$/)
  if (!m || /sauce/i.test(m[1])) continue // sauces are part of every pizza's base
  if (!toppings.has(m[1])) toppings.set(m[1], {})
  toppings.get(m[1])![m[2] as ToppingSize] = r.n
}
const toppingSizeFor = (crust: string): ToppingSize | null =>
  /^6"/.test(crust) ? 'PPP' : /^9"/.test(crust) ? 'Small' : /^12"/.test(crust) ? 'Medium' : /^14"/.test(crust) ? 'Large' : null
function toppingExtras(size: ToppingSize | null): IngredientComponent[] {
  if (!size) return []
  return [...toppings]
    .filter(([, v]) => v[size] && v[size]!.calories + v[size]!.sodium > 0)
    .map(([name, v]) => ({ id: `x-${slug(name)}`, name: `Add ${name.toLowerCase().replace(/^italian/, 'Italian')}`, default: false, nutrition: v[size]! }))
}
const dip = rows.find((r) => r.label === 'Breadstick Sauce')!
const DIP: IngredientComponent = { id: 'x-dip', name: 'Breadstick dipping sauce', default: false, nutrition: dip.n }

function withDefaults(name: string, category: MealCategory, n: Nutrition, extras: IngredientComponent[]): IngredientComponent[] | undefined {
  if (!extras.length) return undefined
  const probe: FixedItem = { id: 'probe', name, kind: 'fixed', category, nutrition: n }
  return [...componentsFor(probe).filter((c) => c.default !== false), ...extras]
}

// --- Products ------------------------------------------------------------------------------------
type Version = { label: string; n: Nutrition; comps?: IngredientComponent[] }
const items: any[] = []
const newId = idMaker('ph')
function push(name: string, category: MealCategory, versions: Version[], def?: string, title?: string) {
  const seen = new Set<string>()
  versions = versions.filter((v) => (seen.has(v.label) ? false : (seen.add(v.label), true)))
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

// Pizzas: the first block of crust/size rows for each pizza (a later block
// repeats some pizzas cut into 12 slices for the lunch buffet).
const PIZZA_SECTIONS = new Set(['MEAT', 'CHICKEN', 'VEGGIE', 'CHEESE'])
const pizzaRows = new Map<string, Row[]>()
const done = new Set<string>()
let current = ''
for (const r of rows) {
  if (!PIZZA_SECTIONS.has(r.section)) continue
  let group = r.group.replace(/^Donair Pizza's$/, 'Donair')
  if (/^(Pzones P'zone|Kids' Menu|Desserts|Beverages|Gluten Free|Kids Menu\/School Lunch Program)$/.test(r.group)) continue
  if (group !== current) {
    if (done.has(group)) { current = ''; continue }
    current = group
  }
  if (!current) continue
  if (/1\/12/.test(r.serving) && /^12"/.test(r.label)) continue // buffet cut
  // "Donair | 14" Large Pan 1 slice= 1/12 pizza": the crust slipped into the serving column.
  let label = r.label
  let serving = r.serving
  const slipped = label === 'Donair' && serving.match(/^(.*?) (1 slice=.*)$/)
  if (slipped) [label, serving] = [slipped[1], slipped[2]]
  if (!pizzaRows.has(current)) pizzaRows.set(current, [])
  pizzaRows.get(current)!.push({ ...r, label, serving })
}
for (const g of pizzaRows.keys()) done.add(g)

for (const [group, rs] of pizzaRows) {
  const name = /pizza/i.test(group) ? group : `${group} Pizza`
  const versions: Version[] = rs.map((r) => {
    const crust = r.label.replace(/ Pizza$/, '').replace(/Thin 'N Crispy/, "Thin 'N Crispy")
    const whole = /^1 pizza$|^1$/.test(r.serving.trim()) || /Personal Pan/.test(r.label)
    const portion = whole ? '1 pizza' : '1 slice'
    const ts = toppingSizeFor(crust)
    return { label: `${crust} · ${portion}`, n: r.n, comps: withDefaults(name, 'Pizza', r.n, [...toppingExtras(ts), DIP]) }
  })
  push(name, 'Pizza', versions, '14" Large Pan · 1 slice', 'Crust & size')
}

// Gluten-free pizza, P'zones, kids' pizzas.
const gf = rows.find((r) => r.group === 'Gluten Free')
if (gf) push('Gluten Free Crust Pepperoni Pizza', 'Pizza', [{ label: '1 pizza', n: gf.n, comps: withDefaults('pepperoni pizza', 'Pizza', gf.n, [...toppingExtras('PPP'), DIP]) }])
const pzones = rows.filter((r) => r.group === "Pzones P'zone")
push("P'zone", 'Pizza', pzones.map((r) => ({ label: `${r.label} · ½ calzone`, n: r.n, comps: withDefaults(`${r.label} calzone pizza`, 'Pizza', r.n, [DIP]) })), undefined, 'Filling')

// Wings: per piece → common order sizes, sauces per wing.
const sauces = rows.filter((r) => r.group === 'WingStreet Sauces')
for (const r of rows.filter((x) => /Wings$/.test(x.group) && x.section === 'WINGS')) {
  const name = r.label === 'Buffalo Wings' ? 'Oven Baked Buffalo Wings' : r.label
  const versions: Version[] = [6, 10, 14].map((count) => {
    const n = scale(r.n, count)
    const extras = sauces.map((s) => ({
      id: `x-${slug(s.label)}`,
      name: `Toss in ${s.label.replace(/ Wing Sauce$| sauce$| Sauce$/i, '').replace(/sauce$/i, '').trim()}`,
      default: false,
      nutrition: scale(s.n, count),
    }))
    return { label: `${count} pc`, n, comps: withDefaults(`${name} chicken wings`, 'Chicken', n, [...extras, DIP]) }
  })
  push(name, 'Chicken', versions, '10 pc')
}

// Everything else.
const cat = (r: Row): MealCategory => {
  const g = r.group
  const n = r.label
  if (g === 'Desserts' || /brownie|cinna|cake|strawberry sauce/i.test(n)) return 'Desserts'
  if (g === 'Salads' || /salad/i.test(n)) return 'Salads'
  if (/wrap/i.test(g + n)) return 'Wraps'
  if (g === 'Pastas' || /alfredo|spaghetti|mac n|pasta/i.test(n)) return 'Mains'
  if (/boneless bites/i.test(n)) return 'Chicken'
  if (/pan pizza|pizza/i.test(n) && g.startsWith('Kids')) return 'Pizza'
  return 'Sides'
}
const products = new Map<string, { category: MealCategory; versions: Version[]; title?: string }>()
function addVersion(name: string, category: MealCategory, v: Version, title?: string) {
  if (!products.has(name)) products.set(name, { category, versions: [], title })
  products.get(name)!.versions.push(v)
}
for (const r of rows) {
  if (!['Appetizers', 'Salads', 'WRAPS Oven Toasted Wraps', 'Pastas', "Kids' Menu", 'Desserts'].includes(r.group)) continue
  let n = r.label
  let m: RegExpMatchArray | null
  const c = cat(r)
  if (n === 'Breadstick Sauce') { addVersion('Breadstick Dipping Sauce', 'Sides', { label: '1 dip cup', n: r.n }); continue }
  if ((m = n.match(/^Poutine (Plain|Bacon|Canadian|Chicken)$/))) { addVersion('Poutine', 'Sides', { label: m[1], n: r.n, comps: withDefaults('poutine', 'Sides', r.n, [DIP]) }, 'Options'); continue }
  if ((m = n.match(/^(.*?) - \((regular|family) size\)$/))) { addVersion(m[1], 'Mains', { label: `Per serving (${m[2]} size, ${r.serving.replace(/[()]/g, '')})`, n: r.n, comps: withDefaults(m[1], 'Mains', r.n, [DIP]) }, 'Order'); continue }
  if (/^Tuscani/.test(n)) { addVersion(n, 'Mains', { label: r.serving === 'individual meal' ? 'Individual meal' : `Per serving (${r.serving})`, n: r.n, comps: withDefaults(n, 'Mains', r.n, [DIP]) }, 'Order'); continue }
  if ((m = n.match(/^(.*?) (with Dressing|w\/o Dressing|with Low Fat Raspberry Dressing)$/i))) {
    const dress = /w\/o/i.test(m[2]) ? 'no dressing' : /raspberry/i.test(m[2]) ? 'with raspberry dressing' : 'with dressing'
    addVersion(m[1], 'Salads', { label: `${r.serving.replace(/^entrée$/, 'Entrée').replace(/^side$/, 'Side')} · ${dress}`, n: r.n, comps: withDefaults(m[1], 'Salads', r.n, [DIP]) }, 'Size')
    continue
  }
  if (/w low fat raspberry Dressing|w Dressing/.test(n)) continue // kids' duplicates of the salads above
  if (n === 'KIDS MENU') continue
  n = n.replace(/ \(optional\)$/, '')
  if ((m = n.match(/^(Cheese|Pepperoni|Hawaiian)- ?6" Pan Pizza$/))) n = `Kids' ${m[1]} Pan Pizza`
  else if (r.group === "Kids' Menu" && !/garlic bread/i.test(n)) n = `Kids' ${n}`
  if (/garlic bread/i.test(n) && r.group === "Kids' Menu") continue
  addVersion(n, c, { label: r.serving, n: r.n, comps: c === 'Desserts' ? undefined : withDefaults(n, c, r.n, [DIP]) })
}
for (const [name, p] of products) push(name, p.category, p.versions, undefined, p.title)

// Drinks: "<name> <size>" where size is 355ml / 591ml / 2L.
const drinks = new Map<string, Version[]>()
for (const r of rows.filter((x) => x.group === 'Beverages')) {
  const text = `${r.label} ${r.serving}`.replace(/\s+1$/, '').replace(/\s+/g, ' ').trim()
  const m = text.match(/^(.*?)\s*(\d+ ?m[lL]|\d(?:\.\d)? ?L)$/)
  if (!m) continue
  const name = m[1].replace(/\s*10 CAL\b/i, '').trim()
  const size = m[2].replace(/ /g, '').replace(/mL$/, 'ml')
  if (!drinks.has(name)) drinks.set(name, [])
  drinks.get(name)!.push({ label: size, n: r.n })
}
for (const [name, versions] of drinks) {
  versions.sort((a, b) => parseFloat(a.label) * (/L$/.test(a.label) ? 1000 : 1) - parseFloat(b.label) * (/L$/.test(b.label) ? 1000 : 1))
  push(name, 'Drinks', versions, versions.find((v) => v.label === '591ml')?.label)
}

writeMenu({
  file: 'pizzahut',
  exportName: 'pizzahut',
  meta: { id: 'pizza-hut', name: 'Pizza Hut', cuisine: 'Pizza · Fast food', accent: '#dc2626', segment: 'Fast Food' },
  items,
  order: ['Pizza', 'Chicken', 'Mains', 'Wraps', 'Salads', 'Sides', 'Desserts', 'Drinks'],
  source: [
    "Pizza Hut Canada — complete menu from Pizza Hut's official nutrition guide",
    '(linked from pizzahut.ca/nutrition; extracted by fetch-pizzahut.cjs). Pizzas are',
    'per slice for each crust and size; extra toppings use the per-slice values for',
    'that size, and wings / wing sauces scale from the per-piece values.',
    "Generated by scripts/menus/gen-pizzahut.ts — regenerate, don't hand-edit.",
  ],
})
