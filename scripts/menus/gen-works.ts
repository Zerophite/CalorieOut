// Generate The WORKS' menu from its official nutritionals guide
// (raw/works.tsv, see fetch-works.cjs).
//
// The WORKS publishes every burger part separately — patty, bun, each named
// topping combination, extra toppings and dips — so the burger builder and
// every named burger are built entirely from official parts (patty + bun +
// toppings, as the guide intends). Rows whose macros can't belong to their
// calories (broken source data) are skipped.
//
//   run from the repo root: gen-works.ts
import * as fs from 'fs'
import { buildComponents, type PartSpec } from '../../src/data/components'
import { componentsFor } from '../../src/data/templates'
import type { BuilderGroup, FixedItem, IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { idMaker, slug, tagsFor, writeMenu } from './lib'

type Row = { section: string; name: string; n: Nutrition }
const rows: Row[] = []
for (const l of fs.readFileSync('scripts/menus/raw/works.tsv', 'utf8').split(/\r?\n/)) {
  if (!l) continue
  const [section, name, cal, fat, sodium, carbs, protein] = l.split('\t')
  const n = { calories: Math.round(+cal), protein: Math.round(+protein), carbs: Math.round(+carbs), fat: Math.round(+fat), sodium: Math.round(+sodium) }
  const est = 9 * n.fat + 4 * n.carbs + 4 * n.protein
  if (n.calories > 30 && (est < n.calories * 0.6 - 20 || est > n.calories * 1.5 + 20)) {
    console.warn(`skipping inconsistent row: ${name} (${cal} kcal, est. ${est})`)
    continue
  }
  if (n.calories === 0 && /plain jack/i.test(name)) continue
  rows.push({ section, name: name.replace(/\*/g, '').replace(/\s+/g, ' ').trim(), n })
}
const sec = (re: RegExp) => rows.filter((r) => re.test(r.section))
const add = (a: Nutrition, b: Nutrition): Nutrition => ({
  calories: a.calories + b.calories, protein: a.protein + b.protein, carbs: a.carbs + b.carbs, fat: a.fat + b.fat, sodium: a.sodium + b.sodium,
})
const scale = (n: Nutrition, k: number): Nutrition => ({
  calories: Math.round(n.calories * k), protein: Math.round(n.protein * k), carbs: Math.round(n.carbs * k), fat: Math.round(n.fat * k), sodium: Math.round(n.sodium * k),
})

const PATTIES = sec(/^BURGER PATTIES$/)
const BUNS = sec(/^BUN$/)
const COMBOS = sec(/^BURGER TOPPING COMBINATIONS$/)
const TOPPINGS = sec(/^PUMP UP/).filter((r) => !/^Peameal/.test(r.name)) // listed twice
const DIPS = sec(/^DIPSTICKS/)
const pattyLabel = (name: string) =>
  name
    .replace(/^Fresh 100% Canadian Beef, Smash \((\w+)\)$/, 'Smash beef ($1)')
    .replace(/^Fresh 100% Canadian Beef \((\w+)\)$/, 'Beef ($1)')
    .replace(/^Fresh Whole Chicken Breast$/, 'Grilled chicken breast')
    .replace(/^Gourmet Veggie \((\w+)\)$/, 'Gourmet veggie ($1)')
const extra = (r: Row, prefix = 'Add'): IngredientComponent => ({ id: `x-${slug(r.name)}`, name: `${prefix} ${r.name.toLowerCase().replace(/^bacon, beef$/, 'beef bacon')}`, default: false, nutrition: r.n })

// --- Builder ----------------------------------------------------------------------------------------
const builder: BuilderGroup[] = [
  { id: 'patty', name: 'Patty', min: 1, max: 2, options: PATTIES.map((p) => ({ id: slug(p.name), name: pattyLabel(p.name), nutrition: p.n, ...(/4oz\)$/.test(p.name) && /Beef/.test(p.name) ? { recommended: true } : {}) })) },
  { id: 'bun', name: 'Bun', min: 0, max: 1, options: BUNS.map((b) => ({ id: slug(b.name), name: `${b.name.replace(/ Bun$/, '')} bun`, nutrition: b.n })) },
  { id: 'combo', name: 'Signature toppings', min: 0, max: 1, options: COMBOS.map((c) => ({ id: slug(c.name), name: c.name, nutrition: c.n })) },
  { id: 'toppings', name: 'Pump up your burg', min: 0, options: TOPPINGS.map((t) => ({ id: slug(t.name), name: t.name, nutrition: t.n })) },
  { id: 'dips', name: 'Dipsticks & sauces', min: 0, max: 3, options: DIPS.map((d) => ({ id: slug(d.name), name: d.name, nutrition: d.n })) },
]
const items: any[] = [
  { id: 'wk-build', name: 'Build Your Burger', kind: 'builder', category: 'Burgers', description: "Pick a patty, a bun, a signature topping combination and extras — every part uses The WORKS' official values.", groups: builder },
]

