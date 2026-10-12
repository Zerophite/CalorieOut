// Generate BarBurrito's menu from its official nutrition calculator
// (raw/barburrito.json, see fetch-barburrito.cjs).
//
// The calculator publishes one portion per ingredient and scales it by format,
// exactly as barburrito.ca does (nutrition-calculator.js):
//   burritos  protein ×1 / ×2 / ×3 / ×2 and rice, beans & cheese ×1 / ×1.5 / ×2 / ×1.5
//             for small / regular / large / bowl (two kinds of beans → half of each)
//   quesadilla protein and beans & cheese ×2
//   3 tacos   tortilla ×3, protein ×2 (fish ×3), cheese ×1.5
// Toppings, sauces and combo sides are one portion. Each format becomes a
// builder whose options carry the scaled official values.
//
//   run from the repo root: gen-barburrito.ts
import * as fs from 'fs'
import type { BuilderGroup, BuilderOption, MealCategory, Nutrition } from '../../src/types'
import { idMaker, slug, tagsFor, writeMenu } from './lib'

type Opt = { form: string; group: string; label: string; size: string; n: Nutrition & { fiber?: number } }
const raw: Opt[] = JSON.parse(fs.readFileSync('scripts/menus/raw/barburrito.json', 'utf8'))

const scale = (n: Opt['n'], k: number): Nutrition => {
  const out: Nutrition = {
    calories: Math.round(n.calories * k),
    protein: Math.round(n.protein * k),
    carbs: Math.round(n.carbs * k),
    fat: Math.round(n.fat * k),
    sodium: Math.round(n.sodium * k),
  }
  if (n.fiber) out.fiber = Math.round(n.fiber * k)
  return out
}
const opts = (form: string, group: string, size = '') => raw.filter((o) => o.form === form && o.group === group && (!size || o.size === size))
const half = (a: Opt['n'], b: Opt['n']): Opt['n'] => ({
  calories: (a.calories + b.calories) / 2,
  protein: (a.protein + b.protein) / 2,
  carbs: (a.carbs + b.carbs) / 2,
  fat: (a.fat + b.fat) / 2,
  sodium: (a.sodium + b.sodium) / 2,
  fiber: ((a.fiber ?? 0) + (b.fiber ?? 0)) / 2,
})

const RECOMMENDED = new Set(['Mild Chicken', 'Whole Wheat', 'Black Beans', 'Mexican Rice', 'Red Salsa', 'Lettuce', 'Tomatoes', 'Soft Shell'])
const VEG = new Set(['Veggie Ground', 'Falafel'])
const option = (o: { label: string; n: Opt['n'] }, k: number, extra: Partial<BuilderOption> = {}): BuilderOption => {
  const tags: string[] = []
  if (VEG.has(o.label)) tags.push('vegetarian')
  return {
    id: slug(o.label),
    name: o.label === 'Crush Chips' ? 'Crushed Chips' : o.label,
    nutrition: scale(o.n, k),
    ...(RECOMMENDED.has(o.label) ? { recommended: true } : {}),
    ...(tags.length ? { tags } : {}),
    ...extra,
  }
}
const group = (id: string, name: string, min: number, max: number | undefined, options: BuilderOption[]): BuilderGroup => ({ id, name, min, ...(max ? { max } : {}), options })

const toppings = (form: string) => group('toppings', 'Toppings', 0, undefined, opts(form, 'select_additional_toppings').map((o) => option(o, 1)))
const sauces = (form: string) => group('sauces', 'Sauces', 0, undefined, opts(form, 'select_sauces').map((o) => option(o, 1, o.label === 'Burrito Sauce' ? { note: 'barSAUCE' } : {})))
const combo = (form: string) =>
  group('combo', 'Make it a combo', 0, 1, opts(form, 'combo').map((o) => option({ label: o.label.replace(/^W\/ /, 'With '), n: o.n }, 1)))

// --- Burritos & bowl ---------------------------------------------------------------------------------
const BURRITO = [
  { size: 'small', name: 'Build Your Burrito (Small)', protein: 1, base: 1, desc: 'Small tortilla with a single portion of protein.' },
  { size: 'regular', name: 'Build Your Burrito (Regular)', protein: 2, base: 1.5, desc: 'Regular tortilla with a double portion of protein.' },
  { size: 'large', name: 'Build Your Burrito (Large)', protein: 3, base: 2, desc: 'Large tortilla with a triple portion of protein.' },
  { size: 'bowl', name: 'Build Your Bowl', protein: 2, base: 1.5, desc: 'No tortilla — a double portion of protein over rice and beans.' },
]
const items: any[] = []
for (const b of BURRITO) {
  const groups: BuilderGroup[] = []
  if (b.size !== 'bowl') groups.push(group('tortilla', 'Tortilla', 1, 1, opts('burritos', `select_tortilla_${b.size}`, b.size).map((o) => option(o, 1))))
  groups.push(
    group(
      'protein',
      'Protein',
      0,
      1,
      opts('burritos', 'select_protein')
        // The calculator offers Bang Bang Shrimp in the regular burrito only.
        .filter((o) => o.label !== 'Bang Bang Shrimp' || b.size === 'regular')
        .map((o) => option(o, b.protein)),
    ),
  )
  const base = opts('burritos', 'select_base_toppings')
  const get = (l: string) => base.find((o) => o.label === l)!
  groups.push(group('rice', 'Rice', 0, 1, [option(get('Mexican Rice'), b.base)]))
  groups.push(
    group('beans', 'Beans', 0, 1, [
      option(get('Pinto Beans'), b.base),
      option(get('Black Beans'), b.base),
      option({ label: 'Half pinto, half black', n: half(get('Pinto Beans').n, get('Black Beans').n) }, b.base),
    ]),
  )
  groups.push(group('cheese', 'Cheese', 0, 1, [option(get('Cheese'), b.base)]))
  groups.push(toppings('burritos'), sauces('burritos'), combo('burritos'))
  items.push({
    id: `bb-${b.size === 'bowl' ? 'bowl' : `burrito-${b.size}`}`,
    name: b.name,
    kind: 'builder',
    category: 'Bowls & Burritos' as MealCategory,
    description: `${b.desc} Every option uses BarBurrito's official calculator values for this size.`,
    groups,
  })
}

