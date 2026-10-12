// Download Manchu Wok's nutrition PDF (linked from manchuwok.com) and extract it
// into raw/manchuwok.tsv. Requires `pdftotext` (xpdf or poppler). The PDF holds
// overlapping copies of its text, so it is read in content order (-raw) and
// identical lines are kept once.
//
//   node scripts/menus/fetch-manchuwok.cjs
// Columns: name, portion, calories, fat, sodium, carbs, protein.
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')

const PDF = 'https://manchuwok.com/wp-content/uploads/2026/04/WOK-BRNDN-NUTRITIONALS-1291371539-ENG-2-1.pdf'

;(async () => {
  const res = await fetch(PDF)
  if (!res.ok) throw new Error(`download failed: ${PDF}`)
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mw-'))
  const pdf = path.join(tmp, 'mw.pdf')
  fs.writeFileSync(pdf, Buffer.from(await res.arrayBuffer()))
  execFileSync('pdftotext', ['-raw', '-enc', 'UTF-8', pdf, `${pdf}.txt`])

  const seen = new Set()
  const rows = []
  for (const raw of fs.readFileSync(`${pdf}.txt`, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    // "<name> <portion> <14 numbers> a…" — portion like 5oz / 16 oz / 375g, or none.
    const m = line.match(/^(.+?)\s+(\d+ ?oz|\d+g)?\s*((?:-?\d+(?:\.\d+)?\s+){13}-?\d+(?:\.\d+)?)(\s+a)*$/)
    if (!m || seen.has(line)) continue
    seen.add(line)
    const [cal, fat, , , , sodium, carbs, , , protein] = m[3].trim().split(/\s+/)
    rows.push([m[1].replace(/\s+–\s+/, ' – '), (m[2] || '').replace(/\s/g, ''), cal, fat, sodium, carbs, protein].join('\t'))
  }
  fs.writeFileSync(path.join(__dirname, 'raw', 'manchuwok.tsv'), rows.join('\n') + '\n')
  console.log(`manchuwok: ${rows.length} rows`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
