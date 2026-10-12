// Download KFC Canada's nutrition PDFs (linked from the kfc.ca footer) and
// extract the English tables into raw/kfc.tsv.
// Requires `pdftotext` (xpdf or poppler) on the PATH.
//
//   node scripts/menus/fetch-kfc.cjs
// Columns: source, section, name, serving, calories, fat, sodium, carbs, protein.
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')

const PDFS = {
  main: 'https://assets.ctfassets.net/a2mgcrjjefyo/3AUi2N7aacNo4rjQ1jE3di/ab5513730957082e372dd36fd0a7c950/KFC_Nutritional_Information__W8__EN_FR.pdf',
  kwench: 'https://assets.ctfassets.net/a2mgcrjjefyo/4KTQ7SE0rH4EU9QQSzX8Wr/e46e11513549b216ee8c6f7d57c69fce/_2026__Kwench_by_KFC_Nutritional___Allergen_Information_EN_FR.pdf',
}

function parse(text, src) {
  const rows = []
  let section = ''
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    // The French version follows the English one.
    if (/^PFK|VALEUR NUTRITIVE/.test(line)) break
    if (!line || /^NOTE:|^Updated|^For the French|NUTRITION|Serving Size|Calories\s+Total/.test(line)) continue
    if (/^[A-Z0-9 &'()/\-–]+$/.test(line.replace(/[®*]/g, ''))) {
      section = line.replace(/[®*]/g, '').trim()
      continue
    }
    const nums = line.match(/(?:\s|^)(-?\d+(?:\.\d+)?)(?=\s|$)/g)
    if (!nums || nums.length < 10) continue // wrapped footnote text
    const [cal, fat, , , , sodium, carbs, , , protein] = nums.slice(-10).map((x) => +x.trim())
    let head = line
    for (let i = 0; i < 10; i++) head = head.replace(/\s+-?\d+(?:\.\d+)?\s*$/, '')
    const parts = head.split(/\s{2,}/).map((s) => s.trim()).filter(Boolean)
    let name = parts[0]
    let serving = parts.slice(1).join(' ')
    // Drink rows put the volume right after the name.
    const vol = !serving && name.match(/^(.*?)\s+(\d+ ?ml)$/i)
    if (vol) [name, serving] = [vol[1], vol[2]]
    rows.push([src, section, name.replace(/®/g, ''), serving, cal, fat, sodium, carbs, protein].join('\t'))
  }
  return rows
}

;(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kfc-'))
  const rows = []
  for (const [src, url] of Object.entries(PDFS)) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`download failed: ${url}`)
    const pdf = path.join(tmp, `${src}.pdf`)
    fs.writeFileSync(pdf, Buffer.from(await res.arrayBuffer()))
    execFileSync('pdftotext', ['-table', '-enc', 'UTF-8', pdf, `${pdf}.txt`])
    rows.push(...parse(fs.readFileSync(`${pdf}.txt`, 'utf8'), src))
  }
  fs.writeFileSync(path.join(__dirname, 'raw', 'kfc.tsv'), rows.join('\n') + '\n')
  console.log(`kfc: ${rows.length} rows`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
