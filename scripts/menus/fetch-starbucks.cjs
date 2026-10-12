// Fetch Starbucks Canada's ordering menu and each product's per-size
// nutrition (the data behind starbucks.ca/menu) into raw/starbucks.json.
//
//   node scripts/menus/fetch-starbucks.cjs
const fs = require('fs')
const path = require('path')

const BASE = 'https://www.starbucks.ca/apiproxy/v1/ordering'
const HEADERS = { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36' }

async function get(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { headers: HEADERS })
    if (res.ok) return res.json()
    await new Promise((r) => setTimeout(r, 600 * (attempt + 1)))
  }
  throw new Error(`request failed: ${url}`)
}

const fact = (n, id) => {
  const top = (n.additionalFacts || []).find((f) => f.id === id)
  if (top) return top.value
  for (const f of n.additionalFacts || []) for (const s of f.subfacts || []) if (s.id === id) return s.value
  return null
}

;(async () => {
  const menu = await get(`${BASE}/menu`)
  const found = new Map() // key -> { productNumber, formCode, path }
  const walk = (node, trail) => {
    const here = node.name ? [...trail, node.name] : trail
    for (const p of node.products || []) {
      const key = `${p.productNumber}/${p.formCode}`
      if (!found.has(key)) found.set(key, { productNumber: p.productNumber, formCode: p.formCode, path: here })
    }
    for (const c of node.children || []) walk(c, here)
  }
  for (const m of menu.menus) if (!/at home/i.test(m.name)) walk(m, [])

  const items = []
  const queue = [...found.values()]
  async function worker() {
    while (queue.length) {
      const p = queue.shift()
      let d
      try {
        d = await get(`${BASE}/${p.productNumber}/${p.formCode}`)
      } catch (e) {
        console.warn(`skipping ${p.productNumber}/${p.formCode}: ${e.message}`)
        continue
      }
      await new Promise((r) => setTimeout(r, 1200)) // stay well under the rate limit
      const prod = d.products && d.products[0]
      if (!prod) continue
      items.push({
        name: prod.name,
        formCode: prod.formCode,
        productType: prod.productType,
        path: p.path,
        sizes: (prod.sizes || [])
          .filter((s) => s.nutrition && s.nutrition.calories)
          .map((s) => ({
            name: s.name,
            default: !!s.default,
            serving: (s.nutrition.servingSize && s.nutrition.servingSize.displayValue || '').trim(),
            calories: +s.nutrition.calories.displayValue,
            fat: fact(s.nutrition, 'totalFat'),
            carbs: fact(s.nutrition, 'totalCarbs'),
            protein: fact(s.nutrition, 'protein'),
            sodium: fact(s.nutrition, 'sodium'),
          })),
      })
    }
  }
  await worker()
  fs.mkdirSync(path.join(__dirname, 'raw'), { recursive: true })
  fs.writeFileSync(path.join(__dirname, 'raw', 'starbucks.json'), JSON.stringify(items))
  console.log(`starbucks: ${items.length} products`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
