// Attach product photos from images/<file>.json (see fetch-images.cjs) to menu
// items whose name matches the photo's product name: exactly, without a
// parenthetical, as the start of a longer name, or with the same words in any
// order (one extra word allowed, or only size words for a one-word name). A single item never takes a combo / pack /
// box photo. Used by writeMenu (lib.ts) and the McDonald's generator.
import fs from 'fs'

const normName = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[®™©]/g, '')
    .replace(/[^a-z0-9&]+/g, ' ')
    .replace(/\band\b/g, '&')
    .replace(/\bmtn\b/g, 'mountain')
    .replace(/\s+/g, ' ')
    .trim()

const STOP = new Set(['&', 'of', 'the', 'with', 'a', 'side', 'new', 'single', 'regular', 'large', 'small', 'medium'])
const FORMS = new Set(['wrap', 'salad', 'bowl', 'sub', 'sandwich', 'pizza', 'burrito', 'taco', 'quesadilla', 'soup', 'poutine', 'pita', 'ciabatta', 'shake', 'smoothie', 'cookie', 'fries', 'nachos', 'pasta', 'sundae', 'blizzard', 'cone', 'float', 'latte', 'tea', 'coffee', 'muffin', 'bagel', 'donut', 'combo'])
const MULTI =/\b(combo|pack|box|bucket|platter|family|meal)\b/

function attachImages(file, items) {
  const path = `scripts/menus/images/${file}.json`
  if (!fs.existsSync(path)) return
  const raw = JSON.parse(fs.readFileSync(path, 'utf8'))
  const map = {}
  for (const [k, v] of Object.entries(raw)) if (!map[normName(k)]) map[normName(k)] = v
  const keys = Object.keys(map)
  // Items whose closest photo shows a different dish (images/exclude.json).
  const exclude = fs.existsSync('scripts/menus/images/exclude.json')
    ? new Set((JSON.parse(fs.readFileSync('scripts/menus/images/exclude.json', 'utf8'))[file] || []).map(normName))
    : new Set()
  let found = 0
  for (const it of items) {
    delete it.image
    const n = normName(it.name)
    if (exclude.has(n)) continue
    const bare = normName(it.name.replace(/\([^)]*\)/g, ''))
    let url = map[n] || map[bare]
    // A one-word name ("Banana") only takes a longer name's photo when the extra
    // words are sizes ("Latte Medium"), never another dish ("Banana Split").
    const single = !bare.includes(' ')
    const sizeOnly = (rest) => rest.split(' ').every((t) => STOP.has(t))
    if (!url && bare.length >= 3) {
      const k = keys
        .filter((x) => {
          if (!x.startsWith(bare + ' ')) return false
          const rest = x.slice(bare.length + 1)
          // "Berry Smoothie" never takes "Berry Smoothie Bowl"'s photo.
          return single ? sizeOnly(rest) : !rest.split(' ').some((t) => FORMS.has(t))
        })
        .sort((a, b) => a.length - b.length)[0]
      if (k) url = map[k]
    }
    if (!url && bare.length >= 3) {
      const words = bare.split(' ').filter((w) => !STOP.has(w))
      const multi = MULTI.test(bare)
      const k = keys
        .filter((x) => multi || !MULTI.test(x))
        .map((x) => ({ x, w: x.split(' ').filter((t) => !STOP.has(t)) }))
        .filter(
          ({ w }) =>
            words.length > 0 &&
            words.every((t) => w.includes(t)) &&
            w.length <= words.length + (single ? 0 : 1) &&
            !w.some((t) => FORMS.has(t) && !words.includes(t)),
        )
        .sort((a, b) => a.w.length - b.w.length || a.x.length - b.x.length)[0]
      if (k) url = map[k.x]
    }
    if (!url && bare.length >= 3) {
      // The photo's name is contained in the item's name ("Egg BLT Bagel" for "Egg BLT Bagel with Plain Bagel").
      // Never across product types: a wrap doesn't take the sub's photo.
      const words = new Set(bare.split(' '))
      const forms = [...words].filter((t) => FORMS.has(t))
      const k = keys
        .filter((x) => !MULTI.test(x) || MULTI.test(bare))
        .map((x) => ({ x, w: x.split(' ').filter((t) => !STOP.has(t)) }))
        .filter(({ w }) => w.length >= 2 && w.every((t) => words.has(t)) && (!w.some((t) => FORMS.has(t)) || forms.every((f) => w.includes(f))))
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
