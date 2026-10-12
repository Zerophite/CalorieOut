// Fetch Kettlemans Bagel's menu (kettlemansbagels.ca/menu, one page per
// category) with each item's published Nutrition Facts into raw/kettlemans.json.
//
//   node scripts/menus/fetch-kettlemans.cjs
// Output: [{ category, name, description, serving, n: { calories, protein, carbs, fat, sodium, fiber } | null }]
const fs = require('fs')
const path = require('path')

const BASE = 'https://www.kettlemansbagels.ca/menu/'
const CATEGORIES = ['classic-bagels', 'specialty-items', 'spreads', 'sandwiches', 'house-favourites', 'salads', 'baked-treats', 'value-menu']
const decode = (s) =>
  s.replace(/&#038;|&amp;/g, '&').replace(/&#8217;|&#039;|&rsquo;/g, "'").replace(/&#8211;|&ndash;/g, '-').replace(/&eacute;/g, 'é').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
const num = (block, label) => {
  const m = block.match(new RegExp(`${label}\\s*([\\d.]+)`, 'i'))
  return m ? +m[1] : 0
}

;(async () => {
  const out = []
  const seen = new Set()
  for (const cat of CATEGORIES) {
    const res = await fetch(BASE + cat + '/', { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!res.ok) throw new Error(`download failed: ${cat} (${res.status})`)
    const html = await res.text()
    for (const card of html.split('class="product-card"').slice(1)) {
      const name = decode((card.match(/<div class="title">([\s\S]*?)<\/div>/) || [])[1] || '')
      if (!name) continue
      const description = decode((card.match(/<div class="description">([\s\S]*?)<\/div>/) || [])[1] || '')
      const label = (card.match(/<div class='wp-nutrition-label'[\s\S]*?<div class='dv-tri'>/) || [])[0]
      let n = null
      let serving = ''
      if (label) {
        serving = decode((label.match(/Serving Size <b>([\s\S]*?)<\/b>/) || [])[1] || '')
        n = {
          calories: num(label, 'Calories <b>'),
          fat: num(label, 'Total Fat'),
          sodium: num(label, 'Sodium'),
          carbs: num(label, 'Total Carbohydrate'),
          fiber: num(label, 'Dietary Fiber'),
          protein: num(label, 'Protein'),
        }
      }
      const key = `${name}|${n ? n.calories : ''}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push({ category: cat, name, description, serving, n })
    }
  }
  fs.mkdirSync(path.join(__dirname, 'raw'), { recursive: true })
  fs.writeFileSync(path.join(__dirname, 'raw', 'kettlemans.json'), JSON.stringify(out, null, 1))
  console.log(`kettlemans: ${out.length} items (${out.filter((i) => i.n).length} with nutrition facts)`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
