// Download Pita Pit Canada's nutrition & allergen guide (linked from
// pitapit.ca/nutrition) and extract it into raw/pitapit.tsv. Requires
// `pdftotext` (xpdf or poppler).
//
//   node scripts/menus/fetch-pitapit.cjs
// Columns: section, name, size, calories, fat, sodium, carbs, protein.
//
// The guide prints each item as a block of size rows (Small / Regular / XL…)
// with the item name on one of those rows or wrapped onto continuation lines,
// and portion units ("1.5 oz", "3 slices") and allergens interleaved; rows are
// grouped into blocks and the name rebuilt from the leftover text.
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')

const PDF = 'https://pitapit.ca/wp-content/uploads/2026/08/Pita-Pit-Nutritionals-Allergen-Guide-Aug-2026-1.pdf'
const SIZES = ['Kids', 'Small', 'Regular', 'Large', 'XL', '1 EA', 'Each', '1 Cookie', 'Regular Cup', 'Large Cup']
const SIZE_RE = /(^|\s)(Kids|Small|Regular|Large|XL|1 EA|Each)(?=\s|$)/
const ALLERGENS = /\b(Gluten|Wheat\/Gluten|Wheat|Milk|Egg|Eggs|Soy|Sesame|Mustard|Sulfites|Sulphites|Fish|Peanuts?|Tree ?nuts?|Crustacean|Shellfish|None)\b,?/gi
const UNIT = /\b\d+(\.\d+)?\s*(oz|Pc|pcs?|slices?|Slices|g|ml|tbsp|tsp|scoops?)\b|\(\d+g\)/gi

;(async () => {
  const res = await fetch(PDF)
  if (!res.ok) throw new Error(`download failed: ${PDF}`)
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pp-'))
  const pdf = path.join(tmp, 'pp.pdf')
  fs.writeFileSync(pdf, Buffer.from(await res.arrayBuffer()))
  execFileSync('pdftotext', ['-table', '-enc', 'UTF-8', pdf, `${pdf}.txt`])

  const out = []
  let section = ''
  let block = null // { rows: [{size, nums}], text: [] }
  let pendingSize = null
  // A page break can separate rows from their name: unnamed rows continuing a
  // size sequence belong to the previous item, otherwise to the next one.
  let prev = null // { name, lastSize, section }
  let orphans = []
  const emit = (name, rows) => {
    for (const r of rows) {
      // Cal, Fat, Sat, Trans, Chol, Carbs, Fibre, Sugar, Protein, Sodium, K, Ca, Fe
      const [cal, fat, , , , carbs, , , protein, sodium] = r.nums
      out.push([section, name, r.size, cal, fat, sodium, carbs, protein].join('\t'))
    }
  }
  const flush = () => {
    if (!block || !block.rows.length) { block = null; return }
    const name = block.text.join(' ').replace(/\s+/g, ' ').replace(/\s*-\s*$/, '').trim()
    const first = SIZES.indexOf(block.rows[0].size)
    if (!name) {
      if (prev && prev.section === section && first > prev.lastSize) {
        emit(prev.name, block.rows)
        prev.lastSize = SIZES.indexOf(block.rows[block.rows.length - 1].size)
      } else orphans.push(...block.rows)
      block = null
      return
    }
    if (orphans.length) {
      emit(name, orphans)
      orphans = []
    }
    emit(name, block.rows)
    prev = { name, lastSize: SIZES.indexOf(block.rows[block.rows.length - 1].size), section }
    block = null
  }

  for (const raw of fs.readFileSync(`${pdf}.txt`, 'utf8').split(/\r?\n/)) {
    let line = raw.replace(/\s+/g, ' ').trim()
    if (!line) continue
    if (/^(NUTRITIONALS|Approved by|Menu Item|\(g\)|IF YOU HAVE|NUTRITIONAL DISCLAIMER|ALLERGEN DISCLAIMER|The |may occur|macronutrient|professional|possible that|accuracy|PIT® is)/.test(line)) continue
    if (/^(CREATED FOR|BUILD YOUR|SNACKS|COOKIES|SMOOTHIES|JUST FRUIT)/.test(line)) {
      flush()
      section = line.replace(/\s+/g, ' ')
      continue
    }
    // Pull out the run of 13 numbers (if any).
    const m = line.match(/(?:^|\s)((?:\d+(?:\.\d+)?|<\d+)(?:\s+(?:\d+(?:\.\d+)?|<\d+)){12})(?=\s|$)/)
    let nums = null
    if (m) {
      nums = m[1].split(/\s+/).map((x) => x.replace('<', ''))
      line = (line.slice(0, m.index) + ' ' + line.slice(m.index + m[0].length)).trim()
    }
    const sm = line.match(SIZE_RE)
    let size = sm ? sm[2] : null
    if (size) line = line.replace(SIZE_RE, ' ')
    const text = line.replace(ALLERGENS, ' ').replace(UNIT, ' ').replace(/[,|]/g, ' ').replace(/\s+/g, ' ').trim()

    if (nums) {
      size = size || pendingSize || 'Regular'
      pendingSize = null
      // A new block starts when the size order restarts.
      if (block && block.rows.length) {
        const last = SIZES.indexOf(block.rows[block.rows.length - 1].size)
        if (SIZES.indexOf(size) <= last || (text && block.named)) flush()
      }
      if (!block) block = { rows: [], text: [], named: false }
      block.rows.push({ size, nums })
      if (text) { block.text.push(text); block.named = true }
    } else if (size) {
      pendingSize = size // the numbers follow on the next line
      if (text && block) block.text.push(text)
    } else if (text && block) {
      block.text.push(text) // wrapped name / unit line
    } else if (text && !block) {
      block = { rows: [], text: [text], named: true }
    }
  }
  flush()
  fs.writeFileSync(path.join(__dirname, 'raw', 'pitapit.tsv'), out.join('\n') + '\n')
  console.log(`pitapit: ${out.length} rows`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
