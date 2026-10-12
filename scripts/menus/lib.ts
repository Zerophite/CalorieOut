// Shared helpers for the menu generators: id slugs, tags, and writing the
// restaurant stub (src/data/<file>.ts) plus its lazy-loaded item list
// (src/data/menus/<file>.items.ts).
import * as fs from 'fs'
import type { MealCategory, Nutrition } from '../../src/types'

export interface RestaurantMeta {
  id: string
  name: string
  cuisine: string
  accent: string
  segment: string
}

export const clean = (s: string) =>
  s.replace(/[​®™]/g, '').replace(/^new!\s*/i, '').replace(/\s+/g, ' ').trim()

export const slug = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-|-$/g, '')

/** Allocates unique item ids within one menu. */
export function idMaker(prefix: string) {
  const used = new Set<string>()
  return (name: string) => {
    let id = `${prefix}-${slug(name)}`
    while (used.has(id)) id += '-x'
    used.add(id)
    return id
  }
}

export function tagsFor(name: string, n: Nutrition): string[] {
  const tags: string[] = []
  if (n.protein >= 25) tags.push('high-protein')
  if (/spicy|habanero|jalape|ghost pepper|nashville|piri/i.test(name)) tags.push('spicy')
  if (/impossible|veggie|plant/i.test(name)) tags.push('vegetarian')
  return tags
}

/** writeFileSync that retries briefly — on Windows a running dev server's file watcher can hold a lock. */
function writeFile(file: string, text: string) {
  for (let attempt = 0; ; attempt++) {
    try {
      fs.writeFileSync(file, text)
      return
    } catch (e) {
      if (attempt >= 20) throw e
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100)
    }
  }
}

/** A TS string literal: single quotes unless the text contains one. */
const q = (s: string) => (s.includes("'") ? JSON.stringify(s) : `'${s}'`)

/**
 * Write the stub + item files. `source` is the comment block (without `//`)
 * placed above the item list explaining where the numbers come from.
 */
export function writeMenu(opts: {
  file: string
  exportName: string
  meta: RestaurantMeta
  items: any[]
  order: MealCategory[]
  source: string[]
  /** True when the menu includes build-your-own items. */
  hasBuilder?: boolean
}) {
  const { file, exportName, meta: m, order } = opts
  const items = [...opts.items].sort(
    (a, b) =>
      (a.kind === 'builder' ? 0 : 1) - (b.kind === 'builder' ? 0 : 1) ||
      order.indexOf(a.category) - order.indexOf(b.category) ||
      a.name.localeCompare(b.name),
  )
  const body = items.map((it) => '  ' + JSON.stringify(it).replace(/"(\w+)":/g, '$1: ')).join(',\n')
  fs.mkdirSync('src/data/menus', { recursive: true })
  writeFile(
    `src/data/menus/${file}.items.ts`,
    `import { type MenuItem } from '../../types'

${opts.source.map((l) => `// ${l}`.trimEnd()).join('\n')}
export const items: MenuItem[] = [
${body},
]
`,
  )
  writeFile(
    `src/data/${file}.ts`,
    `import { type Restaurant } from '../types'

// ${m.name} — ${items.length} products, loaded on demand from ./menus.
export const ${exportName}: Restaurant = {
  id: ${q(m.id)},
  name: ${q(m.name)},
  cuisine: ${q(m.cuisine)},
  accent: ${q(m.accent)},
  segment: ${q(m.segment)},
  dataSource: 'official',
  items: [],
  itemCount: ${items.length},
  hasBuilder: ${opts.hasBuilder ? 'true' : 'false'},
  loadItems: () => import('./menus/${file}.items').then((m) => m.items),
}
`,
  )
  const byCat: Record<string, number> = {}
  items.forEach((i) => (byCat[i.category] = (byCat[i.category] ?? 0) + 1))
  console.log(`${m.name}: ${items.length} products (${items.filter((i) => i.sizes).length} with sizes)`, byCat)
}
