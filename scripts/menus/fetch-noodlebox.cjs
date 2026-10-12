// Download Noodlebox's nutritional guide spreadsheet (linked as "Nutritional
// Guide" in the noodlebox.ca footer) and extract it into raw/noodlebox.tsv.
//
//   node scripts/menus/fetch-noodlebox.cjs
// Columns: section, name, serving, calories, fat, sodium, carbs, protein, fibre.
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const XLSX = 'https://noodlebox.ca/wp-content/uploads/2026/08/NoodleboxNAGuide-August2026.xlsx'

/** Minimal .xlsx (zip) reader: returns { 'xl/…xml': text } using the central directory. */
function unzip(buf) {
  const files = {}
  let eocd = buf.length - 22
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--
  let p = buf.readUInt32LE(eocd + 16)
  const count = buf.readUInt16LE(eocd + 10)
  for (let i = 0; i < count; i++) {
    const method = buf.readUInt16LE(p + 10)
    const size = buf.readUInt32LE(p + 20)
    const nameLen = buf.readUInt16LE(p + 28)
    const extraLen = buf.readUInt16LE(p + 30)
    const commentLen = buf.readUInt16LE(p + 32)
    const local = buf.readUInt32LE(p + 42)
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen)
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28)
    const data = buf.subarray(start, start + size)
    if (/\.xml$/.test(name)) files[name] = (method === 8 ? zlib.inflateRawSync(data) : data).toString('utf8')
    p += 46 + nameLen + extraLen + commentLen
  }
  return files
}
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")

;(async () => {
  const res = await fetch(XLSX, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`download failed: ${XLSX}`)
  const files = unzip(Buffer.from(await res.arrayBuffer()))
  const strings = [...files['xl/sharedStrings.xml'].matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
    decode([...m[1].matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map((x) => x[1]).join('')),
  )
  const sheet = files['xl/worksheets/sheet1.xml'] // "Nutritional's"
  const rows = [...sheet.matchAll(/<row [^>]*>([\s\S]*?)<\/row>/g)].map((r) => {
    const cells = {}
    for (const c of r[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const v = (c[3] || '').match(/<v>([^<]*)<\/v>/)
      if (!v) continue
      cells[c[1]] = /t="s"/.test(c[2]) ? strings[+v[1]] : v[1]
    }
    return cells
  })

  const out = []
  let section = ''
  let started = false
  for (const r of rows) {
    const a = (r.A || '').replace(/\s+/g, ' ').trim()
    if (/^Menu Item/.test(a)) { started = true; continue }
    if (!started || !a) continue
    if (r.C === undefined) { section = a; continue }
    // Columns: B serving, C kcal, D fat, E sat, F trans, G chol, H carbs, I fibre, J sugars, K protein, L sodium.
    out.push([section, a, (r.B || '').trim(), r.C, r.D, r.L, r.H, r.K, r.I].join('\t'))
  }
  fs.writeFileSync(path.join(__dirname, 'raw', 'noodlebox.tsv'), out.join('\n') + '\n')
  console.log(`noodlebox: ${out.length} rows`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
