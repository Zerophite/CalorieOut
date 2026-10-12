// Generate Thai Express's menu from its official nutrition chart
// (raw/thaiexpress.tsv, see fetch-thaiexpress.cjs).
//
// Thai Express publishes meals as parts to add up: (1) sauce & vegetables or
// (2) broth, + (3) protein, + (4) rice / noodles (+ egg where it applies).
// Every dish is therefore built entirely from official parts, with the protein
// as the item's option and extras (more protein, cashews, peanuts, Thaïracha,
// coconut milk, cauliflower rice…) as add-ons with official values.
//
// The chart repeats a dish name for its vegan (V) and gluten-friendly (GF)
// versions, marked only by icons. From the chart: three rows are regular / V /
// GF; two rows are regular / GF+V, except the ones listed in TWO_ROW_GF_ONLY.
//
//   run from the repo root: gen-thaiexpress.ts
import * as fs from 'fs'
import { buildComponents, type PartSpec } from '../../src/data/components'
import type { IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { clean, idMaker, slug, tagsFor, writeMenu } from './lib'

type Row = { section: string; name: string; n: Nutrition }
const rows: Row[] = fs
  .readFileSync('scripts/menus/raw/thaiexpress.tsv', 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .map((l) => {
    const [section, name, cal, fat, sodium, carbs, protein] = l.split('\t')
    return {
      section: section.slice(0, 1),
      name: clean(name).replace(/ﬂ/g, 'fl').replace(/\s+/g, ' ').replace(/Thaï ™/g, 'Thaï'),
      n: { calories: +cal, protein: Math.round(+protein), carbs: Math.round(+carbs), fat: Math.round(+fat), sodium: +sodium },
    }
  })
const find = (name: string) => {
  const r = rows.find((x) => x.name === name)
  if (!r) throw new Error(`missing ${name}`)
  return r.n
}
const sum = (...ns: Nutrition[]): Nutrition =>
  ns.reduce((a, b) => ({ calories: a.calories + b.calories, protein: a.protein + b.protein, carbs: a.carbs + b.carbs, fat: a.fat + b.fat, sodium: a.sodium + b.sodium }), {
    calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0,
  })

// --- Parts ------------------------------------------------------------------------------------
const PROTEINS: Record<string, string> = {
  Chicken: 'C) Chicken',
  Beef: 'B) Beef',
  'Shrimp (6 pcs)': 'A) Shrimp (6 pcs)',
  Tofu: 'E) Tofu',
  Vegetables: 'D) Vegetables',
  'Battered chicken': 'G) Battered Chicken',
  'Battered beef': 'H) Battered Beef',
  'Battered fish': 'F) Battered Fish',
}
const EGG = find('Egg (Fried Rice, Pad Thaï , Pad See Ew)')
const part = (id: string, name: string, n: Nutrition, removable = true): PartSpec => ({ id, name, n, removable: removable ? undefined : false })
const addOn = (id: string, name: string, n: Nutrition): IngredientComponent => ({ id, name, default: false, nutrition: n })

const COMMON_EXTRAS: IngredientComponent[] = [
  addOn('x-peanuts', 'Add crushed peanuts', find('Roasted Crushed Peanuts (as condiment)')),
  addOn('x-thairacha', 'Add Thaïracha sauce', find('Thaïracha Sauce')),
  addOn('x-cashews', 'Add cashews', find('Cashews')),
]

type Base = { parts: { name: string; n: Nutrition }[]; egg?: boolean }
function baseFor(dish: string): Base {
  if (/^Pad Tha/.test(dish)) return { parts: [{ name: 'Rice noodles', n: find('Noodles for Pad Thaï') }], egg: true }
  if (/^Pad See Ew/.test(dish)) return { parts: [{ name: 'Wide rice noodles', n: find('Noodles for Pad See Ew') }], egg: true }
  if (/fried rice/i.test(dish)) return { parts: [{ name: 'Fried rice', n: find('Rice for Fried Rice') }], egg: true }
  if (/^Shak-a-Bowl/.test(dish))
    return { parts: [{ name: 'Vermicelli noodles', n: find('Vermicelli Noodles for Shak-a-Bowl') }, { name: 'Lettuce', n: find('Lettuce (for Shak-a-Bowl + low carb option)') }] }
  if (/^Mini/.test(dish)) return { parts: [{ name: 'Noodles', n: find('Noodles for Mini Soup') }] }
  if (/Soup/.test(dish)) return { parts: [{ name: 'Noodles', n: find('Noodles for Soup') }] }
  return { parts: [{ name: 'Steamed rice', n: find('Rice') }] }
}

// --- Dishes ------------------------------------------------------------------------------------
const TWO_ROW_GF_ONLY = new Set(['Green Curry', 'Stir-Fry Peanut'])
const diet = new Map<string, number>()
const dishes: { name: string; variant: string; sauce: Nutrition; section: string }[] = []
const counts = new Map<string, number>()
for (const r of rows) if (r.section === '1') counts.set(r.name, (counts.get(r.name) ?? 0) + 1)
for (const r of rows.filter((x) => x.section === '1' || x.section === '2')) {
  const i = diet.get(r.name) ?? 0
  diet.set(r.name, i + 1)
  const total = counts.get(r.name) ?? 1
  const variant = i === 0 ? '' : total === 3 ? (i === 1 ? 'Vegan' : 'Gluten-friendly') : TWO_ROW_GF_ONLY.has(r.name) ? 'Gluten-friendly' : 'Vegan & gluten-friendly'
  dishes.push({ name: r.name, variant, sauce: r.n, section: r.section })
}

function displayName(dish: string): string {
  return dish
    .replace(/^Fried Rice - (.*)$/, '$1 Fried Rice')
    .replace(/^General Thaïracha$/, 'General Thaï Thaïracha')
    .replace(/\s+\(Meal\)$/, '')
}
function category(dish: string): MealCategory {
  if (/soup/i.test(dish)) return 'Mains'
  if (/^Shak-a-Bowl/.test(dish)) return 'Bowls & Burritos'
  return 'Mains'
}

const newId = idMaker('tx')
const items: any[] = []
for (const d of dishes) {
  const base = baseFor(d.name)
  const vegan = /vegan/i.test(d.variant)
  const gf = /gluten/i.test(d.variant)
  let proteinNames = Object.keys(PROTEINS)
  if (vegan) proteinNames = ['Tofu', 'Vegetables']
  else if (gf) proteinNames = proteinNames.filter((p) => !/battered/i.test(p))
  const defaultProtein = /^General/.test(d.name) && !vegan && !gf ? 'Battered chicken' : vegan ? 'Tofu' : 'Chicken'
  const sauceLabel = d.section === '2' ? 'Broth & vegetables' : 'Sauce & vegetables'

  const versions = proteinNames.map((p) => {
    const protein = find(PROTEINS[p])
    const specs: PartSpec[] = [
      { id: 'protein', name: p, core: true },
      part('sauce', sauceLabel, d.sauce),
      ...base.parts.map((b, i) => part(`base${i}`, b.name, b.n)),
      ...(base.egg && !vegan ? [part('egg', 'Egg', EGG)] : []),
    ]
    const total = sum(protein, d.sauce, ...base.parts.map((b) => b.n), ...(base.egg && !vegan ? [EGG] : []))
    const extras: IngredientComponent[] = [
      addOn('x-protein', `Extra ${p.toLowerCase().replace(/ \(6 pcs\)/, '')}`, protein),
      ...COMMON_EXTRAS,
      ...(base.egg && vegan ? [] : base.egg ? [] : [addOn('x-egg', 'Add egg', EGG)]),
      ...(/soup/i.test(d.name)
        ? [addOn('x-coconut', 'Add coconut milk', find(/^Mini/.test(d.name) ? 'Extra coconut milk for mini-soup' : 'Extra Coconut milk for soup (meal)'))]
        : [addOn('x-cauli', 'Add cauliflower rice', find('Cauliflower Rice')), addOn('x-sprouts', 'Add bean sprouts', find('Bean Sprouts (for low carb option)'))]),
    ]
    return { label: p, n: total, comps: [...buildComponents(total, specs), ...extras] }
  })

  const name = displayName(d.name) + (d.variant ? ` (${d.variant})` : '')
  const def = versions.find((v) => v.label === defaultProtein) ?? versions[0]
  const tags = tagsFor(name, def.n)
  if (vegan && !tags.includes('vegetarian')) tags.push('vegetarian')
  items.push({
    id: newId(name),
    name,
    kind: 'fixed',
    category: category(d.name),
    ...(tags.length ? { tags } : {}),
    nutrition: def.n,
    defaultSize: def.label,
    sizeTitle: 'Protein',
    sizes: versions.map((v) => ({ label: v.label, nutrition: v.n, components: v.comps })),
  })
}

// --- Appetizers (with their dipping sauce), desserts, drink ---------------------------------
const sauce = (name: string) => find(name)
const APPS: { name: string; row: string; sauce?: [string, string]; extras?: [string, string][] }[] = [
  { name: 'Imperial Roll', row: 'Imperial Roll', extras: [['Plum sauce', 'Plum Sauce for Imperial Roll'], ['Fish sauce', 'Fish Sauce for Imperial Roll']] },
  { name: 'Shrimp Spring Roll', row: 'Shrimp Spring Roll', sauce: ['Peanut sauce', 'Peanut Sauce for Spring Roll'] },
  { name: 'Vegetable Spring Roll', row: 'Vegetable Spring Roll', sauce: ['Peanut sauce', 'Peanut Sauce for Spring Roll'] },
  { name: 'Steamed Dumplings (4)', row: 'Steamed Dumplings (4)', sauce: ['Peanut sauce', 'Peanut Sauce for Steamed Dumplings'] },
  { name: 'Fried Dumplings (4)', row: 'Fried Dumplings (4)', sauce: ['Sweet chili sauce', 'Sweet Chili Sauce for Fried Dumplings'] },
  { name: 'Mango Salad', row: 'Mango Salad (8oz)', sauce: ['Thaï dressing', 'Thaï Dressing for Mango Salad'] },
  { name: 'BokBok Chicken', row: 'BokBok Chicken', extras: [['Thaïracha sauce', 'Thaïracha Sauce']] },
]
for (const a of APPS) {
  const main = find(a.row)
  const specs: PartSpec[] = [{ id: 'main', name: a.name.replace(/ \(\d\)$/, ''), core: true }]
  let total = main
  if (a.sauce) {
    const s = sauce(a.sauce[1])
    specs.push(part('sauce', a.sauce[0], s))
    total = sum(main, s)
  }
  const extras = (a.extras ?? []).map(([label, row]) => addOn(`x-${slug(label)}`, `Add ${label.toLowerCase().replace('thaï', 'Thaï')}`, sauce(row)))
  if (a.sauce) extras.push(addOn('x-extra-sauce', `Extra ${a.sauce[0].toLowerCase().replace('thaï', 'Thaï')}`, sauce(a.sauce[1])))
  items.push({
    id: newId(a.name),
    name: a.name,
    kind: 'fixed',
    category: /salad/i.test(a.name) ? 'Salads' : /chicken/i.test(a.name) ? 'Chicken' : 'Sides',
    serving: '1 order',
    nutrition: total,
    components: [...buildComponents(total, specs), ...extras, ...COMMON_EXTRAS.slice(1, 2)],
  })
}
// Wings: 3 / 6 / 9 pieces, each with its sweet chili sauce.
{
  const versions = [3, 6, 9].map((count) => {
    const w = find(`Thaï Chicken Wings (${count} pcs)`)
    const s = find(`Sweet Chili Sauce for ${count} Chicken Wings`)
    const total = sum(w, s)
    const comps = [
      ...buildComponents(total, [{ id: 'wings', name: 'Chicken wings', core: true }, part('sauce', 'Sweet chili sauce', s)]),
      addOn('x-extra-sauce', 'Extra sweet chili sauce', s),
      COMMON_EXTRAS[1],
    ]
    return { label: `${count} pc`, nutrition: total, components: comps }
  })
  items.push({ id: newId('Thai Chicken Wings'), name: 'Thaï Chicken Wings', kind: 'fixed', category: 'Chicken', tags: ['high-protein'], nutrition: versions[1].nutrition, defaultSize: '6 pc', sizes: versions })
}
for (const r of rows.filter((x) => x.section === '8')) {
  items.push({
    id: newId(r.name),
    name: r.name,
    kind: 'fixed',
    category: /tea/i.test(r.name) ? 'Drinks' : 'Desserts',
    serving: '1 serving',
    nutrition: r.n,
  })
}

writeMenu({
  file: 'thaiexpress',
  exportName: 'thaiexpress',
  meta: { id: 'thai-express', name: 'Thai Express', cuisine: 'Thai · Fast food', accent: '#dc2626', segment: 'Fast Food' },
  items,
  order: ['Mains', 'Bowls & Burritos', 'Chicken', 'Salads', 'Sides', 'Desserts', 'Drinks'],
  source: [
    "Thai Express — complete menu from Thai Express's official nutrition chart",
    '(thaiexpress.ca/nutritional-facts; extracted by fetch-thaiexpress.cjs). Each dish',
    'is the sum of its official parts (sauce & vegetables or broth + protein + rice /',
    'noodles + egg), so every ingredient and add-on carries Thai Express\'s own values.',
    "Generated by scripts/menus/gen-thaiexpress.ts — regenerate, don't hand-edit.",
  ],
})
