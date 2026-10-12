// Fetch Wendy's Canada's menu (from an Ottawa restaurant) and the official
// nutrition of every ingredient (component) used by its menu items.
//
//   node scripts/menus/fetch-wendys.cjs [lat] [long]     default: Ottawa
const fs = require('fs')
const path = require('path')

const API = 'https://api.app.prd.wendys.digital/web-client-gateway'
const COMMON = 'lang=en&cntry=CA&sourceCode=ORDER.WENDYS&version=2.22.2'
const [lat = '45.4215', long = '-75.6972'] = process.argv.slice(2)

async function get(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url)
    if (res.ok) return res.json()
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
  }
  throw new Error(`request failed: ${url}`)
}

;(async () => {
  const loc = await get(`${API}/LocationServices/rest/nearbyLocations?${COMMON}&lat=${lat}&long=${long}&limit=1`)
  const site = loc.data[0]
  console.log(`Using ${site.address1}, ${site.city} (site ${site.id})`)

  const { menuLists: m } = await get(
    `${API}/menu/getSiteMenu?siteNum=${site.id}&freeStyleMenu=true&menuChannel=WEB_GUEST&${COMMON}`,
  )
  if (m.country !== 'CA') throw new Error(`expected the Canadian menu, got ${m.country}`)

  const subMenus = m.subMenus.map((s) => ({ id: s.subMenuId, name: s.displayName || s.name, menuItems: s.menuItems }))
  const menuItems = m.menuItems.map((x) => ({
    id: x.menuItemId,
    name: x.displayName || x.name,
    defaultItemId: x.defaultItemId,
    salesItemIds: x.salesItemIds,
    selectionMode: x.selectionMode,
    description: x.description,
  }))
  const salesItems = m.salesItems.map((s) => ({
    id: s.salesItemId,
    name: s.displayName || s.name,
    size: s.shortDescription || null,
    category: s.categoryName,
    modifierGroups: s.modifierGroups || [],
    defaultOptions: (s.defaultOptions || []).map((o) => ({ group: o.modifierGroupId, modifier: o.modifierId, quantity: o.defaultQuantity ?? 1 })),
    nutrition: s.nutrition,
  }))
  const modifierGroups = m.modifierGroups.map((g) => ({
    id: g.modifierGroupId,
    name: g.displayName || g.name,
    isBun: g.isBun,
    isMeat: g.isMeat,
    max: g.maximumItems,
    modifiers: g.modifiers,
  }))
  const modifiers = m.modifiers.map((x) => ({
    id: x.modifierId,
    name: x.displayName || x.name,
    internalName: x.name,
    componentId: x.componentId,
  }))

  // Every component that any item's modifier groups can use.
  const usedGroups = new Set(salesItems.flatMap((s) => s.modifierGroups))
  const usedMods = new Set(modifierGroups.filter((g) => usedGroups.has(g.id)).flatMap((g) => g.modifiers))
  const compIds = [...new Set(modifiers.filter((x) => usedMods.has(x.id) && x.componentId).map((x) => x.componentId))]

  const components = {}
  const queue = [...compIds]
  async function worker() {
    while (queue.length) {
      const id = queue.shift()
      const data = encodeURIComponent(JSON.stringify({ siteNum: String(site.id), products: [{ id: '1001', components: [{ id, quantity: 1 }] }] }))
      const r = await get(`${API}/NutritionServices/rest/nutritionalData?data=${data}&channel=WEB&${COMMON}`)
      const d = r.data || {}
      components[id] = { calories: d.calories, totalFat: d.totalFat, carbohydrates: d.carbohydrates, protein: d.protein, sodium: d.sodium }
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()])

  const out = { site: { id: site.id, address: `${site.address1}, ${site.city}` }, subMenus, menuItems, salesItems, modifierGroups, modifiers, components }
  fs.mkdirSync(path.join(__dirname, 'raw'), { recursive: true })
  fs.writeFileSync(path.join(__dirname, 'raw', 'wendys.json'), JSON.stringify(out))
  console.log(`wendys: ${menuItems.length} menu items, ${salesItems.length} sales items, ${compIds.length} components`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
