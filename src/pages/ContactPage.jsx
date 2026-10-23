import SEO from '../components/SEO'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DojoSchedule from '../components/DojoSchedule'
import { contact, venues, classSchedule } from '../data/siteData'

export default function ContactPage() {
  const [parameters] = useSearchParams()
  const transaction = ['location', 'interest', 'session'].map((key) => parameters.get(key) || '').join(':')
  return <ContactEnquiry key={transaction} />
}

function ContactEnquiry() {
  const [parameters] = useSearchParams()
  const preferred = ['Wroughton', 'Mevagissey'].includes(parameters.get('location')) ? parameters.get('location') : ''
  const interest = ['Kids', 'Teen-adult', 'Beginner', 'Not sure'].includes(parameters.get('interest')) ? parameters.get('interest') : ''
  const session = classSchedule.find((row) => row.id === parameters.get('session'))
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [mode, setMode] = useState('checking')
  const requestId = useRef(null)
  useEffect(() => {
    let active = true
    window.fetch('/api/enquiry-status', { cache: 'no-store' }).then((response) => response.ok ? response.json() : Promise.reject()).then((data) => { if (active) setMode(data.mode) }).catch(() => { if (active) setMode('disabled') })
    return () => { active = false }
  }, [])
  async function submitEnquiry(event) {
    event.preventDefault()
    if (busy || receipt) return
    setBusy(true); setError(''); setNotice('')
    const form = event.currentTarget
    const fields = ['name', 'email', 'phone', 'location', 'interest', 'message', 'website']
    const input = Object.fromEntries(fields.map((field) => [field, form.elements[field].value.trim()]))
    input.age = Number(form.elements.age.value)
    input.consent = form.elements.consent.checked
    input.session = session?.location === input.location ? session.id : null
    requestId.current ||= window.crypto.randomUUID()
    try {
      const response = await window.fetch('/api/enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': requestId.current }, body: JSON.stringify(input), signal: window.AbortSignal.timeout(15000) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Your enquiry could not be submitted.')
      setReceipt(data.reference)
      setNotice(data.message)
    } catch (failure) { setError(failure.name === 'TimeoutError' ? 'We could not confirm receipt. Your details are still here. Try again without changing them, or contact the club directly.' : failure.message || 'Connection unavailable. Your details are still here; please try again or contact the club directly.') }
    finally { setBusy(false) }
  }
  return (
    <>
      <SEO title="Ask About a Free Karate Trial | Hakuba Wroughton & Mevagissey" description="Enquire about beginner, children's and adult Wado-Ryu karate in Wroughton, Swindon or Mevagissey. Find class times and contact the Hakuba team." />
      <section className="contact-hero">
        <p className="kicker">Contact</p>
        <h1>Your first class<br />starts here.</h1>
        <p>You can come straight to a suitable class, or ask us a question first. Arrive a few minutes early; no booking is needed. We can help you choose a session for yourself or your child.</p>
        <div className="contact-direct"><a href={`tel:${contact.phone.replace(/\s+/g, '')}`}>{contact.phone}</a><a href={`mailto:${contact.email}`}>{contact.email}</a></div>
      </section>

      <section className="contact-layout">
        <form key={`${preferred}-${interest}-${session?.id || ''}`} className="contact-form-panel" onSubmit={submitEnquiry} aria-busy={busy}>
          <h2>Your first step.</h2>
          <p>Tell us about the student and the class you are interested in. You do not need to send an enquiry or book before attending a suitable class.</p>
          <p className="enquiry-mode" role="status">{mode === 'local' ? 'Local preview: use sample details only. Enquiries are saved locally and are not sent to the club.' : mode === 'sendmail' ? 'Your enquiry will be submitted to the club email service.' : mode === 'checking' ? 'Checking enquiry availability…' : 'Online enquiries are not connected here. Please use the club email or phone above.'}</p>
          <div className="enquiry-honeypot" aria-hidden="true"><label htmlFor="website">Leave this field empty</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
          <div className="contact-fields">
            <div className="contact-field"><label htmlFor="name">Your name</label><input id="name" name="name" maxLength="120" autoComplete="name" required /></div>
            <div className="contact-field"><label htmlFor="email">Email</label><input id="email" name="email" maxLength="254" type="email" autoComplete="email" required /></div>
            <div className="contact-field"><label htmlFor="phone">Phone (optional)</label><input id="phone" name="phone" maxLength="40" type="tel" autoComplete="tel" /></div>
            <div className="contact-field"><label htmlFor="age">Student age</label><input id="age" name="age" type="number" min="7" max="120" inputMode="numeric" aria-describedby="age-guidance" required /><small id="age-guidance">Children aged 7+, teenagers and adults.</small></div>
            <div className="contact-field"><label htmlFor="location">Preferred location</label><select id="location" name="location" defaultValue={preferred} required><option value="">Select location</option><option value="Wroughton">Wroughton, Swindon</option><option value="Mevagissey">Mevagissey, Cornwall</option><option>Not sure</option></select></div>
            <div className="contact-field"><label htmlFor="interest">Session interest</label><select id="interest" name="interest" defaultValue={interest} required><option value="">Select session type</option><option value="Kids">Children / 7+</option><option value="Teen-adult">Teenagers / Adults</option><option value="Beginner">Complete beginner</option><option>Not sure</option></select></div>
          </div>
          <label htmlFor="message">Message</label><textarea id="message" name="message" maxLength="3000" rows="5" defaultValue={session ? `I'd like to ask about a free trial for the ${session.audience.toLowerCase()} class in ${session.location}, ${session.day}, ${session.time}.` : ''} required />
          <label className="checkbox-row" htmlFor="consent"><input id="consent" name="consent" type="checkbox" required /><span>I consent to being contacted about karate classes.</span></label>
          <button type="submit" className="cta-button cta-button--primary contact-submit" disabled={busy || Boolean(receipt) || !['local', 'sendmail'].includes(mode)}>{busy ? 'Submitting…' : receipt ? 'Enquiry recorded' : mode === 'local' ? 'Save sample enquiry' : 'Send enquiry'}</button>
          <p className="contact-draft-notice" role="status">{notice}{receipt && <><br />Reference: <strong>{receipt}</strong></>}</p><p className="enquiry-error" role="alert">{error}</p>
          <p>Please do not include medical or sensitive personal information. You can also contact the club directly using the email address or phone number above.</p>
        </form>

        <aside className="contact-support">
          <img className="contact-support__image" src="/images/course-group-practice.jpg" alt="A group of Hakuba students practising movements together at a club course" width="1280" height="960" loading="lazy" />
          <p className="kicker">No experience needed</p>
          <h2>Come along to your first class</h2>
          <ol><li>Choose a suitable session for the student’s age.</li><li>Check the timetable and calendar for changes.</li><li>Wear comfortable training clothes and bring water.</li><li>Arrive a few minutes early to meet your instructor. No booking needed.</li></ol>
          <p><a href={contact.calendarUrl}>Check calendar for venue updates</a></p>
          <h3>Which dojo?</h3><p>Wroughton is our Swindon training location. Mevagissey is our Cornwall dojo. Both teach the same Wado-Ryu karate, with children welcome from age 7.</p>
        </aside>
      </section>

      <DojoSchedule title="Class schedule" compact />

      <section>
        <p className="kicker">Where to train</p><h2>Two dojos. One welcoming club.</h2>
        <div className="contact-venues">{venues.filter((venue) => venue.primary).map((venue) => <article key={venue.name}><h3>{venue.area} <small>{venue.area === 'Wroughton' ? 'Swindon' : 'Cornwall'}</small></h3><address><strong>{venue.name}</strong><br />{venue.address}</address><Link to={`/locations/${venue.area.toLowerCase()}`}>Venue and class details</Link></article>)}</div>
        <p>We also train once a month at Winterbourne Monkton Community Hall. This monthly session is not listed in the weekly timetable above; check the <a href={contact.calendarUrl}>club calendar</a> for dates and venue updates before travelling.</p>
      </section>
    </>
  )
}
