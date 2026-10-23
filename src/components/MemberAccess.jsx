import { useState } from 'react'

export default function MemberAccess() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [loginUrl, setLoginUrl] = useState('')
  async function openApp() {
    setBusy(true)
    setMessage('')
    try {
      const response = await window.fetch('/api/member-session', { cache: 'no-store', credentials: 'same-origin', signal: window.AbortSignal.timeout(8000) })
      const data = await response.json()
      if (!response.ok) { setMessage(data.message || 'Member access is unavailable. Please contact the club.'); setLoginUrl(data.loginUrl === '/wp-login.php?redirect_to=%2Fmember-app%2F' ? data.loginUrl : ''); return }
      window.location.assign('/member-app/')
    } catch { setMessage('Member access is not connected on this preview. Please contact the club for help with your account.') }
    finally { setBusy(false) }
  }
  return <section className="member-access" id="member-access" aria-labelledby="member-access-title">
    <h3 id="member-access-title">Welcome to your member app</h3>
    <p>Sign in to keep practising between classes. Your account needs club approval before you can use the app.</p>
    <button className="cta-button" type="button" onClick={openApp} disabled={busy}>{busy ? 'Checking member access…' : 'Sign in or open member app'}</button>
    <p role="status">{message}</p>
    {loginUrl && <a className="editorial-link" href={loginUrl}>Sign in with your club account</a>}
    <p>New to the app? <a href="/contact">Ask the club about registration</a>. Already registered? <a href="/contact">Get help with your account or approval</a>.</p>
  </section>
}
