// Collect product photo URLs from each chain's own menu data into
// images/<file>.json ({ "normalized item name": "https://…" }). writeMenu in
// lib.ts attaches them to items with a matching name; the app loads them
// straight from the restaurant's own CDN.
//
//   node scripts/menus/fetch-images.cjs <brand>
const fs = require('fs')
const path = require('path')

const norm = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[®™©]/g, '')
    .replace(/&amp;/g, '&')
    .replace(/[^a-z0-9&]+/g, ' ')
    .trim()

async function getJson(url, init) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { ...init, headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json', ...(init && init.headers) } })
    if (res.ok) return res.json()
    await new Promise((r) => setTimeout(r, 600 * (attempt + 1)))
  }
  throw new Error(`request failed: ${url}`)
}

// Restaurant Brands International chains (Sanity GraphQL).
const SANITY = {
  timhortons: 'https://czqk28jt.apicdn.sanity.io/v1/graphql/prod_th_ca/default',
  burgerking: 'https://kjfd81ul.apicdn.sanity.io/v1/graphql/prod_bk_ca/default',
  firehousesubs: 'https://czqk28jt.apicdn.sanity.io/v1/graphql/prod_fhs_ca/default',
}
async function sanity(endpoint) {
  const map = {}
  for (const type of ['allItems', 'allPickers', 'allCombos']) {
    for (let offset = 0; ; offset += 500) {
      const q = `query{${type}(limit:500, offset:${offset}){name{en} image{asset{url}}}}`
      const d = await getJson(endpoint + '?query=' + encodeURIComponent(q))
      const rows = (d.data && d.data[type]) || []
      for (const r of rows) {
        const url = r.image && r.image.asset && r.image.asset.url
        const name = r.name && r.name.en
        if (url && name && !map[norm(name)]) map[norm(name)] = `${url}?w=480&fm=webp&q=70`
      }
      if (rows.length < 500) break
    }
  }
  return map
}

// Taco Bell Canada: tacobell.ca/en/menu embeds the full catalogue (items[id].media.logo).
async function tacobell() {
  const res = await fetch('https://www.tacobell.ca/en/menu', { headers: { 'User-Agent': 'Mozilla/5.0' } })
  const html = await res.text()
  const s = html.indexOf('__NEXT_DATA__')
  const data = JSON.parse(html.slice(html.indexOf('>', s) + 1, html.indexOf('</script>', s)))
  const items = data.props.pageProps.data.items || {}
  const noImage = data.props.pageProps.data.noImagePicture
  const map = {}
  for (const it of Object.values(items)) {
    const name = (it.title && it.title.en_US) || (it.name && it.name.en_US)
    const url = it.media && it.media.logo
    if (name && url && url !== noImage && !map[norm(name)]) map[norm(name)] = url
  }
  return map
}

// Starbucks: one request to the ordering menu lists every product with its imageURL.
async function starbucks() {
  const menu = await getJson('https://www.starbucks.ca/apiproxy/v1/ordering/menu', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36' },
  })
  const map = {}
  const walk = (node) => {
    for (const p of node.products || []) if (p.imageURL && !map[norm(p.name)]) map[norm(p.name)] = `${p.imageURL}?wid=480&fmt=webp`
    for (const c of node.children || []) walk(c)
  }
  for (const m of menu.menus) walk(m)
  return map
}

