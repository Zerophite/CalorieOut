// Download Thai Express's nutrition chart (linked from thaiexpress.ca/nutritional-facts)
// and extract it into raw/thaiexpress.tsv. Requires `pdftotext` (xpdf or poppler).
//
//   node scripts/menus/fetch-thaiexpress.cjs
// Columns: section, name, calories, fat, sodium, carbs, protein. Rows keep the
// chart's order: repeated dish names are its vegan / gluten-friendly versions,
// told apart by icons (see gen-thaiexpress.ts).
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')

const PDF = 'https://thaiexpress.ca/wp-content/uploads/2024/10/Nutrional_Info_Update_ENG.pdf'

;(async () => {
  const res = await fetch(PDF)
  if (!res.ok) throw new Error(`download failed: ${PDF}`)
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tx-'))
  const pdf = path.join(tmp, 'tx.pdf')
  fs.writeFileSync(pdf, Buffer.from(await res.arrayBuffer()))
  execFileSync('pdftotext', ['-table', '-enc', 'UTF-8', pdf, `${pdf}.txt`])

  const rows = []
  let section = ''
  for (const raw of fs.readFileSync(`${pdf}.txt`, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    const sec = line.match(/^(\d)\.\s+([A-Z&' ]+?)(\s{2,}|$)/)
    if (sec) {
      section = `${sec[1]}. ${sec[2].trim()}`
      continue
    }
    const tokens = line.split(/\s+/)
    let i = tokens.length
    while (i > 0 && /^\d+(\.\d+)?$/.test(tokens[i - 1])) i--
    const nums = tokens.slice(i)
    if (!section || nums.length < 13) continue
    // Last 13 columns: calories, fat, sat, trans, cholesterol, sodium, carbs,
    // sugars, fibre, protein, potassium %, calcium %, iron %.
    const [cal, fat, , , , sodium, carbs, , , protein] = nums.slice(-13)
    // The name is the text before the numbers, minus any serving column (g / oz / ml).
    const name = line.split(/\s{2,}/)[0].trim()
    rows.push([section, name, cal, fat, sodium, carbs, protein].join('\t'))
  }
  fs.writeFileSync(path.join(__dirname, 'raw', 'thaiexpress.tsv'), rows.join('\n') + '\n')
  console.log(`thaiexpress: ${rows.length} rows`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
