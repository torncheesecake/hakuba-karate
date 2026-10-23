import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { House, BookOpen, Footprints, CircleHelp, Ribbon, Hash, Languages, GraduationCap, Trophy, CalendarDays, Search, Layers, Focus, Target, Medal, Flame } from 'lucide-react'

// Embed presentation assets into the existing protected document. The public
// WordPress theme package must never contain the members' app or syllabus.
const root = resolve(import.meta.dirname, '..')
const read = (path) => readFileSync(resolve(root, path))
const fonts = [
  ['Source Sans 3', '400 700', 'source-sans-3-latin-400-700.woff2'],
  ['Oswald', '500 600', 'oswald-latin-500-600.woff2'],
].map(([family, weight, file]) => `@font-face { font-family: '${family}'; font-style: normal; font-weight: ${weight}; font-display: swap; src: url(data:font/woff2;base64,${read('public/fonts/' + file).toString('base64')}) format('woff2'); }`).join('\n')
const skin = `<style id="hakuba-member-skin">\n${fonts}\n${read('private/member-app/site.css').toString()}\n</style>`
const path = resolve(root, 'private/member-app/index.html')
let html = readFileSync(path, 'utf8')
const adaptiveQuiz = '<script id="hakuba-adaptive-quiz">\n' + read('private/member-app/adaptive-quiz.js').toString() + '\n</script>'
html = html.includes('<script id="hakuba-adaptive-quiz">')
  ? html.replace(/<script id="hakuba-adaptive-quiz">[\s\S]*?<\/script>/, () => adaptiveQuiz)
  : html.replace('</head>', () => adaptiveQuiz + '\n</head>')
const achievementIcons = Object.fromEntries(Object.entries({ syllabus: BookOpen, quiz: Target, practice: Flame, study: GraduationCap, grades: Medal, collection: Trophy }).map(([name, Icon]) => [name, renderToStaticMarkup(createElement(Icon, { size: 26, strokeWidth: 1.5, 'aria-hidden': 'true', focusable: 'false' }))]))
const catalogue = '<script id="hakuba-achievement-catalogue">\n' + read('private/member-app/achievement-catalogue.js').toString().replace('/* ACHIEVEMENT_ICONS */ {}', JSON.stringify(achievementIcons)) + '\n</script>'
html = html.includes('<script id="hakuba-achievement-catalogue">')
  ? html.replace(/<script id="hakuba-achievement-catalogue">[\s\S]*?<\/script>/, () => catalogue)
  : html.replace('</head>', () => catalogue + '\n</head>')
if (html.includes('<style id="hakuba-member-skin">')) {
  html = html.replace(/<style id="hakuba-member-skin">[\s\S]*?<\/style>/, () => skin)
} else {
  if (!html.includes('</head>')) throw new Error('Private app head is missing')
  html = html.replace('</head>', () => skin + '\n</head>')
}
// Render installed Lucide icons at build time: no React runtime or remote icon fetch.
const toolIcons = {
  home: House, belts: BookOpen, stances: Footprints, quiz: CircleHelp, 'belt-tying': Ribbon,
  counting: Hash, terminology: Languages, study: GraduationCap,
  achievements: Trophy, calendar: CalendarDays, search: Search,
}
html = html.replace(/(<button class="nav-button(?: active)?" data-tab="([^"]+)">)([\s\S]*?)(<\/button>)/g, (match, start, tab, content, end) => {
  const Icon = toolIcons[tab]
  if (!Icon) return match
  const label = content.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, '').trim()
  const icon = renderToStaticMarkup(createElement(Icon, { size: 18, strokeWidth: 1.75, 'aria-hidden': 'true', focusable: 'false', className: 'member-tool-icon' }))
  return start + icon + '<span>' + label + '</span>' + end
})
html = html.replace(/<span class="study-choice-icon" data-study-icon="(flashcards|focus)">[\s\S]*?<\/span>/g, (match, name) => {
  const icon = renderToStaticMarkup(createElement(name === 'flashcards' ? Layers : Focus, { size: 28, strokeWidth: 1.5, 'aria-hidden': 'true', focusable: 'false' }))
  return '<span class="study-choice-icon" data-study-icon="' + name + '">' + icon + '</span>'
})
html = html.replace(/<span class="member-tool-heading__icon" data-tool-icon="([^"]+)" aria-hidden="true">[\s\S]*?<\/span>/g, (match, name) => {
  const Icon = toolIcons[name]
  if (!Icon) return match
  return '<span class="member-tool-heading__icon" data-tool-icon="' + name + '" aria-hidden="true">' + renderToStaticMarkup(createElement(Icon, { size: 22, strokeWidth: 1.5, 'aria-hidden': 'true', focusable: 'false' })) + '</span>'
})
const presentation = '<script id="hakuba-tool-pages">\n' + read('private/member-app/tool-pages.js').toString() + '\n</script>'
html = html.includes('<script id="hakuba-tool-pages">')
  ? html.replace(/<script id="hakuba-tool-pages">[\s\S]*?<\/script>/, () => presentation)
  : html.replace('</body>', () => presentation + '\n</body>')
// Keep the brand mark self-contained inside the approval-gated app document.
html = html.replace(/(<img class="member-maker-credit__mark" src=")[^"]*(")/, (_, start, end) => start + 'data:image/svg+xml;base64,' + read('private/member-app/assets/artifexa-monogram.svg').toString('base64') + end)
writeFileSync(path, html)
console.log('Updated private member app skin. No public package, session or progress changes.')
