// Rebuild accessible reading data from the club's public PDFs, never the private app.
// Requires pdftotext. Reuses public/resources/syllabus originals after initial import.
import { existsSync, writeFileSync, copyFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { syllabusPdfs } from '../src/data/siteData.js'
const colours = ['Red', 'Yellow', 'Orange', 'Green', 'Blue', 'Purple', 'Brown', 'Brown & White', 'Brown & Black', 'Black']
const heading = /^(KIHON-WAZA|RENRAKU-WAZA|UKE |SANBON-GUMITE|OHYO-GUMITE|KIHON-GUMITE|MACHI-OHYO|KATA |JIYU-GUMITE|HIKKI-SHIKEN|DOJO-KUN 道場)/
// Omit recitation content from current reading editions at the club's request.
// Original PDFs remain unchanged and available as historical source documents.
const currentClubSections = sections => sections
  .filter(section => !/^DOJO[- ]KUN/i.test(section.title))
  .map(section => ({ ...section, blocks: section.blocks.map(block => block.replace(/^DOJO-KUN \(Recited in Japanese and English\), as with ALL proceeding grades\.\s*/i, '')).filter(Boolean) }))
const data = syllabusPdfs.map((pdf, i) => {
  const id = i === 9 ? 'shodan' : `${9 - i}th-kyu`.replace('3th', '3rd').replace('2th', '2nd').replace('1th', '1st')
  const destination = `public/resources/syllabus/${id}.pdf`
  const input = existsSync(destination) ? destination : `.local/syllabus-source/${i + 1}.pdf`
  let text = execFileSync('pdftotext', ['-layout', input, '-'], { encoding: 'utf8' })
  // Shodan's fundamentals are printed in two columns. Read down each column.
  if (i === 9) text = text.replace(/1\. Kette-junzuki[\s\S]*?(?=RENRAKU-WAZA)/, block => {
    const items = [...block.matchAll(/(\d+)\.\s+([^\n]+?)(?=\s{3,}\d+\.|\n|$)/g)]
    return items.sort((a, b) => Number(a[1]) - Number(b[1])).map(m => `${m[1]}. ${m[2].trim()}`).join('\n') + '\n\n'
  })
  const sections = [{ title: 'Grading notes', blocks: [] }]
  let paragraph = ''
  const flush = () => { if (paragraph) sections.at(-1).blocks.push(paragraph); paragraph = '' }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\f/g, '').trim()
    if (!line) { flush(); continue }
    if (/^Hakuba Wadoryu|^\d(?:st|nd|rd|th) KYU|^SHODAN/.test(line)) continue
    if (heading.test(line)) { flush(); sections.push({ title: line, blocks: [] }); continue }
    if (/^\d+\./.test(line)) flush()
    paragraph += paragraph ? (paragraph.endsWith('-') ? '' : ' ') + line : line
  }
  flush()
  if (input !== destination) copyFileSync(input, destination)
  return { id, grade: pdf.belt, colour: colours[i], source: pdf.href, pdf: `/resources/syllabus/${id}.pdf`, sections: currentClubSections(sections).filter(s => s.blocks.length || s.title !== 'Grading notes') }
})
const json = JSON.stringify(data, null, 2) + '\n'
writeFileSync('src/data/publicSyllabus.json', json)
writeFileSync('wordpress/hakuba-theme/data/public-syllabus.json', json)
console.log(`Imported ${data.length} public syllabus documents; preserved original PDF files.`)
