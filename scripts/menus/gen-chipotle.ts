// Generate Chipotle Canada's menu from its official nutrition facts sheet
// (raw/chipotle.tsv, transcribed from the Canadian PDF linked by
// chipotle.ca/nutrition-calculator).
//
// Chipotle publishes every ingredient at its standard portion, so burritos,
// bowls, salads and tacos are builders using only those official values.
// Sides and drinks are fixed items.
//
//   run from the repo root: gen-chipotle.ts
import * as fs from 'fs'
import type { BuilderGroup, BuilderOption, MealCategory, Nutrition } from '../../src/types'
import { idMaker, slug, tagsFor, writeMenu } from './lib'

const rows = new Map<string, Nutrition[]>()
const portions = new Map<string, string[]>()
for (const l of fs.readFileSync('scripts/menus/raw/chipotle.tsv', 'utf8').replace(/\r/g, '').split('\n')) {
  if (!l || l.startsWith('#')) continue
  const [name, portion, cal, fat, na, carbs, protein] = l.split('\t')
  const n: Nutrition = { calories: Math.round(+cal), protein: Math.round(+protein), carbs: Math.round(+carbs), fat: Math.round(+fat), sodium: Math.round(+na) }
  rows.set(name, [...(rows.get(name) ?? []), n])
  portions.set(name, [...(portions.get(name) ?? []), portion.replace(' ml', ' mL')])
}
const get = (name: string, i = 0): Nutrition => {
  const n = rows.get(name)?.[i]
  if (!n) throw new Error(`missing ${name}`)
  return n
}
const times = (n: Nutrition, k: number): Nutrition => ({ calories: n.calories * k, protein: n.protein * k, carbs: n.carbs * k, fat: n.fat * k, sodium: n.sodium * k })

const opt = (name: string, source = name, extra: Partial<BuilderOption> = {}): BuilderOption => ({ id: slug(name), name, nutrition: get(source), ...extra })
const PROTEIN = ['Chicken', 'Steak', 'Barbacoa', 'Carnitas', 'Sofritas'].map((p) => opt(p, p, p === 'Chicken' ? { recommended: true } : {}))
const RICE = [opt('Cilantro-lime white rice', 'Cilantro-Lime White Rice'), opt('Cilantro-lime brown rice', 'Cilantro-Lime Brown Rice', { recommended: true })]
const BEANS = [opt('Black beans', 'Black Beans', { recommended: true }), opt('Pinto beans', 'Pinto Beans')]
const TOPPINGS = [
  opt('Fajita veggies', 'Fajita Vegetables', { recommended: true }),
  opt('Fresh tomato salsa', 'Fresh Tomato Salsa', { recommended: true }),
  opt('Roasted chili-corn salsa', 'Roasted Chili-Corn Salsa'),
  opt('Tomatillo-green chili salsa', 'Tomatillo-Green Chili Salsa'),
  opt('Tomatillo-red chili salsa', 'Tomatillo-Red Chili Salsa'),
  opt('Sour cream', 'Sour Cream'),
  opt('Cheese', 'Cheese'),
  opt('Guacamole', 'Guacamole (topping/side)'),
  opt('Queso blanco', 'Queso Blanco (entree)'),
]
const group = (id: string, name: string, min: number, max: number | undefined, options: BuilderOption[]): BuilderGroup => ({ id, name, min, ...(max ? { max } : {}), options })
const fillings = (rice = true): BuilderGroup[] => [
  group('protein', 'Protein or veggie', 0, 2, PROTEIN),
  ...(rice ? [group('rice', 'Rice', 0, 1, RICE)] : []),
  group('beans', 'Beans', 0, 1, BEANS),
  group('toppings', 'Toppings', 0, undefined, TOPPINGS),
]