// --- Named burgers: patty × bun × toppings, all official parts --------------------------------
const newId = idMaker('wk')
const brioche = BUNS.find((b) => /Brioche/.test(b.name))!
const BURGER_EXTRAS = [...TOPPINGS.filter((t) => !/nutella|peanut butter/i.test(t.name)).slice(0, 14).map((t) => extra(t)), ...DIPS.filter((d) => /aioli|chipotle|ranch|mayo|bbq|w sauce/i.test(d.name)).map((d) => extra(d))]
for (const c of COMBOS) {
  const smash = /smash/i.test(c.name)
  const name = c.name.replace(/ \(Smash Burger\)$/, '').replace(/^The W$/, 'The W Burger')
  const burgerName = /burger/i.test(name) ? name : `${name}${smash ? ' Smash Burger' : ' Burger'}`
  const patties = smash ? PATTIES.filter((p) => /Smash/.test(p.name)).concat(PATTIES.filter((p) => !/Smash/.test(p.name))) : PATTIES
  const versions = patties.map((p) => {
    const total = add(add(p.n, brioche.n), c.n)
    const specs: PartSpec[] = [
      { id: 'bun', name: 'Brioche bun', n: brioche.n },
      { id: 'patty', name: pattyLabel(p.name), core: true },
      { id: 'toppings', name: `${name} toppings`, n: c.n },
    ]
    return { label: pattyLabel(p.name), n: total, comps: [...buildComponents(total, specs), ...BURGER_EXTRAS] }
  })
  const def = versions.find((v) => v.label === (smash ? 'Smash beef (3oz)' : 'Beef (4oz)')) ?? versions[0]
  const tags = tagsFor(burgerName, def.n)
  items.push({
    id: newId(burgerName),
    name: burgerName,
    kind: 'fixed',
    category: 'Burgers',
    ...(tags.length ? { tags } : {}),
    nutrition: def.n,
    defaultSize: def.label,
    sizeTitle: 'Patty',
    sizes: versions.map((v) => ({ label: v.label, nutrition: v.n, components: v.comps })),
  })
}

// --- Everything else ------------------------------------------------------------------------------
function withDefaults(name: string, category: MealCategory, n: Nutrition, extras: IngredientComponent[]) {
  const probe: FixedItem = { id: 'probe', name, kind: 'fixed', category, nutrition: n }
  return [...componentsFor(probe).filter((c) => c.default !== false), ...extras]
}
const SMOKE_ADDONS = sec(/^ADD ONS/).filter((r) => r.n.calories > 0)
const sideExtras = DIPS.filter((d) => /gravy|ranch|chipotle|aioli|mayo/i.test(d.name)).map((d) => extra(d))

