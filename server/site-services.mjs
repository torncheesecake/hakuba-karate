import { randomUUID, createHash } from 'node:crypto'
import { mkdir, readFile, writeFile, open, rename } from 'node:fs/promises'
import { resolve, sep } from 'node:path'
import { spawn } from 'node:child_process'
import { classSchedule } from '../src/data/siteData.js'

const locations = ['Wroughton', 'Mevagissey', 'Not sure']
const interests = ['Kids', 'Teen-adult', 'Beginner', 'Not sure']
const emailPattern = /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/
const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const safeJSON = (data) => JSON.stringify(data).replace(/</g, '\\u003c')

function reply(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' })
  res.end(JSON.stringify(data))
}

function badRequest(message, status = 400) { return Object.assign(new Error(message), { status }) }

async function bodyJSON(req, limit = 12000) {
  if (!String(req.headers['content-type']).startsWith('application/json')) throw badRequest('Use JSON for this request.', 415)
  let size = 0
  const chunks = []
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) throw badRequest('Your message is too long.', 413)
    chunks.push(chunk)
  }
  try { return JSON.parse(Buffer.concat(chunks).toString()) } catch { throw badRequest('The enquiry could not be read.') }
}

function validate(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw badRequest('Check your enquiry details.')
  const fields = {}
  for (const [key, max] of Object.entries({ name: 120, email: 254, phone: 40, location: 30, interest: 30, message: 3000 })) {
    if (typeof input[key] !== 'string' || input[key].length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(input[key])) throw badRequest(`Check the ${key} field.`)
    fields[key] = input[key].trim()
  }
  if (!fields.name || !fields.message || !emailPattern.test(fields.email) || /[\r\n]/.test(fields.name + fields.phone)) throw badRequest('Please check your name, email and message.')
  if (!locations.includes(fields.location) || !interests.includes(fields.interest)) throw badRequest('Choose a location and session interest.')
  if (!Number.isInteger(input.age) || input.age < 7 || input.age > 120 || input.consent !== true) throw badRequest('Check the student age and contact permission.')
  if (input.session && !classSchedule.some((row) => row.id === input.session && row.location === fields.location)) throw badRequest('Check your preferred class and location.')
  return { ...fields, age: input.age, consent: true, session: input.session || null }
}

function deliverWithSendmail(binary, email, recipient, from, reference) {
  if (!binary?.startsWith('/') || !emailPattern.test(recipient || '') || !emailPattern.test(from || '')) throw badRequest('Enquiry delivery is not configured. Please use the club contact details.', 503)
  return new Promise((done, reject) => {
    const child = spawn(binary, ['-i', '-t'], { stdio: ['pipe', 'ignore', 'ignore'] })
    const timer = setTimeout(() => { child.kill(); reject(badRequest('Delivery could not be confirmed. Please contact the club and quote your reference.', 503)) }, 10000)
    child.on('error', () => { clearTimeout(timer); reject(badRequest('Enquiry delivery is unavailable. Please contact the club.', 503)) })
    child.on('close', (code) => { clearTimeout(timer); code === 0 ? done() : reject(badRequest('Enquiry delivery is unavailable. Please contact the club.', 503)) })
    child.stdin.on('error', () => {})
    const text = Object.entries(email).map(([key, value]) => `${key}: ${value}`).join('\n')
    child.stdin.end(`To: ${recipient}\nFrom: ${from}\nReply-To: ${email.email}\nSubject: Hakuba class enquiry ${reference}\nMIME-Version: 1.0\nContent-Type: text/plain; charset=UTF-8\n\n${text}\n`)
  })
}