// Kettleman's: each product card on kettlemansbagels.ca/menu/<category>/ has a title and photo.
async function kettlemans() {
  const map = {}
  for (const cat of ['classic-bagels', 'specialty-items', 'spreads', 'sandwiches', 'house-favourites', 'salads', 'baked-treats', 'value-menu']) {
    const html = await (await fetch(`https://www.kettlemansbagels.ca/menu/${cat}/`, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text()
    for (const card of html.split('class="product-card"').slice(1)) {
      const img = (card.match(/<img src="([^"]+)"/) || [])[1]
      const title = (card.match(/<div class="title">([\s\S]*?)<\/div>/) || [])[1]
      if (img && title) {
        const name = title.replace(/&#038;|&amp;/g, '&').replace(/&#8217;|&#039;/g, "'").replace(/<[^>]+>/g, '').trim()
        if (!map[norm(name)]) map[norm(name)] = img
      }
    }
  }
  return map
}

// Boston Pizza: each menu category page (bostonpizza.com/en/menu/<category>.html) shows its dishes with photos.
async function bostonpizza() {
  const map = {}
  for (const cat of ['apps-and-shareables', 'bowls-and-salads', 'desserts', 'kids-menu', 'mains', 'pasta', 'pizza', 'sandwiches']) {
    const html = await (await fetch(`https://bostonpizza.com/en/menu/${cat}.html`, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text()
    for (const m of html.matchAll(/src="(\/content\/dam\/bostonpizza\/menu-images\/[^"]*?\/([a-z0-9-]+)\/images\/[^"]+\.(?:png|jpe?g|webp))"/gi)) {
      const [, src, slug] = m
      const name = slug.replace(/-/g, ' ')
      if (!map[norm(name)]) map[norm(name)] = `https://bostonpizza.com${src}`
    }
  }
  return map
}

// A&W: the menu site serves each product's photo from /i/menu/?i=<slug>; slugs come from raw/aw.json.
async function aw() {
  const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'raw', 'aw.json'), 'utf8'))
  const map = {}
  for (const it of Object.values(raw.items || raw)) {
    if (it && it.slug && it.name && !map[norm(it.name)]) map[norm(it.name)] = `https://web.aw.ca/i/menu/?i=${it.slug}&lang=${it.slug}-en`
  }
  return map
}

// Wendy's: the ordering API names each item's photo (baseImageName) on app.wendys.com.
async function wendys() {
  const API = 'https://api.app.prd.wendys.digital/web-client-gateway'
  const COMMON = 'lang=en&cntry=CA&sourceCode=ORDER.WENDYS&version=2.22.2'
  const site = JSON.parse(fs.readFileSync(path.join(__dirname, 'raw', 'wendys.json'), 'utf8')).site.id
  const { menuLists: m } = await getJson(`${API}/menu/getSiteMenu?siteNum=${site}&freeStyleMenu=true&menuChannel=WEB_GUEST&${COMMON}`)
  const map = {}
  for (const x of [...m.menuItems, ...m.salesItems]) {
    const name = x.displayName || x.name
    const img = x.baseImageName || x.productGroupId
    if (name && img && !map[norm(name)]) map[norm(name)] = `https://app.wendys.com/unified/assets/menu/productGroups/${img}_medium_CA_en.png`
  }
  return map
}

// KFC Canada: the ordering catalogue gives every product's photo (imageName).
async function kfc() {
  const cat = await getJson(
    'https://orderserv-kfc-na-olo-api.yum.com/dev/v1/catalogs/a087813cef074625a8341e162356a1e5/KFCCanadaMenu-Generic-en',
    { headers: { Origin: 'https://www.kfc.ca' } },
  )
  const map = {}
  const walk = (node) => {
    if (Array.isArray(node)) return node.forEach(walk)
    if (!node || typeof node !== 'object') return
    const url = typeof node.imageName === 'string' && /^https:/.test(node.imageName) ? node.imageName : null
    if (url) {
      const names = [node.name, ...(node.dname || []).map((d) => d.value)]
      for (const n of names) if (n && !map[norm(n)]) map[norm(n)] = `${url}?w=480&fm=webp&q=70`
    }
    for (const v of Object.values(node)) if (typeof v === 'object') walk(v)
  }
  walk(cat)
  return map
}

// Freshii: each menu category page (freshii.com/menu/<category>/) lists its dishes, photo then name.
async function freshii() {
  const map = {}
  for (const cat of ['burrito', 'energii-bowls', 'poke-bowls', 'salads', 'smoothiis', 'wraps']) {
    const html = await (await fetch(`https://freshii.com/menu/${cat}/`, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text()
    let img = null
    for (const m of html.matchAll(/data-src="(https:\/\/freshii\.com\/wp-content\/uploads\/[^"]+)"|<h[2-5][^>]*>([^<]{3,60})<\/h[2-5]>/g)) {
      if (m[1]) img = m[1]
      else if (img) {
        if (!map[norm(m[2])]) map[norm(m[2])] = img
        img = null
      }
    }
  }
  return map
}

// Our item name → the chain's own product name, where the two differ.
const ALIASES = {
  aw: { Latte: 'Latte Small 2 Milk', Tea: 'Teas', Poutine: 'Poutine English Canada' },
  bostonpizza: { 'Deluxe Pizza': 'Deluxe' },
  freshii: {
    'Build Your Bowl': 'Create Your Own Bowl',
    "Buddha's Satay Bowl with Chicken": 'Buddha Satay Bowl',
    "Buddha's Satay Burrito": 'Buddha Satay Burrito',
    'Oaxaca Bowl': 'Oaxaca Bowl',
    'Spicy Buffalo Bowl': 'Spiicy Buffalo Bowl',
    'Spicy Buffalo Burrito': 'Spiicy Buffalo Burrito',
    'Teriyaki Bowl with Chicken': 'Teriyaki Twiist Bowl',
    'Teriyaki Twist Burrito': 'Teriyaki Twiist Burrito',
    'Tuna Poke Bowl': 'Poke Tuna',
    'Spicy Tuna Poke Bowl': 'Poke Tuna',
    'Salmon Poke Bowl': 'Poke Salmon',
    'Spicy Salmon Poke Bowl': 'Poke Salmon',
    'Shrimp Poke Bowl': 'Poke Shrimps',
    'Tofu Poke Bowl': 'Poke Tofu',
    'Berrii Crunchii Salad': 'Berrii Crunch',
    'Fiesta Salad': 'Fiiesta Salad',
    'Fiesta Wrap': 'Fiiesta Wrap',
    'Chocolate Peanut Butter Smoothie': 'Chocolate Peanut Butter',
    'Freshii Green Smoothie': 'Freshii Green',
    'Mixed Berry Smoothie': 'Mixed Berrii',
    'Strawberry Banana Boost Smoothie': 'Strawberrii Banana',
  },
  kfc: {
    'Original Recipe Chicken': '2 Piece Chicken',
    'Original Recipe Tender': 'Go Bucket 1 Original Recipe Tender',
    'Crispy Strips': 'Go Bucket 1 Crispy Strip',
    'Seasoned French Fries': 'Fries',
    'Coleslaw Salad': 'Homestyle Coleslaw',
    'Lipton Brisk Tea': 'Brisk Iced Tea',
  },
}

const BRANDS = {
  freshii,
  kfc,
  wendys,
  aw,
  kettlemans,
  bostonpizza,
  tacobell,
  starbucks,
  timhortons: () => sanity(SANITY.timhortons),
  burgerking: () => sanity(SANITY.burgerking),
  firehousesubs: () => sanity(SANITY.firehousesubs),
}

;(async () => {
  const brand = process.argv[2]
  if (!BRANDS[brand]) throw new Error(`Unknown brand "${brand}". Use one of: ${Object.keys(BRANDS).join(', ')}`)
  const map = await BRANDS[brand]()
  for (const [ours, theirs] of Object.entries(ALIASES[brand] || {})) if (map[norm(theirs)]) map[norm(ours)] = map[norm(theirs)]
  // Drop photos that don't actually load (retired items still listed in a feed).
  const entries = Object.entries(map)
  for (let i = 0; i < entries.length; i += 8) {
    await Promise.all(
      entries.slice(i, i + 8).map(async ([k, url]) => {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }).catch(() => null)
        if (!res || !res.ok || !/^image\//.test(res.headers.get('content-type') || '')) delete map[k]
        if (res && res.body) await res.body.cancel().catch(() => {})
      }),
    )
  }
  const dir = path.join(__dirname, 'images')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `${brand}.json`), JSON.stringify(map, null, 1))
  console.log(`${brand}: ${Object.keys(map).length} images`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
