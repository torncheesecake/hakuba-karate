// Deterministic practice policy. The host owns storage, UI, clocks and rewards.
(() => {
  const LEVELS = ['Foundation', 'Building', 'Challenge'];
  const DAY = 86400000;
  const OUTCOMES = new Set(['correct', 'incorrect', 'skipped']);
  const number = value => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
  const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const level = value => Math.min(2, Math.floor(number(value)));
  const recent = record => (Array.isArray(record?.adaptive?.recent) ? record.adaptive.recent : [])
    .filter(item => item && typeof item.id === 'string' && OUTCOMES.has(item.outcome) && Number.isFinite(item.at))
    .slice(-8);
  const attempted = record => number(record?.lastSeen) > 0 || number(record?.correct) > 0 || number(record?.wrong) > 0 || recent(record).length > 0;
  const isWeak = record => number(record?.wrong) >= 2 || recent(record).slice(-2).some(item => item.outcome !== 'correct');
  const memory = record => {
    const value = object(record?.adaptive?.memory);
    if (value.version !== 1 || !number(value.reviewedAt)) return null;
    return { version: 1, attemptId: String(value.attemptId || ''), reviewedAt: number(value.reviewedAt), dueAt: number(value.dueAt), stabilityDays: Math.min(180, Math.max(.125, number(value.stabilityDays))), level: level(value.level), correctRun: Math.min(100, number(value.correctRun)), reviews: number(value.reviews), lapses: number(value.lapses) };
  };
  const confusions = record => (Array.isArray(record?.adaptive?.confusions) ? record.adaptive.confusions : [])
    .filter(item => item && typeof item.text === 'string' && ['forward', 'reverse'].includes(item.direction) && number(item.count) > 0)
    .map(item => ({ text: item.text, direction: item.direction, count: Math.min(100, number(item.count)), at: number(item.at) }))
    .sort((a, b) => b.count - a.count || b.at - a.at).slice(0, 4);
  const due = (record, now) => {
    const value = memory(record);
    return value ? value.dueAt <= now : attempted(record) && now - number(record?.lastSeen) >= 7 * DAY;
  };
  const recall = (record, now) => {
    const value = memory(record);
    return value ? Math.exp(-Math.max(0, now - value.reviewedAt) / DAY / value.stabilityDays) : 0;
  };
  function learn(record, question, outcome, at, attemptId) {
    const previous = memory(record);
    const correct = outcome === 'correct';
    // Immediate repeats are practice, not evidence of long-term retention.
    const spaced = !previous || at - previous.reviewedAt >= DAY / 48;
    const correctRun = correct ? (previous?.correctRun || 0) + 1 : 0;
    let stabilityDays = previous?.stabilityDays || .5;
    if (!correct) stabilityDays = Math.max(.125, stabilityDays * .4);
    else if (previous && spaced) stabilityDays = Math.min(180, stabilityDays * (1.5 + .6 * (1 - recall(record, at)) + question.difficulty * .15));
    const termLevel = correct ? Math.min(2, (previous?.level || 0) + Number(spaced && correctRun >= 2)) : Math.max(0, (previous?.level || 0) - 1);
    const interval = correct ? Math.max(DAY / 48, -Math.log(.8) * stabilityDays * DAY) : DAY / 144;
    return { version: 1, attemptId: String(attemptId), reviewedAt: at, dueAt: correct && previous && !spaced ? previous.dueAt : at + interval, stabilityDays, level: termLevel, correctRun, reviews: (previous?.reviews || 0) + 1, lapses: (previous?.lapses || 0) + Number(!correct) };
  }
  const stamp = record => [number(record?.lastSeen), String(record?.adaptive?.lastAttemptId || '')];
  const compare = (a, b) => stamp(a)[0] - stamp(b)[0] || stamp(a)[1].localeCompare(stamp(b)[1]);
  const adaptiveTime = record => number(record?.adaptive?.updatedAt) || number(recent(record).at(-1)?.at);
  const compareAdaptive = (a, b) => adaptiveTime(a) - adaptiveTime(b) || stamp(a)[1].localeCompare(stamp(b)[1]);
  const tierState = records => {
    const latest = records.filter(record => record?.adaptive?.version === 1 && adaptiveTime(record) > 0).sort(compareAdaptive).at(-1);
    return { level: level(latest?.adaptive?.level), window: (Array.isArray(latest?.adaptive?.window) ? latest.adaptive.window : []).filter(value => OUTCOMES.has(value)).slice(-4) };
  };
  function random(session) {
    session.seed = (Math.imul(1664525, session.seed) + 1013904223) >>> 0;
    return session.seed / 4294967296;
  }
  function shuffle(items, session) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random(session) * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function validPool(pool) {
    const unique = new Map();
    for (const item of pool || []) {
      if (!item || typeof item.term !== 'string' || typeof item.answer !== 'string' || !item.term.trim() || !item.answer.trim() || !Array.isArray(item.wrong)) continue;
      const wrong = [...new Set(item.wrong.filter(text => typeof text === 'string' && text.trim() && text !== item.answer))];
      if (wrong.length) unique.set(item.term, { ...item, wrong });
    }
    return [...unique.values()];
  }
  function summary(pool, history = {}, now = 0) {
    history = object(history);
    const eligible = validPool(pool);
    const remembered = tierState(eligible.map(term => history[term.term]));
    const records = eligible.map(term => history[term.term]);
    return { level: remembered.level, label: LEVELS[remembered.level], weak: records.filter(isWeak).length, seen: records.filter(attempted).length, total: eligible.length, learning: records.filter(record => memory(record)).length, due: records.filter(record => due(record, now)).length, secure: records.filter(record => { const value = memory(record); return value && value.level === 2 && value.correctRun >= 3 && !isWeak(record) && !due(record, now); }).length, focus: eligible.filter(term => isWeak(history[term.term]) || due(history[term.term], now)).sort((a, b) => recall(history[a.term], now) - recall(history[b.term], now)).slice(0, 3).map(term => term.term) };
  }
  function begin({ pool, history = {}, mode = 'practice', sessionId, now, seed, questionLimit = 10 }) {
    history = object(history);
    const eligible = validPool(pool);
    const remembered = tierState(eligible.map(term => history[term.term]));
    const session = { id: String(sessionId), now: number(now), seed: number(seed) >>> 0, mode, history: { ...history }, pool: eligible, items: [], index: 0, phase: 'question', level: remembered.level, window: remembered.window, reason: remembered.level ? 'Continuing from your recent practice.' : 'Start with two choices and build confidence.', outcomes: [], score: 0, skipped: 0, correctRun: 0, bestRun: 0, categories: {} };
    if (mode === 'daily') {
      session.items = eligible.slice(0, 10);
    } else if (mode === 'weak') {
      session.items = shuffle(eligible, session).sort((a, b) => recall(history[a.term], session.now) - recall(history[b.term], session.now) || number(history[b.term]?.wrong) - number(history[a.term]?.wrong)).slice(0, 10);
    } else {
      const buckets = { weak: [], due: [], unseen: [], review: [] };
      for (const term of eligible) {
        const record = history[term.term];
        const bucket = isWeak(record) ? 'weak' : !attempted(record) ? 'unseen' : due(record, session.now) ? 'due' : 'review';
        buckets[bucket].push(term);
      }
      for (const key of Object.keys(buckets)) buckets[key] = shuffle(buckets[key], session);
      // Among equally eligible terms, revisit the least secure memories first.
      for (const key of ['weak', 'due', 'review']) buckets[key].sort((a, b) => recall(history[a.term], session.now) - recall(history[b.term], session.now));
      // Aim for five weak, three due and two unseen terms; redistribute shortages.
      for (const key of ['weak', 'due', 'unseen', 'weak', 'due', 'weak', 'unseen', 'due', 'weak', 'weak']) {
        const next = buckets[key].shift() || ['weak', 'due', 'unseen', 'review'].map(name => buckets[name]).find(items => items.length)?.shift();
        if (next) session.items.push(next);
      }
    }
    // Short practice keeps the complete syllabus as learning/distractor context.
    // Daily questions stay fixed at their original ten-question cap.
    if (mode !== 'daily') session.items = session.items.slice(0, Math.max(1, Math.min(10, Math.floor(number(questionLimit)))));
    for (const term of session.items) {
      session.categories[term.category] ||= { correct: 0, incorrect: 0, skipped: 0, total: 0 };
      session.categories[term.category].total++;
    }
    if (!session.items.length) session.phase = 'complete';
    else prepare(session);
    return session;
  }
  function prepare(session) {
    const term = session.items[session.index];
    const record = session.history[term.term];
    const learned = memory(record);
    const difficulty = session.mode === 'daily' ? 2 : Math.min(session.level, learned?.level || 0);
    let direction = 'forward';
    let prompt = term.term;
    let correct = term.answer;
    let candidates = term.wrong;
    if (session.mode !== 'daily' && difficulty === 2 && session.index % 2 === 1) {
      const others = shuffle(session.pool.filter(item => item.term !== term.term && item.answer.toLowerCase() !== term.answer.toLowerCase()), session)
        .sort((a, b) => Number(b.category === term.category) - Number(a.category === term.category));
      const alternatives = [...new Set(others.map(item => item.term))];
      if (alternatives.length >= 3) { direction = 'reverse'; prompt = term.answer; correct = term.term; candidates = alternatives; }
    }
    const confused = session.mode === 'daily' ? [] : confusions(record).filter(item => item.direction === direction && candidates.includes(item.text));
    const confusionRank = text => confused.find(item => item.text === text)?.count || 0;
    const distractors = shuffle(candidates, session).sort((a, b) => confusionRank(b) - confusionRank(a)).slice(0, difficulty + 1);
    const texts = shuffle([correct, ...distractors], session);
    const options = texts.map((text, i) => ({ id: `option-${i}`, text }));
    session.question = { id: `${session.id}:${session.index}`, termKey: term.term, category: term.category, prompt, direction, difficulty, correctId: options.find(item => item.text === correct).id, correctText: correct, options };
    session.phase = 'question';
    session.questionReason = !learned ? 'Learning this term: start with two choices.' : isWeak(record) ? 'Revisiting a difficult term, with support matched to your answers.' : due(record, session.now) ? 'A recall check: this term is due for review.' : difficulty === 2 ? 'You have recalled this term across spaced practice. Try a harder question.' : 'Building recall for this term. Consistent, spaced practice unlocks harder questions.';
  }
  function answer(session, { questionId, optionId, skip = false, attemptId, at }) {
    if (!session || session.phase !== 'question' || session.question.id !== questionId || !attemptId || !Number.isFinite(at)) return { accepted: false };
    const question = session.question;
    if (!skip && !question.options.some(option => option.id === optionId)) return { accepted: false };
    const outcome = skip ? 'skipped' : optionId === question.correctId ? 'correct' : 'incorrect';
    const correct = outcome === 'correct';
    session.phase = 'answered';
    session.score += Number(correct);
    session.skipped += Number(skip);
    session.correctRun = correct ? session.correctRun + 1 : 0;
    session.bestRun = Math.max(session.bestRun, session.correctRun);
    session.categories[question.category][outcome]++;
    session.outcomes.push({ term: question.termKey, outcome, difficulty: question.difficulty, direction: question.direction });
    session.window.push(outcome);
    const before = session.level;
    if (session.window.slice(-3).filter(value => value !== 'correct').length >= 2) {
      session.level = Math.max(0, session.level - 1);
      session.window = [];
      session.reason = before ? 'A little more support next: fewer choices and familiar question wording.' : 'Staying at Foundation. Take your time with the meaning; missed terms return in future practice.';
    } else if (session.window.length >= 4 && session.window.slice(-4).filter(value => value === 'correct').length >= 3) {
      session.level = Math.min(2, session.level + 1);
      session.window = [];
      session.reason = session.level === 2 ? 'Good recall. Try four choices and some English-to-Japanese questions.' : 'You are building confidence. Try an extra answer choice.';
    } else {
      session.window = session.window.slice(-4);
      session.reason = correct ? 'Good recall. A few consistent answers will build the challenge.' : 'That term will be prioritised for future review. Take your time.';
    }
    if (before === 2 && session.level === 2 && correct) session.reason = 'Staying at Challenge. Keep checking the meaning carefully.';
    const previous = session.history[question.termKey] || {};
    let confused = confusions(previous);
    if (outcome === 'incorrect') {
      const text = question.options.find(option => option.id === optionId).text;
      const match = confused.find(item => item.text === text && item.direction === question.direction);
      confused = [...confused.filter(item => item !== match), { text, direction: question.direction, count: (match?.count || 0) + 1, at }].sort((a, b) => b.count - a.count || b.at - a.at).slice(0, 4);
    }
    if (correct) confused = confused.map(item => item.direction === question.direction ? { ...item, count: item.count - 1 } : item).filter(item => item.count > 0);
    const learned = learn(previous, question, outcome, at, attemptId);
    const record = {
      ...previous,
      correct: number(previous.correct) + Number(correct),
      wrong: correct ? Math.max(0, number(previous.wrong) - 1) : number(previous.wrong) + 1,
      lastSeen: at,
      adaptive: { ...previous.adaptive, version: 1, updatedAt: at, level: session.level, window: [...session.window], lastAttemptId: String(attemptId), memory: learned, confusions: confused, recent: [...recent(previous), { id: String(attemptId), at, outcome, level: question.difficulty, direction: question.direction }].slice(-8) },
    };
    session.history[question.termKey] = record;
    return { accepted: true, outcome, term: question.termKey, record, correctText: question.correctText, reviewAt: learned.dueAt };
  }
  function next(session, questionId) {
    if (!session || session.phase !== 'answered' || session.question.id !== questionId) return false;
    session.index++;
    if (session.index >= session.items.length) session.phase = 'complete';
    else prepare(session);
    return true;
  }
  function state(session) {
    return { id: session.id, mode: session.mode, phase: session.phase, index: session.index, total: session.items.length, level: session.mode === 'daily' ? 2 : session.level, learningLevel: session.level, label: LEVELS[session.level], reason: session.phase === 'question' ? session.questionReason : session.reason, score: session.score, skipped: session.skipped, bestRun: session.bestRun, correctRun: session.correctRun, question: session.question ? { ...session.question, options: session.question.options.map(option => ({ ...option })) } : null, categories: Object.fromEntries(Object.entries(session.categories).map(([key, value]) => [key, { ...value }])), terms: session.items.map(item => ({ ...item, wrong: [...item.wrong] })), outcomes: session.outcomes.map(item => ({ ...item })) };
  }
  function mergeRecord(local = {}, incoming = {}) {
    local = object(local);
    incoming = object(incoming);
    const newer = compare(local, incoming) >= 0 ? local : incoming;
    const older = newer === local ? incoming : local;
    const adaptiveRecord = [local, incoming].filter(record => record.adaptive?.version === 1 && adaptiveTime(record) > 0).sort(compareAdaptive).at(-1);
    const merged = { ...older, ...newer, correct: Math.max(number(local.correct), number(incoming.correct)), wrong: number(newer.wrong), lastSeen: Math.max(number(local.lastSeen), number(incoming.lastSeen)) };
    if (adaptiveRecord) merged.adaptive = { ...adaptiveRecord.adaptive, updatedAt: adaptiveTime(adaptiveRecord), level: level(adaptiveRecord.adaptive.level), window: (Array.isArray(adaptiveRecord.adaptive.window) ? adaptiveRecord.adaptive.window : []).filter(value => OUTCOMES.has(value)).slice(-4), recent: recent(adaptiveRecord) };
    // Recall and its confusion evidence are one snapshot, independently dated.
    // An older app can update general history without discarding this memory.
    const memoryRecord = [local, incoming].filter(record => memory(record)).sort((a, b) => memory(a).reviewedAt - memory(b).reviewedAt || memory(a).attemptId.localeCompare(memory(b).attemptId)).at(-1);
    if (memoryRecord) merged.adaptive = { ...merged.adaptive, memory: memory(memoryRecord), confusions: confusions(memoryRecord) };
    return merged;
  }
  function mergeHistory(local = {}, incoming = {}) {
    local = object(local);
    incoming = object(incoming);
    return Object.fromEntries([...new Set([...Object.keys(local), ...Object.keys(incoming)])].map(term => [term, mergeRecord(local[term], incoming[term])]));
  }
  window.hakubaAdaptiveQuiz = { begin, answer, next, state, summary, isWeak, mergeHistory, mergeRecord };
})();
