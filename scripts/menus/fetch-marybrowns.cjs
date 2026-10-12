// Download Mary Brown's nutrition PDF (linked from marybrowns.com/menu) and
// extract its table into raw/marybrowns.tsv. Requires `pdftotext` (xpdf or
// poppler) on the PATH.
//
//   node scripts/menus/fetch-marybrowns.cjs
// Columns: section, name, serving, calories, fat, sodium, carbs, protein — all
// values PER SERVING as published (e.g. "Large" fries = 2 servings).
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')

const PDF = 'https://marybrowns.com/wp-content/uploads/Mary-Browns-Allergen-and-Nutritionals-July-2026.pdf'

;(async () => {
  const res = await fetch(PDF)
  if (!res.ok) throw new Error(`download failed: ${PDF}`)
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-'))
  const pdf = path.join(tmp, 'mb.pdf')
  fs.writeFileSync(pdf, Buffer.from(await res.arrayBuffer()))
  execFileSync('pdftotext', ['-table', '-enc', 'UTF-8', pdf, `${pdf}.txt`])

  const rows = []
  let section = ''
  for (const raw of fs.readFileSync(`${pdf}.txt`, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    if (/^[A-Z &]+$/.test(line)) {
      section = line
      continue
    }
    const cols = line.split(/\s{2,}/)
    if (cols.length < 12) continue
    const nums = cols.slice(-11) // grams, cal, fat, sat, trans, chol, sodium, carbs, fibre, sugar, protein
    if (nums.some((x) => Number.isNaN(+x))) continue
    let serving = cols[cols.length - 12].replace(/\s+/g, ' ')
    let name = cols.slice(0, -12).join(' ').replace(/\s+/g, ' ').trim()
    // "Big Mary 1  serving" splits as name "Big Mary 1" + serving "serving".
    const count = name.match(/^(.*) (\d+)$/)
    if (/^servings?$/.test(serving) && count) [name, serving] = [count[1], `${count[2]} ${serving}`]
    const [, cal, fat, , , , sodium, carbs, , , protein] = nums
    rows.push([section, name, serving, cal, fat, sodium, carbs, protein].join('\t'))
  }
  fs.writeFileSync(path.join(__dirname, 'raw', 'marybrowns.tsv'), rows.join('\n') + '\n')
  console.log(`marybrowns: ${rows.length} rows`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