export function createSiteServices({ root, env = process.env, development = false }) {
  const requestedMode = env.HAKUBA_ENQUIRY_MODE || (development ? 'local' : 'disabled')
  const mode = requestedMode === 'local' && !development ? 'disabled' : requestedMode
  const storage = resolve(env.HAKUBA_DATA_DIR || resolve(root, '.local/enquiries'))
  for (const directory of ['public', 'dist']) {
    const publicPath = resolve(root, directory)
    if (storage === publicPath || storage.startsWith(publicPath + sep)) throw new Error('Enquiry storage must be outside public assets.')
  }
  const buckets = new Map()
  const active = new Set()
  const recipients = { Wroughton: env.HAKUBA_ENQUIRY_TO_WROUGHTON, Mevagissey: env.HAKUBA_ENQUIRY_TO_MEVAGISSEY, 'Not sure': env.HAKUBA_ENQUIRY_TO_GENERAL }
  const origin = env.HAKUBA_PUBLIC_ORIGIN

  function rateLimit(req) {
    const now = Date.now()
    for (const [key, value] of buckets) if (value.until < now) buckets.delete(key)
    const key = req.socket.remoteAddress
    const bucket = buckets.get(key) || { count: 0, until: now + 600000 }
    if (buckets.size > 10000 || ++bucket.count > 8) throw badRequest('Too many attempts. Please wait or contact the club directly.', 429)
    buckets.set(key, bucket)
  }

  async function memberSession(req) {
    if (!env.HAKUBA_WORDPRESS_ORIGIN) throw badRequest('Member sign-in is not connected on this preview.', 503)
    const wp = new URL(env.HAKUBA_WORDPRESS_ORIGIN)
    if (wp.protocol !== 'https:' && !(development && wp.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(wp.hostname))) throw badRequest('Member sign-in is unavailable.', 503)
    const cookies = String(req.headers.cookie || '').split(';').map((value) => value.trim()).filter((value) => /^wordpress_logged_in_[a-f0-9]+=/.test(value)).join('; ')
    if (!cookies || cookies.length > 8192) throw badRequest('Please sign in with your approved club account.', 401)
    const endpoint = new URL('/wp-admin/admin-ajax.php?action=hakuba_site_member_session', wp)
    const result = await fetch(endpoint, { headers: { Cookie: cookies }, redirect: 'error', signal: AbortSignal.timeout(4000) })
    if (!result.ok) throw badRequest('Your account needs club approval before you can use the app.', result.status === 401 ? 401 : 403)
    const text = await result.text()
    if (text.length > 16000) throw badRequest('Member sign-in is unavailable.', 503)
    const session = JSON.parse(text)
    if (!session || typeof session.approved !== 'boolean') throw badRequest('Member sign-in is unavailable.', 503)
    if (session.approved !== true) throw badRequest('Your account needs club approval before you can use the app.', 403)
    if (!Number.isSafeInteger(session.user?.id) || session.user.id < 1 || typeof session.nonce !== 'string' || !session.nonce) throw badRequest('Member sign-in is unavailable.', 503)
    return { user: { id: session.user.id, displayName: String(session.user.displayName || 'Member'), email: String(session.user.email || '') }, nonce: session.nonce, logoutNonce: session.logoutNonce, cookies, wp }
  }

  return async function siteServices(req, res, next) {
    let pathname
    try { pathname = new URL(req.url, 'http://localhost').pathname } catch { return reply(res, 400, { message: 'Invalid request address.' }) }
    const memberRoute = /^\/member-app(?:\/|$)/i.test(pathname)
    if (!pathname.startsWith('/api/') && !memberRoute) return next()
    try {
      if (pathname === '/api/enquiry-status' && req.method === 'GET') return reply(res, 200, { mode: ['local', 'sendmail'].includes(mode) ? mode : 'disabled' })
      if (pathname === '/api/enquiries' && req.method === 'POST') {
        // Browsers must send a same-origin JSON request. Never trust proxy Host headers as an allowlist.
        const expected = origin || (development ? `http://${req.headers.host}` : '')
        if (!expected || req.headers.origin !== expected || req.headers['sec-fetch-site'] === 'cross-site') throw badRequest('Please submit the form from this website.', 403)
        rateLimit(req)
        if (!['local', 'sendmail'].includes(mode)) throw badRequest('Online enquiries are not connected yet. Please use the club email or phone.', 503)
        const id = req.headers['idempotency-key']
        if (!idPattern.test(id || '')) throw badRequest('Please reload the form and try again.')
        const input = await bodyJSON(req)
        if (input.website) throw badRequest('This enquiry could not be accepted.')
        const enquiry = validate(input)
        if (mode === 'sendmail' && (!env.HAKUBA_SENDMAIL_PATH?.startsWith('/') || !emailPattern.test(recipients[enquiry.location] || '') || !emailPattern.test(env.HAKUBA_ENQUIRY_FROM || ''))) throw badRequest('Enquiry delivery is not configured. Please use the club email or phone.', 503)
        const digest = createHash('sha256').update(JSON.stringify(enquiry)).digest('hex')
        if (active.has(id)) throw badRequest('This enquiry is already being processed.', 409)
        active.add(id)
        try {
          await mkdir(storage, { recursive: true, mode: 0o700 })
          const file = resolve(storage, `${id}.json`)
          const reference = `HK-${id.slice(0, 8).toUpperCase()}`
          const receipt = { reference, mode, message: mode === 'local' ? 'Saved in this local preview only. Nothing has been sent to the club. Please use sample details here.' : 'Your enquiry has been accepted by the club email service. This is not a class booking; please wait for the club to confirm.' }
          let previous
          try { previous = JSON.parse(await readFile(file, 'utf8')) } catch (error) { if (error.code !== 'ENOENT') throw error }
          if (previous) {
            if (previous.digest !== digest) throw badRequest('These details changed. Please start a new enquiry.', 409)
            if (previous.status === 'accepted') return reply(res, 200, previous.receipt)
            throw badRequest(`Receipt ${reference} needs a delivery check. Please contact the club rather than submitting again.`, 503)
          }
          const record = { reference, digest, createdAt: new Date().toISOString(), status: 'pending', enquiry, receipt }
          const handle = await open(file, 'wx', 0o600)
          try { await handle.writeFile(JSON.stringify(record)); await handle.sync() } finally { await handle.close() }
          if (mode === 'sendmail') await deliverWithSendmail(env.HAKUBA_SENDMAIL_PATH, enquiry, recipients[enquiry.location], env.HAKUBA_ENQUIRY_FROM, reference)
          const temporary = `${file}.${randomUUID()}.tmp`
          await writeFile(temporary, JSON.stringify({ ...record, status: 'accepted' }), { flag: 'wx', mode: 0o600 })
          await rename(temporary, file)
          return reply(res, 201, receipt)
        } finally { active.delete(id) }
      }
      if (pathname === '/api/member-progress' && ['GET', 'POST', 'PUT'].includes(req.method)) {
        const session = await memberSession(req)
        if (req.headers['x-hakuba-member-id'] !== String(session.user.id)) throw badRequest('Your signed-in account changed. Please reopen the app.', 409)
        if (req.method !== 'GET') {
          const expected = origin || (development ? `http://${req.headers.host}` : '')
          if (!expected || req.headers.origin !== expected) throw badRequest('Please use the member app on this website.', 403)
        }
        const payload = req.method === 'GET' ? undefined : JSON.stringify(await bodyJSON(req, 524288))
        const result = await fetch(new URL('/wp-json/hakuba-app/v1/progress', session.wp), {
          method: req.method, headers: { Cookie: session.cookies, 'X-WP-Nonce': session.nonce, 'Content-Type': 'application/json' }, body: payload, redirect: 'error', signal: AbortSignal.timeout(5000),
        })
        if (!result.ok) throw badRequest('Training progress could not be synchronised. Your local progress is unchanged.', result.status === 403 ? 403 : 503)
        return reply(res, 200, await result.json())
      }
      if (pathname === '/api/member-logout' && req.method === 'POST') {
        const expected = origin || (development ? `http://${req.headers.host}` : '')
        if (!expected || req.headers.origin !== expected) throw badRequest('Please sign out from this website.', 403)
        const session = await memberSession(req)
        if (req.headers['x-hakuba-member-id'] !== String(session.user.id)) throw badRequest('Your signed-in account changed. Please reopen the app.', 409)
        if (!session.logoutNonce) throw badRequest('Sign-out is unavailable. Please contact the club.', 503)
        const result = await fetch(new URL('/wp-admin/admin-ajax.php?action=hakuba_site_member_logout', session.wp), {
          method: 'POST', headers: { Cookie: session.cookies, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ _ajax_nonce: session.logoutNonce }), redirect: 'error', signal: AbortSignal.timeout(5000),
        })
        if (!result.ok) throw badRequest('Sign-out could not be confirmed. Please try again.', 503)
        return reply(res, 200, { signedOut: true })
      }
      if ((memberRoute || pathname === '/api/member-session') && req.method === 'GET') {
        const session = await memberSession(req)
        if (!memberRoute) return reply(res, 200, { approved: true, userId: session.user.id })
        if (!['/member-app', '/member-app/', '/member-app/index.html'].includes(pathname)) return reply(res, 404, { message: 'Not found.' })
        const html = await readFile(resolve(root, 'private/member-app/index.html'), 'utf8')
        const config = { user: session.user, nonce: session.nonce, wpOrigin: session.wp.origin }
        const script = `<script>window.HAKUBA_APPROVED_SESSION=${safeJSON(config)};</script><script src="/member-session.js"></script>`
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "frame-ancestors 'self'" })
        return res.end(html.replace('<head>', `<head>${script}`))
      }
      return reply(res, 404, { message: 'Not found.' })
    } catch (error) {
      return reply(res, error.status || 503, { message: error.status ? error.message : 'This service is temporarily unavailable. Please contact the club directly.', ...(error.status === 401 && env.HAKUBA_WORDPRESS_ORIGIN ? { loginUrl: '/wp-login.php?redirect_to=%2Fmember-app%2F' } : {}) })
    }
  }
}
