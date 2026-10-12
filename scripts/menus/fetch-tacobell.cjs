// Fetch Taco Bell Canada's interactive nutrition menu data (the Nutritionix
// menu linked from tacobell.ca) into raw/tacobell.json.
//
//   node scripts/menus/fetch-tacobell.cjs
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const URL = 'https://nix-vue-inm.s3.amazonaws.com/restaurant/taco-bell-canada/data/menu-latest.json.gz'

;(async () => {
  const res = await fetch(URL)
  if (!res.ok) throw new Error(`download failed: ${URL} (${res.status})`)
  let buf = Buffer.from(await res.arrayBuffer())
  if (buf[0] === 0x1f && buf[1] === 0x8b) buf = zlib.gunzipSync(buf)
  const data = JSON.parse(buf.toString('utf8'))
  // Keep only what the generator needs (drops allergen text and translations).
  const slim = {
    generatedAt: data.generatedAt,
    categories: data.categories.map(({ id, name, items }) => ({ id, name, items })),
    templates: data.templates.map(({ id, name, groups }) => ({ id, name, groups })),
    groups: data.groups.map(({ id, name, displayName, multipleSelect, modifiers }) => ({ id, name, displayName, multipleSelect, modifiers })),
    items: data.items
      .filter((i) => i.isActive)
      .map(({ id, name, templateId, categoryId, servingUnitName, defaultModifiers, nutrition }) => ({ id, name, templateId, categoryId, servingUnitName, defaultModifiers, nutrition })),
    modifiers: data.modifiers.map(({ id, name, isActive, nutrition }) => ({ id, name, isActive, nutrition })),
  }
  fs.mkdirSync(path.join(__dirname, 'raw'), { recursive: true })
  fs.writeFileSync(path.join(__dirname, 'raw', 'tacobell.json'), JSON.stringify(slim))
  console.log(`tacobell: ${slim.items.length} active items, ${slim.modifiers.length} ingredients (data of ${data.generatedAt})`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
