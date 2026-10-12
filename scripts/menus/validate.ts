import { restaurants } from '../../src/data/index'
import { componentsFor, recipeFor } from '../../src/data/templates'

const F = ['calories', 'protein', 'carbs', 'fat', 'sodium'] as const
let items = 0
const problems: string[] = []
const archetypes: Record<string, number> = {}

for (const r of restaurants) {
  const menu = r.loadItems ? await r.loadItems() : r.items
  if (r.loadItems && r.itemCount !== menu.length)
    problems.push(`${r.name}: itemCount ${r.itemCount} but loaded ${menu.length}`)
  for (const base of menu) {
    if (base.kind !== 'fixed') continue
    const variants = base.sizes && base.sizes.length > 1
      ? base.sizes.map((s) => ({ ...base, name: `${base.name} [${s.label}]`, nutrition: s.nutrition, components: s.components, ingredients: s.ingredients ?? base.ingredients, sizes: undefined }))
      : [base]
    for (const it of variants) {
    items++
    const comps = componentsFor(it)
    const on = comps.filter((c) => c.default !== false)
    const extras = comps.filter((c) => c.default === false)
    const first = recipeFor(it).ings.map((g) => g.name).join(' + ')
    archetypes[first.split(' + ')[0]] = (archetypes[first.split(' + ')[0]] ?? 0) + 1
    for (const f of F) {
      const sum = on.reduce((s, c) => s + c.nutrition[f], 0)
      if (Math.round(sum) !== Math.round(it.nutrition[f]))
        problems.push(`${r.name} / ${it.name}: ${f} sums to ${sum}, published ${it.nutrition[f]}`)
    }
    for (const c of comps)
      for (const f of F)
        if (c.nutrition[f] < 0) problems.push(`${r.name} / ${it.name}: ${c.name} has negative ${f}`)
    if (extras.length === 0) problems.push(`${r.name} / ${it.name}: no add-on extras`)
    if (on.length === 0) problems.push(`${r.name} / ${it.name}: no default ingredients`)
    }
  }
}
console.log(`Checked ${items} fixed items across ${restaurants.length} restaurants`)
console.log(`Problems: ${problems.length}`)
for (const p of problems.slice(0, 40)) console.log('  - ' + p)
