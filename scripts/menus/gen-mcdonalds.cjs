// Generate src/data/mcdonalds.ts from McDonald's Canada official data (mcd.json).
const fs = require('fs')
const path = require('path')
const S = path.join(__dirname, 'raw')
const OUT = path.join(__dirname, '../../src/data/mcdonalds.ts')
const rows = JSON.parse(fs.readFileSync(path.join(S, 'mcd.json'), 'utf8'))

const slug = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-|-$/g, '')

function category(src, name) {
  const n = name.toLowerCase()
  if (/poutine/.test(n)) return 'Sides'
  switch (src) {
    case 'McValue':
      if (/fries/.test(n)) return 'Sides'
      if (/cone|pie/.test(n)) return 'Desserts'
      if (/mcmuffin/.test(n)) return 'Breakfast'
      if (/chicken/.test(n)) return 'Chicken'
      return 'Burgers'
    case 'Beef': return 'Burgers'
    case 'Beverages': return 'Drinks'
    case 'Breakfast': return 'Breakfast'
    case 'Chicken': return 'Chicken'
    case 'Desserts & Shakes': return 'Desserts'
    case 'McCafé & Bakery': return /muffin|mcpops|cookie|loaf|donut/.test(n) ? 'Bakery' : 'Coffee'
    case 'Sandwiches & Wraps': return /wrap/.test(n) ? 'Chicken' : 'Burgers'
    case 'Snacks & Sides': return /cookie/.test(n) ? 'Desserts' : 'Sides'
    default: return 'Mains'
  }
}

const isDrink = (src) => src === 'Beverages' || src === 'McCafé & Bakery'

const items = []
const seen = new Map()
for (const r of rows) {
  const [src, rawName, cal, fat, carb, pro, na, fib, sug, size, comps] = r
  let name = rawName.replace(/\*/g, '').replace(/\u200b/g, '').replace(/\s+/g, ' ').trim()
  // Disambiguate items McDonald's lists twice (grilled vs crispy chicken).
  const dupKey = name.toLowerCase()
  if (rows.filter((x) => x[1].replace(/\s+/g, ' ').trim().toLowerCase() === dupKey).length > 1) {
    const grilled = comps.some((c) => /grilled/i.test(c[0]))
    name = `${name} (${grilled ? 'Grilled' : 'Crispy'})`
  }
  let id = 'mcd-' + slug(name)
  if (seen.has(id)) id += '-' + seen.get(id)
  seen.set(id, (seen.get(id) || 1) + 1)

  const cat = category(src, name)
  const tags = []
  if (/mcveggie/i.test(name)) tags.push('vegetarian')
  if (pro >= 25) tags.push('high-protein')
  if (carb <= 10 && cal >= 80) tags.push('low-carb')
  if (/spicy|habanero|buffalo/i.test(name)) tags.push('spicy')

  const unit = isDrink(src) && cat !== 'Bakery' ? 'mL' : 'g'
  const parts = comps
    .filter((c) => c[0] && c[0].trim())
    .map((c) => ({ name: c[0].replace(/\s+/g, ' ').trim(), cal: c[2] }))

  items.push({
    id,
    name,
    kind: 'fixed',
    category: cat,
    serving: size ? `${size} ${unit}` : undefined,
    ...(tags.length ? { tags } : {}),
    nutrition: {
      calories: cal,
      protein: Math.round(pro),
      carbs: Math.round(carb),
      fat: Math.round(fat),
      sodium: Math.round(na),
      ...(fib ? { fiber: fib } : {}),
      ...(sug ? { sugar: sug } : {}),
    },
    parts,
  })
}

require('./attach-images.mjs').attachImages('mcdonalds', items)
require('./reconcile.mjs').reconcileMenu(items)

const body = items
  .map((it) => '    ' + JSON.stringify(it).replace(/"(\w+)":/g, '$1: '))
  .join(',\n')

const ITEMS_OUT = path.join(__dirname, '../../src/data/menus/mcdonalds.items.ts')
fs.mkdirSync(path.dirname(ITEMS_OUT), { recursive: true })
fs.writeFileSync(
  ITEMS_OUT,
  `import { type MenuItem } from '../../types'

// McDonald's Canada — complete menu from McDonald's own nutrition data
// (product pages / nutrition API), retrieved 2026-10-11. \`parts\` are
// McDonald's published per-ingredient calories.
// Generated file: regenerate rather than hand-editing.
export const items: MenuItem[] = [
${body.replace(/^ {4}/gm, '  ')},
]
`,
)
fs.writeFileSync(
  OUT,
  `import { type Restaurant } from '../types'

// McDonald's Canada — ${items.length} items, loaded on demand from ./menus.
export const mcdonalds: Restaurant = {
  id: 'mcdonalds',
  name: "McDonald's",
  cuisine: 'Burgers · Fast food',
  accent: '#f59e0b',
  segment: 'Fast Food',
  dataSource: 'official',
  items: [],
  itemCount: ${items.length},
  hasBuilder: false,
  loadItems: () => import('./menus/mcdonalds.items').then((m) => m.items),
}
`,
)
console.log(`Wrote ${items.length} items to ${OUT}`)
const byCat = {}
items.forEach((i) => (byCat[i.category] = (byCat[i.category] || 0) + 1))
console.log(byCat)