function category(section: string, name: string): MealCategory {
  if (/SAMMYS/.test(section)) return 'Sandwiches'
  if (/SALADS/.test(section) || /^side (caesar|garden)/i.test(name)) return 'Salads'
  if (/BEVERAGES/.test(section)) return 'Drinks'
  if (/SHAKES/.test(section)) return 'Desserts'
  if (/MAINS|PLATTERS/.test(section)) return 'Mains'
  if (/KIDS/.test(section)) return /shake/i.test(name) ? 'Desserts' : 'Mains'
  if (/wing|tender|chix|cluck/i.test(name)) return 'Chicken'
  return 'Sides'
}
const products = new Map<string, { category: MealCategory; versions: { label: string; n: Nutrition }[]; extras: IngredientComponent[] }>()
const SHAKE_FLAVOURS = sec(/^SHAKES$/).filter((r) => !/shake|nutella$|^bella/i.test(r.name) || /^Nutella$/.test(r.name))
for (const r of rows) {
  if (/^(BURGER PATTIES|BUN|BURGER TOPPING COMBINATIONS|PUMP UP YOUR BURG TOPPINGS|ADD ONS & UPGRADES)$/.test(r.section)) continue
  if (/^SHAKES$/.test(r.section) && SHAKE_FLAVOURS.includes(r)) continue
  let name = r.name
  let label = '1 serving'
  let m: RegExpMatchArray | null
  if ((m = name.match(/^Wingin' It \((\d+)pc\)$/))) [name, label] = ["Wingin' It", `${m[1]} pc`]
  if ((m = name.match(/^Queso \((\d)oz\)$/))) continue
  if (/DIPSTICKS/.test(r.section)) label = '1 dip'
  name = name.replace(/ FULL ORDER$/, '').replace(/^Poutine Tragically Maple$/, 'Tragically Maple Poutine').replace(/^Kids Shake \(base\)$/, 'Shake (base)').replace(/^Regular Shake \(base\)$/, 'Shake (base)')
  if (/^Shake \(base\)$/.test(name)) label = /Kids/.test(r.name) ? "Kids' (8 oz)" : 'Regular (16 oz)'
  const cat = category(r.section, name)
  const extras = /MAINS|PLATTERS|KIDS/.test(r.section) && /brisk|rib|brat|mac/i.test(name)
    ? SMOKE_ADDONS.map((a) => extra(a))
    : /fries|poutine|rings|chips|bloomin|sammy|cluck|chicken|wing|tender/i.test(name)
      ? sideExtras
      : []
  const key = name.toLowerCase()
  if (!products.has(key)) products.set(key, { category: cat, versions: [], extras })
  products.get(key)!.versions.push({ label, n: r.n })
}
for (const [key, p] of products) {
  const name = [...rows].find((r) => r.name.toLowerCase() === key)?.name.replace(/ FULL ORDER$/, '') ?? key.replace(/(^|\s)\w/g, (s) => s.toUpperCase())
  const display = key === 'shake (base)' ? 'Build-a-Shake' : key === "wingin' it" ? "Wingin' It" : name
  const versions = p.versions
  const def = versions.find((v) => /Regular/.test(v.label)) ?? versions[0]
  const isShake = key === 'shake (base)'
  const comps = (v: { label: string; n: Nutrition }) => {
    if (isShake) {
      const k = /16/.test(v.label) ? 2 : 1 // flavours are listed for 8 oz; double for 16 oz
      return [...componentsFor({ id: 'probe', name: 'vanilla milkshake', kind: 'fixed', category: 'Desserts', nutrition: v.n }).filter((c) => c.default !== false), ...SHAKE_FLAVOURS.map((f) => ({ id: `x-${slug(f.name)}`, name: `Add ${f.name.toLowerCase()}`, default: false, nutrition: scale(f.n, k) }))]
    }
    return p.extras.length ? withDefaults(display, p.category, v.n, p.extras) : undefined
  }
  const tags = tagsFor(display, def.n)
  const it: any = { id: newId(display), name: display, kind: 'fixed', category: p.category, ...(tags.length ? { tags } : {}), nutrition: def.n }
  if (versions.length > 1) {
    it.defaultSize = def.label
    it.sizes = versions.map((v) => {
      const c = comps(v)
      return { label: v.label, nutrition: v.n, ...(c ? { components: c } : {}) }
    })
  } else {
    it.serving = def.label
    const c = comps(def)
    if (c) it.components = c
  }
  items.push(it)
}

writeMenu({
  file: 'theworks',
  exportName: 'theworks',
  meta: { id: 'the-works', name: 'The Works', cuisine: 'Gourmet burgers', accent: '#78350f', segment: 'Sit-Down' },
  items,
  hasBuilder: true,
  order: ['Burgers', 'Sandwiches', 'Chicken', 'Mains', 'Salads', 'Sides', 'Desserts', 'Drinks'],
  source: [
    "The WORKS — complete menu from The WORKS' official nutritionals & allergens guide",
    '(September 2026, linked from worksburger.com/menu; extracted by fetch-works.cjs).',
    'Burgers are built from the official patty, bun and topping-combination values;',
    'extra toppings, dips, shake flavours and smokehouse add-ons use official values.',
    "Generated by scripts/menus/gen-works.ts — regenerate, don't hand-edit.",
  ],
})
