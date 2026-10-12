// Generate Mad Radish's menu from its official nutrition info (September 2026,
// madradish.com/nutrition → "View nutrition info"). The PDF draws its text as
// vector outlines, so the tables were transcribed into raw/madradish.tsv and
// every row checked against its macros.
// Columns: section, name, calories, fat, sodium, carbs, protein, fibre.
//
// Salads, hearty bowls and burrito bowls are published without protein or
// dressing, and proteins and dressings are published on their own — so the
// bowls are a builder (bowl + protein + dressing) using only official values,
// and are also listed individually with official proteins and dressings as
// add-ons. Burritos, high-protein and lil' bowls, sandwiches, soups, smoothies
// and snacks are complete as published.
//
//   run from the repo root: gen-madradish.ts
import * as fs from 'fs'
import { componentsFor } from '../../src/data/templates'
import type { BuilderOption, FixedItem, IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { idMaker, slug, tagsFor, writeMenu } from './lib'

type Row = { section: string; name: string; n: Nutrition }
const rows: Row[] = fs
  .readFileSync('scripts/menus/raw/madradish.tsv', 'utf8')
  .replace(/\r/g, '')
  .split('\n')
  .filter(Boolean)
  .map((l) => {
    const [section, name, cal, fat, sodium, carbs, protein, fibre] = l.split('\t')
    return { section, name, n: { calories: +cal, protein: +protein, carbs: +carbs, fat: +fat, sodium: +sodium, fiber: +fibre } }
  })
const of = (section: string) => rows.filter((r) => r.section === section)
const VEG = /tofu|chickpea|vida verde|caesar$|santa fe|bibimbowl|thai chili|smoothie|cookie|tart|focaccia|cake pop|chowder/i

// --- Builder --------------------------------------------------------------------------------------
const opt = (r: Row, extra: Partial<BuilderOption> = {}): BuilderOption => ({ id: slug(r.name), name: r.name, nutrition: r.n, ...extra })
const items: any[] = [
  {
    id: 'mr-build-bowl',
    name: 'Build Your Bowl',
    kind: 'builder',
    category: 'Bowls & Burritos',
    description: "Pick a salad, hearty bowl or burrito bowl, then a protein and a dressing. Every option uses Mad Radish's official values.",
    groups: [
      { id: 'bowl', name: 'Bowl', min: 1, max: 1, options: [...of('BOWLS').map((r) => opt(r)), ...of('BURRITO BOWLS').map((r) => opt({ ...r, name: `${r.name} Burrito Bowl` }))] },
      { id: 'protein', name: 'Protein', min: 0, max: 2, options: of('PROTEINS').map((r) => opt(r, /tofu/i.test(r.name) ? { tags: ['vegan'] } : r.name === 'Lemon-Herb Chicken' ? { recommended: true } : {})) },
      { id: 'dressing', name: 'Dressing', min: 0, max: 2, options: of('DRESSINGS').map((r) => opt(r, /Avocado Tomatillo|Mad Thai/.test(r.name) ? { recommended: true } : {})) },
    ],
  },
]

// --- Fixed items ------------------------------------------------------------------------------------
const PROTEINS: IngredientComponent[] = of('PROTEINS').map((r) => ({ id: `x-${slug(r.name)}`, name: `Add ${r.name}`, default: false, nutrition: r.n }))
const DRESSINGS: IngredientComponent[] = of('DRESSINGS').map((r) => ({ id: `x-${slug(r.name)}`, name: `Add ${r.name} dressing`.replace(/ \(15 g\) dressing$/, ' (15 g)'), default: false, nutrition: r.n }))
const CATEGORY: Record<string, MealCategory> = {
  BOWLS: 'Salads', 'BURRITO BOWLS': 'Bowls & Burritos', BURRITOS: 'Bowls & Burritos', 'HIGH PROTEIN': 'Bowls & Burritos',
  'LIL BOWLS': 'Bowls & Burritos', SOUPS: 'Mains', SANDWICHES: 'Sandwiches', SMOOTHIES: 'Drinks', SNACKS: 'Desserts',
}
const newId = idMaker('mr')
for (const r of rows) {
  const category = CATEGORY[r.section]
  if (!category) continue
  let name = r.name
  if (r.section === 'BURRITOS') name = `${name.replace(/ - (Chicken|Tofu)$/, '')} Burrito${/ - /.test(r.name) ? ` (${r.name.split(' - ')[1]})` : ''}`
  if (r.section === 'BURRITO BOWLS') name = `${name} Burrito Bowl`
  if (/Rosemary Focaccia/.test(name)) name = 'Rosemary Focaccia'
  const base = r.section === 'BOWLS' || r.section === 'BURRITO BOWLS'
  const extras = base ? [...PROTEINS, ...DRESSINGS] : /BURRITOS|LIL BOWLS|SANDWICHES|HIGH PROTEIN/.test(r.section) ? DRESSINGS.slice(0, 6) : []
  const probe: FixedItem = { id: 'probe', name: base ? `${name} salad bowl` : name, kind: 'fixed', category, nutrition: r.n }
  const comps = componentsFor(probe)
  const components = extras.length ? [...comps.filter((c) => c.default !== false), ...extras] : comps
  const tags = tagsFor(name, r.n)
  if (VEG.test(name) && !/chicken|barbacoa|el dorado/i.test(name) && !tags.includes('vegetarian')) tags.push('vegetarian')
  items.push({
    id: newId(name),
    name,
    kind: 'fixed',
    category,
    ...(base ? { description: 'As published, without protein or dressing — add them below.' } : {}),
    ...(tags.length ? { tags } : {}),
    serving: base ? 'bowl only' : r.section === 'SOUPS' ? '12 oz' : '1 serving',
    nutrition: r.n,
    ...(components.length ? { components } : {}),
  })
}

writeMenu({
  file: 'madradish',
  exportName: 'madradish',
  meta: { id: 'bad-radish', name: 'Mad Radish', cuisine: 'Healthy bowls, salads & wraps', accent: '#65a30d', segment: 'Fast Food' },
  items,
  hasBuilder: true,
  order: ['Bowls & Burritos', 'Salads', 'Sandwiches', 'Mains', 'Desserts', 'Drinks'],
  source: [
    "Mad Radish — complete menu from Mad Radish's official nutrition info (September 2026,",
    'transcribed into raw/madradish.tsv). Bowls are published without protein and dressing,',
    'which are official add-ons and builder options. Generated by scripts/menus/gen-madradish.ts.',
  ],
})