const items: any[] = [
  { id: 'cmg-burrito', name: 'Build Your Burrito', kind: 'builder', category: 'Bowls & Burritos', description: 'A flour tortilla with your fillings.', groups: [group('tortilla', 'Tortilla', 1, 1, [opt('Flour tortilla', 'Flour Tortilla (burrito)')]), ...fillings()] },
  { id: 'cmg-bowl', name: 'Build Your Burrito Bowl', kind: 'builder', category: 'Bowls & Burritos', description: 'Everything in a burrito, served in a bowl with no tortilla.', groups: fillings() },
  {
    id: 'cmg-salad',
    name: 'Build Your Salad',
    kind: 'builder',
    category: 'Salads',
    description: 'Supergreens with your fillings and the chipotle-honey vinaigrette on the side.',
    groups: [group('base', 'Base', 1, 1, [opt('Supergreens lettuce blend', 'Supergreens Mix (salad)')]), ...fillings(false), group('dressing', 'Dressing', 0, 1, [opt('Chipotle-honey vinaigrette', 'Vinaigrette', { recommended: true })])],
  },
  {
    id: 'cmg-tacos',
    name: 'Build Your Tacos (3)',
    kind: 'builder',
    category: 'Bowls & Burritos',
    description: 'Three crispy corn or soft flour tortillas with romaine and your fillings.',
    groups: [
      group('tortilla', 'Tortillas (3)', 1, 1, [
        { id: 'soft-flour', name: 'Soft flour (×3)', nutrition: times(get('Flour Tortilla (taco)'), 3) },
        { id: 'crispy-corn', name: 'Crispy corn (×3)', nutrition: times(get('Crispy Corn Tortilla'), 3), recommended: true },
      ]),
      ...fillings(false),
      group('lettuce', 'Lettuce', 0, 1, [opt('Romaine lettuce', 'Romaine Lettuce (tacos)', { recommended: true })]),
    ],
  },
]

const newId = idMaker('cmg')
function push(name: string, category: MealCategory, versions: { label: string; n: Nutrition }[]) {
  const d = versions[0]
  const tags = tagsFor(name, d.n)
  const it: any = { id: newId(name), name, kind: 'fixed', category, ...(tags.length ? { tags } : {}), nutrition: d.n }
  if (versions.length > 1) {
    it.defaultSize = d.label
    it.sizes = versions.map((v) => ({ label: v.label, nutrition: v.n }))
  } else it.serving = d.label
  items.push(it)
}
const sum = (a: Nutrition, b: Nutrition): Nutrition => ({ calories: a.calories + b.calories, protein: a.protein + b.protein, carbs: a.carbs + b.carbs, fat: a.fat + b.fat, sodium: a.sodium + b.sodium })
push('Chips', 'Sides', [{ label: 'Regular', n: get('Chips (regular)') }, { label: 'Large', n: get('Chips (large)') }])
push('Chips & Guacamole', 'Sides', [{ label: 'Regular', n: sum(get('Chips (regular)'), get('Guacamole (topping/side)')) }, { label: 'Large', n: sum(get('Chips (large)'), get('Guacamole (large)')) }])
push('Chips & Queso Blanco', 'Sides', [{ label: 'Regular', n: sum(get('Chips (regular)'), get('Queso Blanco (side)')) }, { label: 'Large', n: sum(get('Chips (large)'), get('Queso Blanco (large)')) }])
push('Chips & Fresh Tomato Salsa', 'Sides', [{ label: 'Regular', n: sum(get('Chips (regular)'), get('Fresh Tomato Salsa')) }])
push('Side of Guacamole', 'Sides', [{ label: 'Side', n: get('Guacamole (topping/side)') }, { label: 'Large', n: get('Guacamole (large)') }])
push('Side of Queso Blanco', 'Sides', [{ label: 'Side', n: get('Queso Blanco (side)') }, { label: 'Large', n: get('Queso Blanco (large)') }])
const DRINKS = ["Barq's Root Beer", 'Coca-Cola Classic', 'Diet Coke', 'Coca-Cola Zero Sugar', 'Sprite', 'Canada Dry Ginger Ale', 'Fanta Orange', 'Nestea', 'Iced Tea', 'Tractor Lemonade', 'Tractor Berry Agua Fresca', 'Tractor Mandarin Agua Fresca', 'Tractor Watermelon Limeade', 'Regular Beer', 'Light Beer', 'Sauza Margarita']
for (const d of DRINKS) {
  const ps = portions.get(d)
  if (!ps) throw new Error(`missing drink ${d}`)
  push(d, 'Drinks', ps.map((p, i) => ({ label: ps.length > 1 ? `${i ? 'Large' : 'Regular'} · ${p}` : p, n: get(d, i) })))
}

writeMenu({
  file: 'chipotle',
  exportName: 'chipotle',
  meta: { id: 'chipotle', name: 'Chipotle', cuisine: 'Mexican · Build-your-own', accent: '#a81612', segment: 'Build-Your-Own' },
  items,
  hasBuilder: true,
  order: ['Bowls & Burritos', 'Salads', 'Sides', 'Drinks'],
  source: [
    "Chipotle Canada — official nutrition facts sheet (CA-Nutrition-Facts-Paper-Menu-3-2025.pdf,",
    'linked from chipotle.ca/nutrition-calculator; transcribed in raw/chipotle.tsv).',
    'Builders use the published value for each ingredient at its standard portion.',
    "Generated by scripts/menus/gen-chipotle.ts — regenerate, don't hand-edit.",
  ],
})