// --- Quesadilla ----------------------------------------------------------------------------------------
{
  const base = opts('quesadillas', 'select_base_toppings')
  items.push({
    id: 'bb-quesadilla',
    name: 'Build Your Quesadilla',
    kind: 'builder',
    category: 'Bowls & Burritos',
    description: "Regular tortilla with a double portion of protein, beans and cheese. Every option uses BarBurrito's official calculator values.",
    groups: [
      group('tortilla', 'Tortilla', 1, 1, opts('quesadillas', 'select_tortilla_regular', 'regular').map((o) => option(o, 1))),
      group('protein', 'Protein', 0, 1, opts('quesadillas', 'select_protein').map((o) => option(o, 2))),
      group('beans', 'Beans', 0, 2, base.filter((o) => /beans/i.test(o.label)).map((o) => option(o, 2))),
      group('cheese', 'Cheese', 0, 1, base.filter((o) => o.label === 'Cheese').map((o) => option(o, 2, { recommended: true }))),
      toppings('quesadillas'),
      sauces('quesadillas'),
      combo('quesadillas'),
    ],
  })
}

// --- Tacos ----------------------------------------------------------------------------------------------
items.push({
  id: 'bb-tacos',
  name: 'Build Your Tacos (3)',
  kind: 'builder',
  category: 'Bowls & Burritos',
  description: "Three tacos with chips & salsa on the side. Every option uses BarBurrito's official calculator values.",
  groups: [
    group('shell', 'Shells (3)', 1, 1, opts('tacos', 'select_tortilla_3tacos', '3tacos').map((o) => option(o, 3))),
    group('protein', 'Protein', 0, 1, opts('tacos', 'select_protein').map((o) => option(o, o.label === 'Fish' ? 3 : 2))),
    group('cheese', 'Cheese', 0, 1, opts('tacos', 'select_base_toppings').map((o) => option(o, 1.5))),
    toppings('tacos'),
    sauces('tacos'),
    group('included', 'Comes with', 0, 1, opts('tacos', 'select_included').map((o) => option(o, 1, { recommended: true }))),
    combo('tacos'),
  ],
})

// --- Sides (the calculator's combo sides, with official values) ----------------------------------------
const newId = idMaker('bb')
const SIDES: Record<string, string> = { 'W/ Chips': 'Tortilla Chips', 'W/ Fries': 'Fries', 'W/ Extreme Chips': 'Extreme Chips', 'W/ Extreme Fries': 'Extreme Fries' }
const dip = (label: string, group: string) => {
  const o = opts('burritos', group).find((x) => x.label === label)!
  return { id: `x-${slug(label)}`, name: `Add ${label.toLowerCase()}`, default: false, nutrition: scale(o.n, 1) }
}
const DIPS = [dip('Guacamole', 'select_additional_toppings'), dip('Queso', 'select_sauces'), dip('Red Salsa', 'select_additional_toppings'), dip('Sour Cream', 'select_sauces')]
const sideItems: [string, Opt['n']][] = [
  ...opts('burritos', 'combo').map((o): [string, Opt['n']] => [SIDES[o.label] ?? o.label, o.n]),
  ...opts('tacos', 'select_included').map((o): [string, Opt['n']] => [o.label, o.n]),
]
for (const [name, n] of sideItems) {
  const nut = scale(n, 1)
  const tags = tagsFor(name, nut)
  const base = { id: 'main', name, nutrition: nut, removable: false }
  items.push({ id: newId(name), name, kind: 'fixed', category: 'Sides', ...(tags.length ? { tags } : {}), serving: '1 order', nutrition: nut, components: [base, ...DIPS] })
}

writeMenu({
  file: 'barburrito',
  exportName: 'barburrito',
  meta: { id: 'bar-burrito', name: 'Bar Burrito', cuisine: 'Mexican · Build-your-own', accent: '#e11d48', segment: 'Build-Your-Own' },
  items,
  hasBuilder: true,
  order: ['Bowls & Burritos', 'Sides'],
  source: [
    "Bar Burrito — complete menu from BarBurrito's official nutrition calculator",
    '(barburrito.ca/nutrition-information, fetched by fetch-barburrito.cjs). Portions are',
    'scaled by format exactly as the calculator does. Generated by scripts/menus/gen-barburrito.ts.',
  ],
})
