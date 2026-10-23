import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import vm from 'node:vm'
import assert from 'node:assert/strict'

const root = resolve(import.meta.dirname, '..')
const html = readFileSync(`${root}/private/member-app/index.html`, 'utf8')
const literal = html.match(/const quizTerms = (\[[\s\S]*?\n            \]);/)
if (!literal) throw new Error('Canonical quiz pool not found')

const context = vm.createContext({ window: {} })
new vm.Script(readFileSync(`${root}/private/member-app/adaptive-quiz.js`, 'utf8')).runInContext(context)
const api = context.window.hakubaAdaptiveQuiz
const all = vm.runInContext(`(${literal[1]})`, context)
const pool = all.filter(term => ['9th', '8th'].includes(term.belt))
if (pool.length < 10) throw new Error('Selected syllabus fixture unexpectedly small')

const day = 86400000
const now = Date.UTC(2026, 9, 21, 10)
const checks = []
let sequence = 0
function begin(history = {}, mode = 'practice', time = now, seed = 4, items = pool) {
  return api.begin({ pool: items, history, mode, now: time, seed, sessionId: `fixture-${time}-${seed}` })
}
function reply(session, correct = true, time = now, skip = false) {
  const question = api.state(session).question
  return api.answer(session, {
    questionId: question.id,
    optionId: correct ? question.correctId : question.options.find(option => option.id !== question.correctId).id,
    skip,
    attemptId: `attempt-${++sequence}`,
    at: time,
  })
}
function check(name, run) {
  run()
  checks.push(name)
}

check('canonical syllabus ceiling and ten unique terms', () => {
  const state = api.state(begin())
  assert.equal(state.total, 10)
  assert.equal(new Set(state.terms.map(term => term.term)).size, 10)
  assert.ok(state.terms.every(term => pool.some(eligible => eligible.term === term.term)))
})

const history = {}
const term = pool[0]
check('wrong answer creates per-term memory and confusion', () => {
  const session = begin({}, 'practice', now, 4, [term])
  const question = api.state(session).question
  const answer = reply(session, false)
  assert.equal(answer.accepted, true)
  assert.equal(answer.record.adaptive.memory.level, 0)
  assert.equal(answer.reviewAt, now + 600000)
  assert.equal(answer.record.adaptive.confusions[0].text, question.options.find(option => option.id !== question.correctId).text)
  history[term.term] = answer.record
})

check('duplicate answer and stale next cannot change progress', () => {
  const session = begin()
  const question = api.state(session).question
  assert.equal(reply(session).accepted, true)
  assert.equal(reply(session).accepted, false)
  assert.equal(api.next(session, 'stale'), false)
  assert.equal(api.next(session, question.id), true)
  assert.equal(api.next(session, question.id), false)
})

check('immediate correct repeat does not inflate memory or extend due', () => {
  const session = begin(history, 'practice', now + 60000, 4, [term])
  const answer = reply(session, true, now + 60000)
  const previous = history[term.term].adaptive.memory
  assert.equal(answer.record.adaptive.memory.stabilityDays, previous.stabilityDays)
  assert.equal(answer.record.adaptive.memory.level, previous.level)
  assert.equal(answer.reviewAt, previous.dueAt)
  history[term.term] = answer.record
})

check('spaced recall raises per-term level and review interval', () => {
  for (let index = 1; index <= 4; index++) {
    const at = now + index * day
    const session = begin(history, 'practice', at, 4, [term])
    history[term.term] = reply(session, true, at).record
  }
  const memory = history[term.term].adaptive.memory
  assert.equal(memory.level, 2)
  assert.ok(memory.stabilityDays > .5)
  assert.ok(memory.dueAt > memory.reviewedAt + 600000)
})

check('different terms retain different support levels', () => {
  const strong = history[term.term]
  const seeded = { ...history, [term.term]: { ...strong, adaptive: { ...strong.adaptive, level: 2, window: [] } } }
  const known = api.state(begin(seeded, 'practice', now + 5 * day, 9, [term]))
  const unknown = api.state(begin(seeded, 'practice', now + 5 * day, 9, [pool[1]]))
  assert.equal(known.question.difficulty, 2)
  assert.equal(unknown.question.difficulty, 0)
})

check('memory and confusions survive JSON reload and newer legacy merge', () => {
  const restored = JSON.parse(JSON.stringify(history))
  const previous = restored[term.term]
  const merged = api.mergeRecord(previous, { correct: 99, wrong: 0, lastSeen: now + 100 * day })
  assert.equal(merged.adaptive.memory.reviewedAt, previous.adaptive.memory.reviewedAt)
  assert.equal(merged.adaptive.memory.level, previous.adaptive.memory.level)
  assert.equal(JSON.stringify(merged.adaptive.confusions), JSON.stringify(previous.adaptive.confusions))
})

check('daily selection and question options do not depend on memory', () => {
  const first = begin({}, 'daily', now, 88)
  const second = begin(history, 'daily', now, 88)
  for (let index = 0; index < 10; index++) {
    const a = api.state(first), b = api.state(second)
    assert.equal(JSON.stringify(a.question.options), JSON.stringify(b.question.options))
    assert.equal(a.question.prompt, b.question.prompt)
    assert.equal(a.question.difficulty, 2)
    reply(first, true, now + index)
    reply(second, false, now + index)
    api.next(first, a.question.id)
    api.next(second, b.question.id)
  }
})

check('all skipped round remains zero with a ten-question denominator', () => {
  const session = begin()
  for (let index = 0; index < 10; index++) {
    const question = api.state(session).question
    reply(session, false, now + index, true)
    api.next(session, question.id)
  }
  const result = api.state(session)
  assert.equal(result.phase, 'complete')
  assert.equal(result.score, 0)
  assert.equal(result.skipped, 10)
  assert.equal(result.total, 10)
})

check('weak mode supports a single term; history stays bounded', () => {
  const records = {}
  for (let index = 0; index < 18; index++) {
    const at = now + index * day
    const session = begin(records, 'weak', at, 1, [term])
    records[term.term] = reply(session, false, at).record
    assert.equal(api.state(session).total, 1)
  }
  assert.ok(records[term.term].adaptive.recent.length <= 8)
  assert.ok(records[term.term].adaptive.confusions.length <= 4)
  assert.equal(api.summary([term], records, now + 30 * day).due, 1)
})

check('short rounds retain full syllabus learning context; daily ignores limit', () => {
  const records = { [pool.at(-1).term]: { adaptive: { version: 1, updatedAt: now, level: 2, window: [] } } }
  const short = api.begin({ pool, history: records, mode: 'practice', sessionId: 'short', now, seed: 5, questionLimit: 5 })
  assert.equal(api.state(short).total, 5)
  assert.equal(api.state(short).learningLevel, 2)
  assert.equal(short.pool.length, pool.length)
  const daily = api.begin({ pool, history: records, mode: 'daily', sessionId: 'daily', now, seed: 5, questionLimit: 1 })
  assert.equal(api.state(daily).total, 10)
})

console.log(JSON.stringify({
  source: 'Actual adaptive engine and canonical Red/Yellow terms',
  canonicalTerms: all.length,
  eligibleTerms: pool.length,
  passed: checks.length,
  checks,
  scope: 'Synthetic in-memory data only; no browser account, network or member storage accessed',
}, null, 2))
