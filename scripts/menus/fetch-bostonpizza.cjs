// Fetch Boston Pizza Canada's nutrition page (bostonpizza.com/en/nutritional-information.html)
// and extract every item's per-variant nutrition into raw/bostonpizza.json.
//
//   node scripts/menus/fetch-bostonpizza.cjs
// Output: [{ category, name, variants: [{ label, calories, protein, carbs, fat, sodium }] }]
const fs = require('fs')
const path = require('path')

const URL = 'https://bostonpizza.com/en/nutritional-information.html'
const decode = (s) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;|&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&eacute;/g, 'é')
    .replace(/&reg;|&trade;|™|®/g, '')
    .replace(/\s+/g, ' ')
    .trim()
const num = (s) => {
  const m = (s || '').match(/-?\d+(\.\d+)?/)
  return m ? +m[0] : null
}

;(async () => {
  const res = await fetch(URL, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`download failed: ${URL} (${res.status})`)
  const html = await res.text()

  const items = []
  // Category blocks: <div data-id=".../menu_categories/<Name>" class="individual-accordion">
  const cats = [...html.matchAll(/data-id="[^"]*\/menu_categories\/([^"]+)" class="individual-accordion"/g)]
  cats.forEach((c, ci) => {
    const block = html.slice(c.index, ci + 1 < cats.length ? cats[ci + 1].index : html.length)
    const category = c[1].replace(/-/g, ' ')
    const cards = block.split('nutrition-recipe-accordian--card-header">').slice(1)
    for (const card of cards) {
      const name = decode(card.slice(0, card.indexOf('</h3>')))
      const variants = []
      for (const v of card.split(/<h4[^>]*>/).slice(1)) {
        const label = decode(v.slice(0, v.indexOf('</h4>')))
        const facts = {}
        for (const li of v.matchAll(/<li class="recipe-description--lists-item">\s*<p>([^<]*)<\/p>\s*<p>([^<]*)<\/p>/g)) facts[decode(li[1]).toLowerCase()] = num(li[2])
        if (facts.calories == null) continue
        variants.push({ label, calories: facts.calories, protein: facts.protein, carbs: facts.carbohydrates, fat: facts.fat, sodium: facts.sodium })
      }
      if (variants.length) items.push({ category, name, variants })
    }
  })

  fs.mkdirSync(path.join(__dirname, 'raw'), { recursive: true })
  fs.writeFileSync(path.join(__dirname, 'raw', 'bostonpizza.json'), JSON.stringify(items, null, 1))
  console.log(`bostonpizza: ${items.length} items, ${items.reduce((a, i) => a + i.variants.length, 0)} variants`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
