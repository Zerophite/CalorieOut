// Download Freshii's nutritionals & allergens guide (linked from freshii.com)
// and extract the nutrition tables into raw/freshii.tsv. Requires `pdftotext`
// (xpdf or poppler).
//
//   node scripts/menus/fetch-freshii.cjs
// Columns: section, name, calories, fat, sodium, carbs, protein, fibre.
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')

const PDF = 'https://freshii.com/wp-content/uploads/2026/09/Freshii-Nutritionals-and-Allergens-Guide-EN-092026.pdf'

;(async () => {
  const res = await fetch(PDF, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`download failed: ${PDF}`)
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fr-'))
  const pdf = path.join(tmp, 'fr.pdf')
  fs.writeFileSync(pdf, Buffer.from(await res.arrayBuffer()))
  execFileSync('pdftotext', ['-table', '-enc', 'UTF-8', pdf, `${pdf}.txt`])

  const rows = []
  let section = ''
  for (const raw of fs.readFileSync(`${pdf}.txt`, 'utf8').split(/\r?\n/)) {
    if (/^Allergen\s+Guide/.test(raw.trim())) break // nutrition tables end here
    const line = raw.replace(/\s+/g, ' ').trim()
    if (!line || /^Item |^\(mg\)|Approved by|Revision Date|DISCLAIMER|^Nutrition Guide/.test(line)) continue
    const m = line.match(/^(.*?[A-Za-z)])\s+((?:-?\d+(?:\.\d+)?\s*){8,})$/)
    if (!m) {
      const prev = rows[rows.length - 1]
      // Wrapped names: "Sweet Potato Bites (With hot honey" / "mustard dip)", "… Smoothie" / "Bowl".
      if (prev && (/\([^)]*$/.test(prev[1]) || /^(Smoothie )?Bowl$/.test(line))) prev[1] = `${prev[1]} ${line}`
      else if (line.length < 40 && !/[.:]/.test(line)) section = line
      continue
    }
    const v = m[2].trim().split(' ').map(Number)
    // Columns: cal, fat, sat, trans, chol, carbs, fibre, sugar, protein, sodium, …
    // One row (Kids Cheesy Chicken Pocket) leaves sugar blank: 12 values instead of 13.
    if (v.length === 12 && section === 'Kids Menu') v.splice(7, 0, 0)
    const [cal, fat, , , , carbs, fibre, , protein, sodium] = v
    rows.push([section, m[1].replace(/\s+/g, ' '), cal, fat, sodium, carbs, protein, fibre])
  }
  fs.writeFileSync(path.join(__dirname, 'raw', 'freshii.tsv'), rows.map((r) => r.join('\t')).join('\n') + '\n')
  console.log(`freshii: ${rows.length} rows`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
