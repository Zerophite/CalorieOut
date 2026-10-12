// Attach product photos from images/<file>.json (see fetch-images.cjs) to menu
// items whose name matches the photo's product name: exactly, without a
// parenthetical, as the start of a longer name, or with the same words in any
// order (one extra word allowed). A single item never takes a combo / pack /
// box photo. Used by writeMenu (lib.ts) and the McDonald's generator.
import fs from 'fs'

const normName = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[®™©]/g, '')
    .replace(/[^a-z0-9&]+/g, ' ')
    .replace(/\band\b/g, '&')
    .replace(/\bmtn\b/g, 'mountain')
    .replace(/\s+/g, ' ')
    .trim()

const STOP = new Set(['&', 'of', 'the', 'with', 'a', 'side', 'regular', 'large', 'small', 'medium'])
const MULTI = /\b(combo|pack|box|bucket|platter|family|meal)\b/

function attachImages(file, items) {
  const path = `scripts/menus/images/${file}.json`
  if (!fs.existsSync(path)) return
  const raw = JSON.parse(fs.readFileSync(path, 'utf8'))
  const map = {}
  for (const [k, v] of Object.entries(raw)) if (!map[normName(k)]) map[normName(k)] = v
  const keys = Object.keys(map)
  let found = 0
  for (const it of items) {
    const n = normName(it.name)
    const bare = normName(it.name.replace(/\([^)]*\)/g, ''))
    let url = map[n] || map[bare]
    if (!url && bare.length >= 3) {
      const k = keys.filter((x) => x.startsWith(bare + ' ')).sort((a, b) => a.length - b.length)[0]
      if (k) url = map[k]
    }
    if (!url && bare.length >= 3) {
      const words = bare.split(' ').filter((w) => !STOP.has(w))
      const multi = MULTI.test(bare)
      const k = keys
        .filter((x) => multi || !MULTI.test(x))
        .map((x) => ({ x, w: x.split(' ').filter((t) => !STOP.has(t)) }))
        .filter(({ w }) => words.length > 0 && words.every((t) => w.includes(t)) && w.length <= words.length + 1)
        .sort((a, b) => a.w.length - b.w.length || a.x.length - b.x.length)[0]
      if (k) url = map[k.x]
    }
    if (!url && bare.length >= 3) {
      // The photo's name is contained in the item's name ("Egg BLT Bagel" for "Egg BLT Bagel with Plain Bagel").
      const words = new Set(bare.split(' '))
      const k = keys
        .filter((x) => !MULTI.test(x) || MULTI.test(bare))
        .map((x) => ({ x, w: x.split(' ').filter((t) => !STOP.has(t)) }))
        .filter(({ w }) => w.length >= 2 && w.every((t) => words.has(t)))
        .sort((a, b) => b.w.length - a.w.length)[0]
      if (k) url = map[k.x]
    }
    if (url) {
      it.image = url
      found++
    }
  }
  console.log(`  images: ${found}/${items.length}`)
}

export { attachImages, normName }
