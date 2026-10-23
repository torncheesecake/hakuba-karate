/* The server supplies identity only after checking the existing WordPress session and approval. */
(() => {
  const session = window.HAKUBA_APPROVED_SESSION
  const config = session?.session || {}
  let accessUrl = new URL('/app#member-access', window.location.origin)
  let denied = false
  let refreshTimer
  function denyAccess() {
    denied = true
    window.clearInterval(refreshTimer)
    window.HAKUBA_APPROVED_SESSION = null
    window.HAKUBA_WP_USER = null
    window.HAKUBA_WP_REST_NONCE = ''
    window.currentUser = null
    document.documentElement.style.setProperty('display', 'none', 'important')
    document.body?.replaceChildren()
    window.location.replace(accessUrl.href)
  }
  function sameOriginUrl(value, fallback) {
    const target = value === undefined ? fallback : value
    if (typeof target !== 'string' || !target.trim()) throw new Error('Member endpoint URL required')
    const url = new URL(target, window.location.origin)
    if (url.origin !== window.location.origin || url.username || url.password) throw new Error('Same-origin member endpoint required')
    return url
  }
  let progressUrl, sessionUrl, logoutUrl
  try {
    accessUrl = sameOriginUrl(config.accessUrl, '/app#member-access')
    progressUrl = sameOriginUrl(config.progressUrl, '/api/member-progress')
    sessionUrl = sameOriginUrl(config.sessionUrl, '/api/member-session')
    logoutUrl = sameOriginUrl(config.logoutUrl, '/api/member-logout')
    if (config.storageNamespace !== undefined && (typeof config.storageNamespace !== 'string' || !config.storageNamespace)) throw new Error('Member storage namespace required')
  } catch (error) {
    denyAccess()
    throw error
  }
  if (!Number.isSafeInteger(session?.user?.id) || !session.nonce) {
    denyAccess()
    throw new Error('Approved member session required')
  }
  window.HAKUBA_WORDPRESS_MODE = true
  window.HAKUBA_WP_USER = session.user
  window.HAKUBA_WP_REST_NONCE = session.nonce
  window.HAKUBA_WP_PROGRESS_API_URL = progressUrl.href
  window.HAKUBA_WP_LOGOUT_API_URL = logoutUrl.href
  window.HAKUBA_MEMBER_ACCESS_URL = accessUrl.href
  window.HAKUBA_WP_LOGIN_URL = accessUrl.href
  window.HAKUBA_WP_LOGOUT_URL = accessUrl.href
  const originalFetch = window.fetch.bind(window)
  window.fetch = (input, options = {}) => {
    const address = new URL(input instanceof Request ? input.url : input, document.baseURI)
    if ([progressUrl.href, sessionUrl.href, logoutUrl.href].includes(address.href)) {
      if (denied) return Promise.reject(new Error('Approved member session required'))
      const headers = new Headers(options.headers || (input instanceof Request ? input.headers : undefined))
      headers.set('X-Hakuba-Member-Id', String(session.user.id))
      if ([sessionUrl.href, logoutUrl.href].includes(address.href)) headers.set('X-WP-Nonce', session.nonce)
      options = { ...options, headers, credentials: 'same-origin', redirect: 'error' }
    }
    return originalFetch(input, options)
  }
  // Never import the old browser-global keys into another person's account.
  const prefix = `${config.storageNamespace === undefined ? 'hakuba:wp:' : config.storageNamespace}${session.user.id}:`
  window.hakubaMemberStorage = Object.freeze({
    getItem: (key) => localStorage.getItem(prefix + key),
    setItem: (key, value) => localStorage.setItem(prefix + key, value),
    removeItem: (key) => localStorage.removeItem(prefix + key),
  })
  async function checkSession() {
    if (denied) return
    try {
      const response = await fetch(sessionUrl.href, { cache: 'no-store', credentials: 'same-origin' })
      const data = await response.json()
      if (!response.ok || data.approved !== true || data.userId !== session.user.id) {
        denyAccess()
        return
      }
      if (data.calendar && typeof data.calendar === 'object' && !Array.isArray(data.calendar)) {
        config.calendar = data.calendar
        window.dispatchEvent(new Event('hakuba:calendar-updated'))
      }
    } catch { denyAccess() }
  }
  refreshTimer = window.setInterval(checkSession, 60000)
  window.addEventListener('pageshow', (event) => { if (event.persisted) checkSession() })
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkSession() })
})()
