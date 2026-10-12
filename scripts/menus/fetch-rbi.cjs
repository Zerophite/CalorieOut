// Crawl a Restaurant Brands International chain's public menu (Sanity GraphQL)
// and save every menu item with nutrition, sizes (pickers) and modifiers.
//
//   node scripts/menus/fetch-rbi.cjs <brand>      brand: timhortons | burgerking | firehouse
const fs = require('fs')
const path = require('path')

const BRANDS = {
  timhortons: {
    endpoint: 'https://czqk28jt.apicdn.sanity.io/v1/graphql/prod_th_ca/default',
    skip: /merchandise|tims® at home|tims at home/i,
  },
  burgerking: {
    endpoint: 'https://kjfd81ul.apicdn.sanity.io/v1/graphql/prod_bk_ca/default',
    // Meal/deal/bundle sections only repackage items listed elsewhere.
    skip: /meals?$|deals?$|bundle|buy one|king jr|mix n|for \$/i,
  },
  firehouse: {
    endpoint: 'https://czqk28jt.apicdn.sanity.io/v1/graphql/prod_fhs_ca/default',
    skip: /meals?$|combos?$|deals?$|bundle|catering|platter|box(es)? lunch/i,
  },
}

const brand = process.argv[2]
const cfg = BRANDS[brand]
if (!cfg) {
  console.error(`Unknown brand "${brand}". Use one of: ${Object.keys(BRANDS).join(', ')}`)
  process.exit(1)
}

async function gql(query) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(cfg.endpoint + '?query=' + encodeURIComponent(query))
    if (res.ok) {
      const j = await res.json()
      if (j.errors) throw new Error(JSON.stringify(j.errors).slice(0, 300))
      return j.data
    }
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
  }
  throw new Error('request failed')
}

const NUT = 'calories fat proteins carbohydrates sodium fiber sugar weight'
const CHILDREN = `options{__typename ... on Section{_id name{en}} ... on Picker{_id name{en}} ... on Item{_id name{en}} ... on Combo{_id name{en} mainItem{_id}}}`

const items = new Map()
const placements = []

async function fetchItem(id) {
  if (items.has(id)) return
  items.set(id, null)
  const d = await gql(`query{Item(id:"${id}"){_id name{en} nutrition{${NUT}} nutritionWithModifiers{${NUT}} options{name{en} minAmount maxAmount options{default modifierMultiplier{multiplier prefix{en} modifier{name{en}}} nutrition{${NUT}}}}}}`)
  items.set(id, d.Item)
}

async function walkSection(id, trail) {
  const d = await gql(`query{Section(id:"${id}"){name{en} ${CHILDREN}}}`)
  const sec = d.Section
  if (!sec) return
  const name = (sec.name?.en || '').trim()
  if (cfg.skip.test(name)) return
  const here = [...trail, name]
  for (const c of sec.options || []) await visit(c, here)
}

async function visit(c, trail) {
  if (c.__typename === 'Section') return walkSection(c._id, trail)
  if (c.__typename === 'Item') {
    placements.push({ path: trail, pickerName: null, itemId: c._id })
    return fetchItem(c._id)
  }
  if (c.__typename === 'Combo' && c.mainItem?._id) {
    placements.push({ path: trail, pickerName: c.name?.en, itemId: c.mainItem._id })
    return fetchItem(c.mainItem._id)
  }
  if (c.__typename === 'Picker') {
    const d = await gql(`query{Picker(id:"${c._id}"){name{en} options{option{__typename ... on Item{_id} ... on Combo{mainItem{_id}}}}}}`)
    const p = d.Picker
    if (!p) return
    const ids = (p.options || [])
      .map((o) => (o.option?.__typename === 'Item' ? o.option._id : o.option?.mainItem?._id))
      .filter(Boolean)
    for (const id of ids) {
      placements.push({ path: trail, pickerName: (p.name?.en || '').trim(), itemId: id })
      await fetchItem(id)
    }
  }
}

;(async () => {
  const fm = await gql(`query{FeatureMenu(id:"feature-menu-singleton"){defaultMenu{_id}}}`)
  const menuId = fm.FeatureMenu.defaultMenu._id
  const d = await gql(`query{Menu(id:"${menuId}"){options{__typename ... on Section{_id name{en}}}}}`)
  for (const s of d.Menu.options) if (s.__typename === 'Section') await walkSection(s._id, [])
  const out = { placements, items: Object.fromEntries([...items].filter(([, v]) => v)) }
  fs.mkdirSync(path.join(__dirname, 'raw'), { recursive: true })
  fs.writeFileSync(path.join(__dirname, 'raw', `${brand}.json`), JSON.stringify(out))
  console.log(`${brand}: placements ${placements.length}, unique items ${Object.keys(out.items).length}`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
