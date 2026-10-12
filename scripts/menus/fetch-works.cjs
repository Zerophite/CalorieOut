// Download The WORKS' nutritionals & allergens PDF (linked from
// worksburger.com/menu) and extract the nutrition tables into raw/works.tsv.
// Requires `pdftotext` (xpdf or poppler).
//
//   node scripts/menus/fetch-works.cjs
// Columns: section, name, calories, fat, sodium, carbs, protein.
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')

const PDF = 'https://worksburger.com/wp-content/uploads/2026/10/WGB_Nutritionals_and_Allergens_2026V2.pdf'

;(async () => {
  const res = await fetch(PDF)
  if (!res.ok) throw new Error(`download failed: ${PDF}`)
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wk-'))
  const pdf = path.join(tmp, 'wk.pdf')
  fs.writeFileSync(pdf, Buffer.from(await res.arrayBuffer()))
  execFileSync('pdftotext', ['-table', '-enc', 'UTF-8', pdf, `${pdf}.txt`])

  const rows = []
  let section = ''
  let inAllergens = false
  for (const raw of fs.readFileSync(`${pdf}.txt`, 'utf8').split(/\r?\n/)) {
    let line = raw.replace(/\s+/g, ' ').trim()
    if (!line) continue
    if (/^Allergens Updated/.test(line)) { inAllergens = true; continue }
    if (/Calories \(kcal\)/.test(line)) { inAllergens = false; continue }
    if (inAllergens || /^BC\d+$/.test(line)) continue
    line = line.replace(/^\*maple baked beans, coleslaw and jalapeno cornbread not included\s*/, '')
    if (/^[A-Z][A-Z0-9 &/'()-]+(\(.*\))?$/.test(line) && !/\d{2,}/.test(line)) {
      section = line.replace(/\s*\(.*$/, '').trim()
      continue
    }
    const tokens = line.split(' ')
    // Find the first run of >= 10 numbers (calories … protein, then % columns).
    let start = -1
    for (let i = 0; i < tokens.length; i++) {
      let j = i
      while (j < tokens.length && /^-?\d+(\.\d+)?$/.test(tokens[j])) j++
      if (j - i >= 10) { start = i; break }
    }
    // "(1/2 rack pork ribs + 4" — a count after "+" belongs to the name.
    if (start > 0 && tokens[start - 1] === '+') start++
    if (start < 0) {
      // A wrapped name ("brisket)") continues the previous row.
      const prev = rows[rows.length - 1]
      if (prev && /\(|w\/$|\+ \d+$/.test(prev[1]) && !/\)$/.test(prev[1])) prev[1] = `${prev[1]} ${line}`
      continue
    }
    const name = tokens.slice(0, start).join(' ')
    const [cal, fat, , , sodium, , carbs, , , protein] = tokens.slice(start, start + 10)
    rows.push([section, name, cal, fat, sodium, carbs, protein])
  }
  fs.writeFileSync(path.join(__dirname, 'raw', 'works.tsv'), rows.map((r) => r.join('\t')).join('\n') + '\n')
  console.log(`works: ${rows.length} rows`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
