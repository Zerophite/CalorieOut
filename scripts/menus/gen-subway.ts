// Generate Subway Canada's menu from its official nutrition data tables
// (raw/subway.tsv, see fetch-subway.cjs).
//
// Subway publishes every building block per 6" sub (breads, proteins, cheeses,
// vegetables, sauces), so the builders (6", footlong, salad) use only official
// values; a footlong is two 6" servings, and salads take double sauce, as the
// tables state. Every signature sub, wrap, salad, Power Bowl and breakfast item
// is also listed, with official add-ons.
//
//   run from the repo root: gen-subway.ts
import * as fs from 'fs'
import { componentsFor } from '../../src/data/templates'
import type { BuilderGroup, FixedItem, IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { clean, idMaker, slug, tagsFor, writeMenu } from './lib'

type Row = { section: string; group: string; name: string; n: Nutrition }
const rows: Row[] = fs
  .readFileSync('scripts/menus/raw/subway.tsv', 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .map((l) => {
    const [section, group, name, cal, fat, sodium, carbs, protein] = l.split('\t')
    return {
      section,
      group,
      name: clean(name).replace(/\s+/g, ' '),
      n: { calories: +cal, protein: Math.round(+protein), carbs: Math.round(+carbs), fat: Math.round(+fat), sodium: +sodium },
    }
  })
const scale = (n: Nutrition, k: number): Nutrition => ({
  calories: Math.round(n.calories * k),
  protein: Math.round(n.protein * k),
  carbs: Math.round(n.carbs * k),
  fat: Math.round(n.fat * k),
  sodium: Math.round(n.sodium * k),
})
const inGroup = (re: RegExp) => rows.filter((r) => re.test(r.group))
const find = (name: string, group?: RegExp) => {
  const r = rows.find((x) => x.name === name && (!group || group.test(x.group)))
  if (!r) throw new Error(`missing ${name}`)
  return r.n
}

// --- Building blocks (per 6") ---------------------------------------------------------------
const BREADS = inGroup(/^Breads$/)
const PROTEINS = inGroup(/^Individual Proteins/)
const CHEESES = inGroup(/^Cheese/)
const VEGGIES = inGroup(/^Vegetables/)
const SAUCES = inGroup(/^Sandwich Condiments/).filter((r) => !/wild rice/i.test(r.name))
const SALT = rows.find((r) => r.name === 'Salt')!

const pretty = (s: string) =>
  s
    .replace(/^6" /, '')
    .replace(/^(.*), (Black Forest|Grilled|Smashed|Black|Red|Baby|Yellow|Processed|Plain|Shredded|Grated|Scrambled|Breakfast \(1 patty\))$/, '$2 $1')
    .replace(/^Breakfast \(1 patty\) Sausage Patty$/, 'Breakfast sausage patty')
const opt = (r: Row, k: number, extra: Partial<{ recommended: boolean; note: string }> = {}) => ({
  id: slug(r.name),
  name: pretty(r.name),
  nutrition: scale(r.n, k),
  ...extra,
})

function subBuilder(footlong: boolean): BuilderGroup[] {
  const k = footlong ? 2 : 1
  const breads = BREADS.filter((b) => (footlong ? /^6"/.test(b.name) : true))
  return [
    {
      id: 'bread',
      name: footlong ? 'Bread (footlong)' : 'Bread (6")',
      min: 1,
      max: 1,
      options: breads.map((b) => opt(b, k, b.name === '6" Multigrain' ? { recommended: true } : b.name === 'Wrap' ? { note: 'wrap (one size)' } : {})),
    },
    { id: 'protein', name: 'Protein', min: 0, max: 3, options: PROTEINS.map((p) => opt(p, k, p.name === 'Turkey Breast' ? { recommended: true } : {})) },
    { id: 'cheese', name: 'Cheese', min: 0, max: 2, options: CHEESES.map((c) => opt(c, k)) },
    { id: 'veggies', name: 'Vegetables', min: 0, options: VEGGIES.map((v) => opt(v, k)) },
    { id: 'sauces', name: 'Sauces', min: 0, max: 3, options: SAUCES.map((s) => opt(s, k)) },
    { id: 'seasoning', name: 'Seasoning', min: 0, options: [opt(SALT, k), { id: 'pepper', name: 'Pepper', nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0 } }] },
  ]
}
function saladBuilder(): BuilderGroup[] {
  const base = rows.find((r) => r.section === 'SALADS' && /^Veggie Delite/.test(r.name))!
  return [
    { id: 'base', name: 'Salad base', min: 1, max: 1, options: [{ id: 'veggie-salad', name: 'Lettuce, spinach, tomatoes, onions, peppers, cucumbers & olives', nutrition: base.n, recommended: true }] },
    { id: 'protein', name: 'Protein', min: 0, max: 3, options: PROTEINS.map((p) => opt(p, 1, p.name === 'Rotisserie-Style Chicken' ? { recommended: true } : {})) },
    { id: 'cheese', name: 'Cheese', min: 0, max: 2, options: CHEESES.map((c) => opt(c, 1)) },
    { id: 'extras', name: 'Extras', min: 0, options: [...VEGGIES.filter((v) => /avocado|crispy|jalape|banana|pickles/i.test(v.name)).map((v) => opt(v, 1)), opt(rows.find((r) => /^Wild Rice/.test(r.name))!, 1)] },
    { id: 'dressing', name: 'Dressing (salad portion)', min: 0, max: 2, options: SAUCES.map((s) => opt(s, 2)) },
  ]
}

// --- Official add-ons for signature items ------------------------------------------------------
const pick = (rs: Row[], re: RegExp) => rs.filter((r) => re.test(r.name))
function addOns(k: number, sauceK = k): IngredientComponent[] {
  return [
    ...pick(CHEESES, /^Canadian Cheddar$|Habanero|Monterey/).map((r) => ({ id: `x-${slug(r.name)}`, name: `Add ${pretty(r.name).toLowerCase()}`, default: false, nutrition: scale(r.n, k) })),
    ...pick(PROTEINS, /^Bacon|^Pepperoni/).map((r) => ({ id: `x-${slug(r.name)}`, name: `Add ${pretty(r.name).toLowerCase()}`, default: false, nutrition: scale(r.n, k) })),
    ...pick(VEGGIES, /Avocado|Crispy Onions|Jalape/).map((r) => ({ id: `x-${slug(r.name)}`, name: `Add ${pretty(r.name).toLowerCase()}`, default: false, nutrition: scale(r.n, k) })),
    ...pick(SAUCES, /Mayonnaise|Garlic Aioli|Chipotle|Peppercorn Ranch|Honey Mustard|Sweet Onion|House Sandwich|Hot Honey/).map((r) => ({
      id: `x-${slug(r.name)}`,
      name: `Add ${pretty(r.name).toLowerCase()}`,
      default: false,
      nutrition: scale(r.n, sauceK),
    })),
  ]
}
function withDefaults(name: string, category: MealCategory, n: Nutrition, extras: IngredientComponent[]): IngredientComponent[] {
  const probe: FixedItem = { id: 'probe', name, kind: 'fixed', category, nutrition: n }
  return [...componentsFor(probe).filter((c) => c.default !== false), ...extras]
}

// --- Items ------------------------------------------------------------------------------------------
const newId = idMaker('sub')
const items: any[] = [
  {
    id: 'sub-build',
    name: 'Build Your Sub (6")',
    kind: 'builder',
    category: 'Sandwiches',
    description: 'Pick a bread, proteins, cheese, vegetables and sauces — every option uses Subway Canada\'s official 6" values.',
    groups: subBuilder(false),
  },
  {
    id: 'sub-build-footlong',
    name: 'Build Your Footlong',
    kind: 'builder',
    category: 'Sandwiches',
    description: 'A footlong is two 6" servings of every ingredient, per Subway\'s nutrition tables.',
    groups: subBuilder(true),
  },
  {
    id: 'sub-build-salad',
    name: 'Build Your Salad',
    kind: 'builder',
    category: 'Salads',
    description: 'Salad vegetables plus your choice of protein, cheese, extras and dressing (salads get a double portion of sauce).',
    groups: saladBuilder(),
  },
]

function push(name: string, category: MealCategory, versions: { label: string; n: Nutrition; comps?: IngredientComponent[] }[], hint?: string) {
  const def = versions[0]
  const tags = tagsFor(name, def.n)
  if (/veggie|three cheese|cheese & egg/i.test(name) && !tags.includes('vegetarian')) tags.push('vegetarian')
  const it: any = { id: newId(name), name, kind: 'fixed', category, ...(tags.length ? { tags } : {}), nutrition: def.n }
  if (versions.length > 1) {
    it.defaultSize = def.label
    it.sizes = versions.map((v) => ({ label: v.label, nutrition: v.n, ...(v.comps ? { components: v.comps } : {}) }))
  } else {
    it.serving = def.label
    if (def.comps) it.components = def.comps
  }
  void hint
  items.push(it)
}
const sixAndFoot = (name: string, cat: MealCategory, n: Nutrition, hint: string) => [
  { label: '6"', n, comps: withDefaults(hint, cat, n, addOns(1)) },
  { label: 'Footlong', n: scale(n, 2), comps: withDefaults(hint, cat, scale(n, 2), addOns(2)) },
]

for (const r of rows) {
  const name = r.name.replace(/\s*\(includes Mayonnaise\)/, '').replace(/®/g, '')
  if (r.section === 'SANDWICHES') {
    if (r.group === 'Snackwiches') {
      push(`${name} Snackwich`, 'Sandwiches', [{ label: '1 snackwich (ciabatta)', n: r.n, comps: withDefaults(`${name} sandwich`, 'Sandwiches', r.n, addOns(1)) }])
    } else {
      const fresh = /Fresh Fit/.test(r.group)
      const nm = `${name}${fresh ? ' (Fresh Fit)' : ''}`
      push(nm, 'Sandwiches', sixAndFoot(nm, 'Sandwiches', r.n, `${name} sub sandwich`))
    }
  } else if (r.section === 'WRAPS') {
    push(`${name} Wrap`, 'Wraps', [{ label: '1 wrap', n: r.n, comps: withDefaults(`${name} wrap`, 'Wraps', r.n, addOns(1)) }])
  } else if (r.section === 'SALADS') {
    push(`${name} Salad`, 'Salads', [{ label: '1 salad (no dressing)', n: r.n, comps: withDefaults(`${name} salad`, 'Salads', r.n, addOns(1, 2)) }])
  } else if (r.section === 'POWER BOWLS') {
    const nm = `${name.replace(/^Classic /, '').replace(/chicken/, 'Chicken')} Power Bowl`
    push(nm, 'Bowls & Burritos', [{ label: '1 bowl', n: r.n, comps: withDefaults(nm, 'Bowls & Burritos', r.n, addOns(1, 2)) }])
  } else if (r.section === 'BREAKFAST') {
    if (/Wraps/.test(r.group)) push(`${name} Breakfast Wrap`, 'Breakfast', [{ label: '1 wrap', n: r.n, comps: withDefaults(`${name} breakfast wrap`, 'Breakfast', r.n, addOns(1)) }])
    else if (/Ciabatta/.test(r.group)) push(`${name} Breakfast Ciabatta`, 'Breakfast', [{ label: '1 sandwich', n: r.n, comps: withDefaults(`${name} breakfast sandwich`, 'Breakfast', r.n, addOns(1)) }])
    else push(`${name} Breakfast Sub`, 'Breakfast', sixAndFoot(name, 'Breakfast', r.n, `${name} breakfast sandwich`))
  } else if (r.section === 'DESSERTS & SIDES') {
    if (/Soup/.test(r.group)) push(`${name} Soup`, 'Sides', [{ label: '8 oz bowl', n: r.n }])
    else if (/Sides/.test(r.group)) push(name, 'Sides', [{ label: '1 serving', n: r.n }])
    else push(name.replace(/^Mini Cookie, (.*?)( Cookie)?$/, 'Mini $1 Cookie'), 'Desserts', [{ label: '1 cookie', n: r.n }])
  }
}

writeMenu({
  file: 'subway',
  exportName: 'subway',
  meta: { id: 'subway', name: 'Subway', cuisine: 'Sandwiches · Build-your-own', accent: '#16a34a', segment: 'Build-Your-Own' },
  items,
  hasBuilder: true,
  order: ['Sandwiches', 'Wraps', 'Salads', 'Bowls & Burritos', 'Breakfast', 'Sides', 'Desserts'],
  source: [
    "Subway Canada — complete menu from Subway's official nutrition data tables",
    '(October 2026, linked from subway.com/en-ca/menunutrition/nutrition; extracted',
    'by fetch-subway.cjs). Builders use the official per-6" ingredient values (a',
    'footlong is two 6" servings; salads take double sauce). Signature items use the',
    'published totals, with official add-ons. Generated by scripts/menus/gen-subway.ts.',
  ],
})
