// Crawl A&W Canada's public menu API and save every item (including each
// size / variant option) with its published nutrition and ingredient list.
//
//   node scripts/menus/fetch-aw.cjs
const fs = require('fs')
const path = require('path')

const BASE = 'https://web.aw.ca/api/menu/'

async function get(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url)
    if (res.ok) return res.json()
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
  }
  throw new Error(`request failed: ${url}`)
}

;(async () => {
  const menu = await get(BASE)
  const items = {}
  const listed = []
  const queue = []
  for (const [category, sec] of Object.entries(menu)) {
    for (const it of sec.items) {
      listed.push({ category, slug: it.slug, subcategory: it.subcategory || '' })
      queue.push(it.slug)
    }
  }
  while (queue.length) {
    const slug = queue.shift()
    if (slug in items) continue
    items[slug] = null
    const d = await get(BASE + encodeURIComponent(slug))
    if (!d || !d.item) continue
    items[slug] = {
      slug,
      name: d.item,
      category: d.category,
      subcategory: d.subcategory || '',
      servingsize: d.servingsize,
      calories: +d.calories,
      fat: +d.fat,
      satfat: +d.satfat,
      carbohydrates: +d.carbohydrates,
      fibre: +d.fibre,
      sugar: +d.sugar,
      protein: +d.protein,
      sodium: +d.sodium,
      components: (d.components || []).map((c) => c.en && c.en.name).filter(Boolean),
      options: (d.options || []).map((o) => o.slug),
      copy: d.copy_en || '',
    }
    for (const o of items[slug].options) if (!(o in items)) queue.push(o)
  }
  const out = { listed, items: Object.fromEntries(Object.entries(items).filter(([, v]) => v)) }
  fs.mkdirSync(path.join(__dirname, 'raw'), { recursive: true })
  fs.writeFileSync(path.join(__dirname, 'raw', 'aw.json'), JSON.stringify(out))
  console.log(`aw: listed ${listed.length}, unique items ${Object.keys(out.items).length}`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
