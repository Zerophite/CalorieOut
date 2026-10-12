// Download Subway Canada's nutrition data tables (linked from
// subway.com/en-ca/menunutrition/nutrition) and extract them into
// raw/subway.tsv. Requires `pdftotext` (xpdf or poppler).
//
//   node scripts/menus/fetch-subway.cjs
// Columns: section, group, name, calories, fat, sodium, carbs, protein.
// `section` is the all-caps heading (SANDWICHES, WRAPS…), `group` the
// sub-heading above the row (6" Chicken Subs, Breads, Cheese…).
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')

const PDF = 'https://media.subway.com/dam/urn:aaid:aem:261b4b3a-2da3-43c5-a5f6-77b529ebf134/original/as/CAN_Nutrition_ENG_9-16-26.pdf'
const NUM = /^-?\d+(\.\d+)?$/

;(async () => {
  const res = await fetch(PDF)
  if (!res.ok) throw new Error(`download failed: ${PDF}`)
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sw-'))
  const pdf = path.join(tmp, 'sw.pdf')
  fs.writeFileSync(pdf, Buffer.from(await res.arrayBuffer()))
  execFileSync('pdftotext', ['-table', '-enc', 'UTF-8', pdf, `${pdf}.txt`])

  const rows = []
  let section = ''
  let group = ''
  let pendingName = ''
  for (const raw of fs.readFileSync(`${pdf}.txt`, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    const tokens = line.split(/\s+/)
    let i = tokens.length
    while (i > 0 && NUM.test(tokens[i - 1])) i--
    const nums = tokens.slice(i)
    if (nums.length >= 13) {
      // serving g, cal, fat, sat, trans, chol, sodium, carbs, fibre, sugars, protein, Ca %, Fe %
      const [, cal, fat, , , , sodium, carbs, , , protein] = nums.slice(-13)
      const name = (tokens.slice(0, i).join(' ') || pendingName).replace(/\*+$/, '').replace(/\d\*\*$/, '').trim()
      rows.push([section, group, name.replace(/\s+/g, ' '), cal, fat, sodium, carbs, protein].join('\t'))
      pendingName = ''
      continue
    }
    if (/^(SANDWICHES|WRAPS|SALADS|POWER BOWLS|BREAKFAST|BREADS & CONDIMENTS|DESSERTS & SIDES)$/.test(line)) {
      section = line
      group = ''
      continue
    }
    if (/^(Adults|Nutrition information|information listed|product assembly|\*|\d(?!")|items are|CANADA|October|Serving Size|Values|dressing|sandwiches is)/.test(line)) continue
    // A sub-heading, or a name whose numbers sit on the next line.
    const text = line.split(/\s{2,}/)[0]
    if (/Gluten Free Bread/.test(text)) pendingName = 'Gluten Free Bread (as packaged)'
    else if (!/^(information|\(one)/.test(text)) group = text.replace(/\*+$/, '').trim()
  }
  fs.writeFileSync(path.join(__dirname, 'raw', 'subway.tsv'), rows.join('\n') + '\n')
  console.log(`subway: ${rows.length} rows`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
