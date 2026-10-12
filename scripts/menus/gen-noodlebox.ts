// Generate Noodlebox's menu from its official nutritional guide spreadsheet
// (raw/noodlebox.tsv, see fetch-noodlebox.cjs).
//
// Every box, kids' box, side, dessert and drink is listed with official values.
// The guide publishes each protein per 60 g portion, so extra proteins (and a
// fried egg) are add-ons with official values. Spring rolls and gyoza come in
// the piece counts Noodlebox sells.
//
//   run from the repo root: gen-noodlebox.ts
import * as fs from 'fs'
import { componentsFor } from '../../src/data/templates'
import type { FixedItem, IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { idMaker, slug, tagsFor, writeMenu } from './lib'

type Row = { section: string; name: string; serving: string; n: Nutrition }
const rows: Row[] = fs
  .readFileSync('scripts/menus/raw/noodlebox.tsv', 'utf8')
  .replace(/\r/g, '')
  .split('\n')
  .filter(Boolean)
  .map((l) => {
    const [section, name, serving, cal, fat, sodium, carbs, protein, fibre] = l.split('\t')
    const n: Nutrition = { calories: Math.round(+cal), protein: Math.round(+protein), carbs: Math.round(+carbs), fat: Math.round(+fat), sodium: Math.round(+sodium) }
    if (+fibre) n.fiber = Math.round(+fibre)
    // The guide lists 9 g protein for a can of Coke — a typo (the 500 ml bottle has 0 g).
    if (/COKE CLASSIC CAN/.test(name)) n.protein = 0
    return { section: section.trim(), name: name.trim(), serving: serving.trim(), n }
  })

const title = (s: string) =>
  s
    .toLowerCase()
    .replace(/\b([a-z])/g, (c) => c.toUpperCase())
    .replace(/\bBbq\b/g, 'BBQ')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim()

// --- Add-ons (official 60 g protein portions) -------------------------------------------------------
const PROTEIN_LABEL: Record<string, string> = {
  'CRISPY BEEF': 'crispy beef', 'SIRLOIN BEEF': 'sirloin beef', 'CHICKEN BREAST': 'chicken breast', 'CRISPY CHICKEN': 'crispy chicken',
  'BBQ CHAR SIU PORK': 'BBQ char siu pork', 'COOKED PRAWNS': 'prawns', 'FRIED EGG': 'fried egg', 'CRISPY TOFU': 'crispy tofu', 'ORGANIC TOFU': 'organic tofu',
}
const PROTEINS: IngredientComponent[] = rows
  .filter((r) => r.section === 'PROTEINS' && PROTEIN_LABEL[r.name])
  .map((r) => ({ id: `x-${slug(r.name)}`, name: r.name === 'FRIED EGG' ? 'Add a fried egg' : `Add ${PROTEIN_LABEL[r.name]} (60 g)`, default: false, nutrition: r.n }))
const RICE = rows.find((r) => r.name === 'RICE')
const BOX_EXTRAS = [...PROTEINS, ...(RICE ? [{ id: 'x-rice', name: 'Add rice (100 g)', default: false, nutrition: RICE.n }] : [])]

// --- Products -------------------------------------------------------------------------------------------
interface Product { name: string; category: MealCategory; hint: string; extras: IngredientComponent[]; versions: { label: string; n: Nutrition }[] }
const products = new Map<string, Product>()
function add(name: string, category: MealCategory, label: string, n: Nutrition, extras: IngredientComponent[], hint = name) {
  if (!products.has(name)) products.set(name, { name, category, hint, extras, versions: [] })
  products.get(name)!.versions.push({ label, n })
}

for (const r of rows) {
  let m: RegExpMatchArray | null
  switch (r.section) {
    case 'MAIN BOXES':
    case 'KIDS BOXES': {
      const kids = r.section === 'KIDS BOXES'
      let name = title(r.name.replace(/^KIDS\s+/, '').replace(/\bBOX\b\s*/, 'BOX '))
      name = name.replace(/ Box - /, ' Box (').replace(/ - (.+)$/, ' ($1)')
      if (name.includes('(') && !name.endsWith(')')) name += ')'
      name = name.replace(/ Box \(/, ' Box (').replace(/\s+\)/, ')').replace(/ Box$/, ' Box')
      if (kids) name = `Kids' ${name}`
      add(name, 'Bowls & Burritos', '1 box', r.n, BOX_EXTRAS, /rice|honey garlic|sweet & sour|ginger beef|shanghai|butter chicken/i.test(name) ? `${name} rice bowl` : `${name} noodle bowl`)
      break
    }
    case 'SIDES (Sauce included)': {
      if ((m = r.name.match(/^(.*?)\s*-\s*(\d) PC$/))) add(title(m[1]), /SPRING ROLL/.test(m[1]) || /GYOZA/.test(m[1]) ? 'Sides' : 'Sides', `${m[2]} pc`, r.n, [])
      else if (/DESSERT|NANAIMO|DUBAI/.test(r.name)) add(title(r.name), 'Desserts', '1 piece', r.n, [])
      else add(title(r.name), 'Sides', r.serving.replace(/\s*EA\b/i, ' pc').replace(/\s+/g, ' '), r.n, [])
      break
    }
    case 'BUBBLE TEA':
      add(title(r.name), 'Drinks', '700 ml', r.n, [], `${title(r.name)} bubble tea`)
      break
    case 'SODAS': {
      const name = title(r.name.replace(/^SODA |^DRINK ENERGY /, '').replace(/ CAN$/, ''))
        .replace(/^Coke Classic$/, 'Coca-Cola').replace(/^Coke Diet$/, 'Diet Coke').replace(/^Coke Zero$/, 'Coke Zero Sugar')
      add(name, 'Drinks', r.serving.replace(/\s+/g, ' '), r.n, [])
      break
    }
  }
}

const newId = idMaker('nbx')
const items: any[] = []
for (const p of products.values()) {
  const comps = (n: Nutrition) => {
    const probe: FixedItem = { id: 'probe', name: p.hint, kind: 'fixed', category: p.category, nutrition: n }
    const base = componentsFor(probe)
    const c = p.extras.length ? [...base.filter((x) => x.default !== false), ...p.extras] : base
    return c.length ? c : undefined
  }
  const def = p.versions[0]
  const tags = tagsFor(p.name, def.n)
  if (/tofu|mac & cheese|spring roll|cheese balls|tea$|naan/i.test(p.name) && !/chicken|beef|pork|prawn/i.test(p.name) && p.category !== 'Drinks' && !tags.includes('vegetarian')) tags.push('vegetarian')
  const it: any = { id: newId(p.name), name: p.name, kind: 'fixed', category: p.category, ...(tags.length ? { tags } : {}), nutrition: def.n }
  if (p.versions.length > 1) {
    it.defaultSize = def.label
    if (p.versions.every((v) => / pc$/.test(v.label))) it.sizeTitle = 'Pieces'
    it.sizes = p.versions.map((v) => {
      const c = comps(v.n)
      return { label: v.label, nutrition: v.n, ...(c ? { components: c } : {}) }
    })
  } else {
    it.serving = def.label
    const c = comps(def.n)
    if (c) it.components = c
  }
  items.push(it)
}

writeMenu({
  file: 'noodlebox',
  exportName: 'noodlebox',
  meta: { id: 'noodle-box', name: 'Noodlebox', cuisine: 'Asian noodles · Stir-fry', accent: '#dc2626', segment: 'Fast Food' },
  items,
  order: ['Bowls & Burritos', 'Sides', 'Desserts', 'Drinks'],
  source: [
    "Noodlebox — complete menu from Noodlebox's official nutritional guide",
    '(NoodleboxNAGuide spreadsheet linked from noodlebox.ca, fetched by fetch-noodlebox.cjs).',
    'Extra proteins use the guide\'s 60 g values. Generated by scripts/menus/gen-noodlebox.ts.',
  ],
})
