// Fetch Osmow's official nutrition-calculator dataset (the data behind the
// calculator on osmows.com) into raw/osmows.json.
//
//   node scripts/menus/fetch-osmows.cjs
const fs = require('fs')
const path = require('path')

const URL = 'https://wp.osmows.com/wp-admin/admin-ajax.php?action=dodel_nutri'

;(async () => {
  const res = await fetch(URL)
  if (!res.ok) throw new Error(`request failed: ${URL}`)
  const data = await res.json()
  // Keep only what the generator needs: category → products → component rows.
  const out = data.map((cat) => ({
    category: cat.name,
    products: (cat.children || []).map((p) => ({ title: p.post_title, nutritions: p.nutritions || [] })),
  }))
  fs.mkdirSync(path.join(__dirname, 'raw'), { recursive: true })
  fs.writeFileSync(path.join(__dirname, 'raw', 'osmows.json'), JSON.stringify(out))
  console.log(`osmows: ${out.reduce((s, c) => s + c.products.length, 0)} products`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
