// List how every restaurant and dish is filed by cuisine, to check the
// cuisine chips by eye: each restaurant's own chips (Home), then how many of
// its dishes each dish cuisine picks up (Search), with a few example names.
//
//   run from the repo root: audit-cuisines.ts [restaurant id …]
import { restaurants } from '../../src/data'
import { CUISINES, RESTAURANT_CUISINES, cuisinesOf, restaurantCuisines } from '../../src/lib/cuisine'

const want = process.argv.slice(2)
const label = (id: string) => RESTAURANT_CUISINES.find((c) => c.id === id)?.label ?? id

for (const r of restaurants) {
  if (want.length && !want.includes(r.id)) continue
  const items = r.items.length ? r.items : ((await r.loadItems?.()) ?? [])
  const chips = restaurantCuisines(r).map(label).join(', ') || '—'
  console.log(`\n## ${r.name}  [${r.cuisine}]  → ${chips}`)
  const byCuisine = new Map<string, string[]>()
  for (const it of items) for (const c of cuisinesOf(r, it)) byCuisine.set(c, [...(byCuisine.get(c) ?? []), it.name])
  for (const c of CUISINES) {
    const names = byCuisine.get(c.id)
    if (names) console.log(`   ${c.label.padEnd(15)} ${String(names.length).padStart(3)}/${items.length}  ${names.slice(0, 6).join(' | ')}`)
  }
}
