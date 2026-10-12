// Crawl Tim Hortons Canada's public menu GraphQL (Sanity, dataset prod_th_ca)
// and save every menu item with nutrition, sizes (pickers) and modifiers.
const fs = require('fs')
const path = require('path')
const EP = 'https://czqk28jt.apicdn.sanity.io/v1/graphql/prod_th_ca/default'
const MENU_ID = '2905970d-fa8d-4d25-9c85-6fbea4670a29'
const SKIP_SECTIONS = /merchandise|tims® at home|tims at home/i

async function gql(query) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(EP + '?query=' + encodeURIComponent(query))
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

const items = new Map() // itemId -> item data
const placements = [] // { path, pickerName, itemId }

async function fetchItem(id) {
  if (items.has(id)) return
  items.set(id, null)
  const d = await gql(`query{Item(id:"${id}"){_id name{en} nutrition{${NUT}} nutritionWithModifiers{${NUT}} productHierarchy{L1 L2 L3} options{name{en} minAmount maxAmount options{default modifierMultiplier{multiplier prefix{en} modifier{name{en}}} nutrition{${NUT}}}}}}`)
  items.set(id, d.Item)
}

async function walkSection(id, trail) {
  const d = await gql(`query{Section(id:"${id}"){name{en} ${CHILDREN}}}`)
  const sec = d.Section
  if (!sec) return
  const name = (sec.name?.en || '').trim()
  if (SKIP_SECTIONS.test(name)) return
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
  const d = await gql(`query{Menu(id:"${MENU_ID}"){options{__typename ... on Section{_id name{en}}}}}`)
  for (const s of d.Menu.options) if (s.__typename === 'Section') await walkSection(s._id, [])
  const out = { placements, items: Object.fromEntries([...items].filter(([, v]) => v)) }
  fs.writeFileSync(path.join(__dirname, 'raw', 'tims.json'), JSON.stringify(out))
  console.log(`placements: ${placements.length}, unique items: ${Object.keys(out.items).length}`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
